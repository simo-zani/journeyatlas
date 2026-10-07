-- Compagni di viaggio "segnaposto".
-- Il proprietario indica chi viaggia con lui anche se non ha un account: sono
-- righe di trip_participants con user_id NULL e un display_name. Quando un
-- amico invitato accetta, sceglie a quale segnaposto collegare il proprio
-- account (la riga segnaposto viene "reclamata": mantiene lo stesso id, così
-- eventuali dati futuri legati al partecipante restano validi).
-- Un segnaposto non dà alcun accesso: le funzioni RLS confrontano user_id con
-- auth.uid(), quindi una riga con user_id NULL non corrisponde mai a nessuno.

ALTER TABLE public.trip_participants ADD COLUMN IF NOT EXISTS display_name text;

-- 1. fetch_trip_participants: aggiunge display_name (cambia il tipo di ritorno, quindi DROP).
DROP FUNCTION IF EXISTS public.fetch_trip_participants(uuid);
CREATE FUNCTION public.fetch_trip_participants(for_trip_id uuid)
RETURNS TABLE(
  participant_id uuid,
  user_id uuid,
  role text,
  status text,
  joined_at timestamptz,
  created_at timestamptz,
  username text,
  avatar_url text,
  display_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tp.id, tp.user_id, tp.role, tp.status, tp.joined_at, tp.created_at,
         p.username, p.avatar_url, tp.display_name
  FROM public.trip_participants tp
  LEFT JOIN public.profiles p ON p.id = tp.user_id
  WHERE tp.trip_id = for_trip_id
    AND (public.is_trip_owner(for_trip_id) OR public.is_trip_participant(for_trip_id))
  ORDER BY tp.created_at ASC;
$$;
GRANT EXECUTE ON FUNCTION public.fetch_trip_participants(uuid) TO authenticated;

-- 2. Segnaposto ancora liberi del viaggio per cui l'utente ha un invito pending.
CREATE OR REPLACE FUNCTION public.fetch_invite_companions(invite_participant_id uuid)
RETURNS TABLE(participant_id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.display_name
  FROM public.trip_participants inv
  JOIN public.trip_participants c ON c.trip_id = inv.trip_id
  WHERE inv.id = invite_participant_id
    AND inv.user_id = auth.uid()
    AND inv.status = 'pending'
    AND c.user_id IS NULL
    AND c.role <> 'owner'
  ORDER BY c.created_at ASC;
$$;
GRANT EXECUTE ON FUNCTION public.fetch_invite_companions(uuid) TO authenticated;

-- 3. respond_to_invite con scelta opzionale del segnaposto da reclamare.
DROP FUNCTION IF EXISTS public.respond_to_invite(uuid, boolean);
CREATE FUNCTION public.respond_to_invite(
  participant_id uuid,
  accept boolean,
  companion_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.trip_participants%ROWTYPE;
BEGIN
  SELECT * INTO inv
  FROM public.trip_participants
  WHERE id = participant_id AND user_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF NOT accept THEN
    UPDATE public.trip_participants SET status = 'declined' WHERE id = inv.id;
    RETURN;
  END IF;

  IF companion_id IS NULL THEN
    UPDATE public.trip_participants SET status = 'accepted', joined_at = now() WHERE id = inv.id;
    RETURN;
  END IF;

  -- Il segnaposto deve essere dello stesso viaggio e ancora libero.
  PERFORM 1 FROM public.trip_participants
   WHERE id = companion_id AND trip_id = inv.trip_id AND user_id IS NULL AND role <> 'owner'
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compagno di viaggio non disponibile';
  END IF;

  -- unique(trip_id, user_id): prima si elimina la riga d'invito, poi si collega il segnaposto.
  DELETE FROM public.trip_participants WHERE id = inv.id;
  UPDATE public.trip_participants
  SET user_id = inv.user_id,
      role = inv.role,
      status = 'accepted',
      invited_by = inv.invited_by,
      joined_at = now()
  WHERE id = companion_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.respond_to_invite(uuid, boolean, uuid) TO authenticated;
