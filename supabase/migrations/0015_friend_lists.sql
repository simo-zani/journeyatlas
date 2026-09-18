-- ============================================================================
-- JourneyAtlas - Amici & richieste ricevute (1.9b)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Aggiunge:
--   1.  get_friends: elenco amici (amicizie accettate)
--   2.  get_incoming_friend_requests: richieste ricevute in stato pending
--   3.  count_incoming_friend_requests: conteggio per il badge in sidebar
-- ============================================================================

-- Amici (amicizie accettate) dell'utente corrente.
CREATE OR REPLACE FUNCTION public.get_friends()
RETURNS TABLE(id uuid, username text, avatar_url text, friend_status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url, 'friends'::text AS friend_status
  FROM public.friendships f
  JOIN public.profiles p
    ON p.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  WHERE f.status = 'accepted'
    AND (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
  ORDER BY p.username;
$$;

GRANT EXECUTE ON FUNCTION public.get_friends() TO authenticated;

-- Richieste di amicizia ricevute (pending), con i dati del richiedente.
CREATE OR REPLACE FUNCTION public.get_incoming_friend_requests()
RETURNS TABLE(id uuid, user_id uuid, username text, avatar_url text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, p.id, p.username, p.avatar_url, f.created_at
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.requester_id
  WHERE f.addressee_id = auth.uid() AND f.status = 'pending'
  ORDER BY f.created_at ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_incoming_friend_requests() TO authenticated;

-- Conteggio richieste ricevute (badge in sidebar).
CREATE OR REPLACE FUNCTION public.count_incoming_friend_requests()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.friendships
  WHERE addressee_id = auth.uid() AND status = 'pending';
$$;

GRANT EXECUTE ON FUNCTION public.count_incoming_friend_requests() TO authenticated;