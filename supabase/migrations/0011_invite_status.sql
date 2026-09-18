-- ============================================================================
-- JourneyAtlas - Flusso invito: status/invited_by su trip_participants + RPC
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Aggiunge lo stato di un invito (pending/accepted/declined) e aggiorna le
-- funzioni helper RLS esistenti (is_trip_owner, is_trip_participant,
-- can_edit_trip) perché un invito "pending" non conceda accesso finché non
-- viene accettato. Le righe già esistenti (i proprietari, inseriti sempre
-- con joined_at impostato) diventano 'accepted' di default.
-- ============================================================================

-- 1. Colonne
ALTER TABLE public.trip_participants
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted'
    CHECK (status IN ('pending', 'accepted', 'declined'));

ALTER TABLE public.trip_participants
  ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Helper RLS: ora richiedono anche status = 'accepted'
CREATE OR REPLACE FUNCTION public.is_trip_owner(trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_participants
    WHERE trip_id = is_trip_owner.trip_id
      AND user_id = auth.uid()
      AND role = 'owner'
      AND status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_trip_participant(trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_participants
    WHERE trip_id = is_trip_participant.trip_id
      AND user_id = auth.uid()
      AND status = 'accepted'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_trip(trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_participants
    WHERE trip_id = can_edit_trip.trip_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
      AND status = 'accepted'
  );
$$;

-- 3. RPC: cerca utenti per username per il modale "Condividi viaggio".
--    security definer perché profiles non consente SELECT su righe altrui
--    (0010_profiles_rls.sql) — qui si espone solo id/username/avatar_url,
--    mai l'email, escludendo se stessi e chi è già coinvolto nel viaggio
--    (qualsiasi stato: pending/accepted/declined, per non re-invitare).
CREATE OR REPLACE FUNCTION public.search_profiles_by_username(search_query text, for_trip_id uuid)
RETURNS TABLE(id uuid, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.username IS NOT NULL
    AND p.username ILIKE (replace(replace(search_query, '\', '\\'), '_', '\_') || '%')
    AND p.id != auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.trip_participants tp
      WHERE tp.trip_id = for_trip_id AND tp.user_id = p.id
    )
  ORDER BY p.username
  LIMIT 10;
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles_by_username(text, uuid) TO authenticated;

-- 4. RPC: elenca gli inviti pending dell'utente corrente, con i dati minimi
--    del viaggio e di chi ha invitato — un pending invitee non è ancora un
--    partecipante "accepted", quindi non potrebbe leggere trips/profiles
--    altrui direttamente.
CREATE OR REPLACE FUNCTION public.fetch_pending_invites()
RETURNS TABLE(
  participant_id uuid,
  trip_id uuid,
  trip_name text,
  trip_cover_image_url text,
  role text,
  invited_by_username text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tp.id, t.id, t.name, t.cover_image_url, tp.role, inviter.username, tp.created_at
  FROM public.trip_participants tp
  JOIN public.trips t ON t.id = tp.trip_id
  LEFT JOIN public.profiles inviter ON inviter.id = tp.invited_by
  WHERE tp.user_id = auth.uid() AND tp.status = 'pending'
  ORDER BY tp.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_pending_invites() TO authenticated;

-- 5. RPC: l'invitato accetta/rifiuta il proprio invito.
--    Un self-UPDATE via RLS avrebbe permesso all'invitato di modificare
--    anche il proprio role — questa RPC aggiorna solo status/joined_at,
--    e solo sulla propria riga pending.
CREATE OR REPLACE FUNCTION public.respond_to_invite(participant_id uuid, accept boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.trip_participants
  SET status = CASE WHEN accept THEN 'accepted' ELSE 'declined' END,
      joined_at = CASE WHEN accept THEN now() ELSE joined_at END
  WHERE id = participant_id
    AND user_id = auth.uid()
    AND status = 'pending';
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_invite(uuid, boolean) TO authenticated;

-- 6. RPC: elenca i partecipanti di un viaggio con i dati profilo essenziali.
--    profiles non consente SELECT su righe altrui (0010), quindi anche qui
--    serve una funzione dedicata invece di un join lato client. Il filtro
--    is_trip_owner/is_trip_participant è su chi CHIAMA la funzione: se non
--    è owner né partecipante accettato di for_trip_id, la query non
--    ritorna nessuna riga (niente enumerazione di viaggi altrui).
CREATE OR REPLACE FUNCTION public.fetch_trip_participants(for_trip_id uuid)
RETURNS TABLE(
  participant_id uuid,
  user_id uuid,
  role text,
  status text,
  joined_at timestamptz,
  created_at timestamptz,
  username text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tp.id, tp.user_id, tp.role, tp.status, tp.joined_at, tp.created_at, p.username, p.avatar_url
  FROM public.trip_participants tp
  LEFT JOIN public.profiles p ON p.id = tp.user_id
  WHERE tp.trip_id = for_trip_id
    AND (public.is_trip_owner(for_trip_id) OR public.is_trip_participant(for_trip_id))
  ORDER BY tp.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.fetch_trip_participants(uuid) TO authenticated;
