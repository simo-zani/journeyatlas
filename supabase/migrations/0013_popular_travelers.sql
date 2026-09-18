-- ============================================================================
-- JourneyAtlas - Viaggiatori popolari (1.9b)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Aggiunge l'RPC `get_popular_travelers`: restituisce i profili più "ricercati"
-- (proxy: numero di viaggi pubblici, poi username) da mostrare di default
-- nella pagina Viaggiatori, con lo stesso shape di search_travelers.
-- ============================================================================

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
  WHERE p.username IS NOT NULL
    AND p.id != auth.uid()
  ORDER BY
    (SELECT COUNT(*) FROM public.trips t WHERE t.owner_id = p.id AND t.is_public) DESC,
    p.username
  LIMIT GREATEST(1, limit_count);
$$;

GRANT EXECUTE ON FUNCTION public.get_popular_travelers(integer) TO authenticated;