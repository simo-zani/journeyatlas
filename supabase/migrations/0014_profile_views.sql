-- ============================================================================
-- JourneyAtlas - Interazioni profili viaggiatori (1.9b)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Sostituisce il ranking dei "più ricercati": prima per numero di viaggi
-- pubblici, ora per INTERAZIONI (visite al profilo).
--
-- Aggiunge:
--   1.  Tabella `profile_views` (visite per coppia profilo+visitatore)
--   2.  RPC `record_profile_view`: +1 per visita, ma al massimo una ogni
--       6 ore per lo stesso utente (anti-frode)
--   3.  RPC `get_popular_travelers` riscritta: classifica per visite totali
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Visite ai profili
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_views (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  view_count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (profile_id, viewer_id)
);

-- Nessuna policy di lettura/scrittura diretta: l'accesso avviene solo tramite
-- le RPC record_profile_view / get_popular_travelers (SECURITY DEFINER).
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2) Registra una visita (+1) con cooldown di 6 ore per visitatore
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_profile_view(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_exists boolean;
  v_last_viewed timestamptz;
BEGIN
  IF target_user_id = auth.uid() THEN
    RETURN false;
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = target_user_id)
  INTO v_target_exists;

  IF NOT v_target_exists THEN
    RETURN false;
  END IF;

  SELECT last_viewed_at INTO v_last_viewed
  FROM public.profile_views
  WHERE profile_id = target_user_id AND viewer_id = auth.uid();

  IF v_last_viewed IS NULL THEN
    INSERT INTO public.profile_views (profile_id, viewer_id, last_viewed_at, view_count)
    VALUES (target_user_id, auth.uid(), now(), 1);
    RETURN true;
  END IF;

  IF v_last_viewed <= now() - interval '6 hours' THEN
    UPDATE public.profile_views
    SET view_count = view_count + 1, last_viewed_at = now()
    WHERE profile_id = target_user_id AND viewer_id = auth.uid();
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_profile_view(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 3) Classifica "più ricercati" per interazioni (visite totali)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_popular_travelers(limit_count integer DEFAULT 10)
RETURNS TABLE(id uuid, username text, avatar_url text, friend_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.status = 'accepted'
          AND ((f.requester_id = p.id AND f.addressee_id = auth.uid())
            OR (f.requester_id = auth.uid() AND f.addressee_id = p.id))
      ) THEN 'friends'
      WHEN EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.requester_id = auth.uid() AND f.addressee_id = p.id
          AND f.status = 'pending'
      ) THEN 'outgoing'
      WHEN EXISTS (
        SELECT 1 FROM public.friendships f
        WHERE f.requester_id = p.id AND f.addressee_id = auth.uid()
          AND f.status = 'pending'
      ) THEN 'incoming'
      ELSE NULL::text
    END AS friend_status
  FROM public.profiles p
  LEFT JOIN (
    SELECT profile_id, SUM(view_count)::bigint AS total_views
    FROM public.profile_views
    GROUP BY profile_id
  ) pv ON pv.profile_id = p.id
  WHERE p.username IS NOT NULL
    AND p.id != auth.uid()
  ORDER BY COALESCE(pv.total_views, 0) DESC, p.username
  LIMIT GREATEST(1, limit_count);
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_travelers(integer) TO authenticated;