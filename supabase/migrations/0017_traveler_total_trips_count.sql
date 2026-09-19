-- ============================================================================
-- JourneyAtlas - Conteggio viaggi totali nel profilo viaggiatore (1.9d)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Modifica get_traveler_profile per restituire sia total_trips_count
-- (conteggio di tutti i viaggi dell'utente) sia public_trips_count.
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_traveler_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_traveler_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  created_at timestamptz,
  friend_status text,
  friendship_id uuid,
  countries_visited bigint,
  continents_visited bigint,
  total_trips_count bigint,
  public_trips_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH cnts AS (
    SELECT
      COUNT(DISTINCT (d.value ->> 'countryCode'))
        FILTER (WHERE d.value ->> 'countryCode' IS NOT NULL AND d.value ->> 'countryCode' <> '') AS countries,
      COUNT(DISTINCT cc.continent)
        FILTER (WHERE cc.continent IS NOT NULL) AS continents
    FROM public.trips t
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(t.destinations, '[]'::jsonb)) AS d
    LEFT JOIN public.country_continents cc
      ON lower(cc.code) = lower(d.value ->> 'countryCode')
    WHERE t.owner_id = target_user_id
  ),
  fs AS (
    SELECT f.id,
      CASE
        WHEN f.status = 'accepted' THEN 'friends'
        WHEN f.status = 'pending' AND f.requester_id = auth.uid() THEN 'outgoing'
        WHEN f.status = 'pending' AND f.addressee_id = auth.uid() THEN 'incoming'
        ELSE NULL::text
      END AS friend_status
    FROM public.friendships f
    WHERE (f.requester_id = auth.uid() AND f.addressee_id = target_user_id)
       OR (f.requester_id = target_user_id AND f.addressee_id = auth.uid())
    ORDER BY CASE WHEN f.status = 'accepted' THEN 0 WHEN f.status = 'pending' THEN 1 ELSE 2 END
    LIMIT 1
  )
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.created_at,
    CASE
      WHEN target_user_id = auth.uid() THEN 'self'
      WHEN fs.friend_status IS NOT NULL THEN fs.friend_status
      ELSE NULL::text
    END,
    fs.id,
    cnts.countries,
    cnts.continents,
    (SELECT COUNT(*) FROM public.trips t2 WHERE t2.owner_id = target_user_id)::bigint AS total_trips_count,
    (SELECT COUNT(*) FROM public.trips t2 WHERE t2.owner_id = target_user_id AND t2.is_public)::bigint AS public_trips_count
  FROM public.profiles p
  CROSS JOIN cnts
  LEFT JOIN fs ON TRUE
  WHERE p.id = target_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_traveler_profile(uuid) TO authenticated;
