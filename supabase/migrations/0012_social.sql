-- ============================================================================
-- JourneyAtlas - Sezione Amici / Viaggiatori (1.9b)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Aggiunge:
--   1.  Tabella `friendships` (richieste di amicizia) + RLS
--   2.  Colonna `is_public` su `trips` (viaggi visibili pubblicamente sul profilo)
--   3.  Tabella `country_continents` (mappa codice paese -> continente)
--   4.  RPC: search_travelers, get_traveler_profile, get_public_trips_for_user,
--       send_friend_request, respond_to_friend_request, set_trip_public
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Trips: visibilità pubblica
-- ----------------------------------------------------------------------------
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- ----------------------------------------------------------------------------
-- 2) Friendships
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT friendships_no_self CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Select: solo chi è coinvolto nella coppia
DROP POLICY IF EXISTS "friendships_select" ON public.friendships;
CREATE POLICY "friendships_select"
  ON public.friendships FOR SELECT
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Insert: solo come richiedente (le richieste nascono da chi le invia)
DROP POLICY IF EXISTS "friendships_insert" ON public.friendships;
CREATE POLICY "friendships_insert"
  ON public.friendships FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Update/Delete: gestiti solo via RPC security definer
-- (send_friend_request / respond_to_friend_request), nessuna policy diretta.

-- ----------------------------------------------------------------------------
-- 3) Country -> Continent
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.country_continents (
  code text PRIMARY KEY,
  continent text NOT NULL
);

GRANT SELECT ON public.country_continents TO authenticated;

INSERT INTO public.country_continents (code, continent) VALUES
  -- Africa
  ('dz','africa'),('ao','africa'),('bj','africa'),('bw','africa'),('bf','africa'),
  ('bi','africa'),('cm','africa'),('cv','africa'),('cf','africa'),('td','africa'),
  ('km','africa'),('cg','africa'),('cd','africa'),('ci','africa'),('dj','africa'),
  ('eg','africa'),('gq','africa'),('er','africa'),('sz','africa'),('et','africa'),
  ('ga','africa'),('gm','africa'),('gh','africa'),('gn','africa'),('gw','africa'),
  ('ke','africa'),('ls','africa'),('lr','africa'),('ly','africa'),('mg','africa'),
  ('mw','africa'),('ml','africa'),('mr','africa'),('mu','africa'),('ma','africa'),
  ('mz','africa'),('na','africa'),('ne','africa'),('ng','africa'),('re','africa'),
  ('rw','africa'),('st','africa'),('sn','africa'),('sc','africa'),('sl','africa'),
  ('so','africa'),('za','africa'),('ss','africa'),('sd','africa'),('tz','africa'),
  ('tg','africa'),('tn','africa'),('ug','africa'),('eh','africa'),('zm','africa'),
  ('zw','africa'),('sh','africa'),
  -- Asia
  ('af','asia'),('am','asia'),('az','asia'),('bh','asia'),('bd','asia'),('bt','asia'),
  ('bn','asia'),('kh','asia'),('cn','asia'),('hk','asia'),('in','asia'),('id','asia'),
  ('ir','asia'),('iq','asia'),('il','asia'),('jp','asia'),('jo','asia'),('kz','asia'),
  ('kw','asia'),('kg','asia'),('la','asia'),('lb','asia'),('mo','asia'),('my','asia'),
  ('mv','asia'),('mn','asia'),('mm','asia'),('np','asia'),('kp','asia'),('om','asia'),
  ('pk','asia'),('ps','asia'),('ph','asia'),('qa','asia'),('sa','asia'),('sg','asia'),
  ('kr','asia'),('lk','asia'),('sy','asia'),('tw','asia'),('tj','asia'),('th','asia'),
  ('tl','asia'),('tr','asia'),('tm','asia'),('ae','asia'),('uz','asia'),('vn','asia'),
  ('ye','asia'),
  -- Europa
  ('al','europe'),('ad','europe'),('at','europe'),('by','europe'),('be','europe'),
  ('ba','europe'),('bg','europe'),('hr','europe'),('cy','europe'),('cz','europe'),
  ('dk','europe'),('ee','europe'),('fo','europe'),('fi','europe'),('fr','europe'),
  ('de','europe'),('gi','europe'),('gr','europe'),('hu','europe'),('is','europe'),
  ('ie','europe'),('it','europe'),('lv','europe'),('li','europe'),('lt','europe'),
  ('lu','europe'),('mt','europe'),('md','europe'),('mc','europe'),('me','europe'),
  ('nl','europe'),('mk','europe'),('no','europe'),('pl','europe'),('pt','europe'),
  ('ro','europe'),('ru','europe'),('sm','europe'),('rs','europe'),('sk','europe'),
  ('si','europe'),('es','europe'),('se','europe'),('ch','europe'),('ua','europe'),
  ('gb','europe'),('va','europe'),('ax','europe'),('gg','europe'),('je','europe'),
  ('im','europe'),('xk','europe'),('ge','europe'),
  -- Nord America
  ('ag','north-america'),('bs','north-america'),('bb','north-america'),('bz','north-america'),
  ('bm','north-america'),('ca','north-america'),('cr','north-america'),('cu','north-america'),
  ('dm','north-america'),('do','north-america'),('sv','north-america'),('gd','north-america'),
  ('gt','north-america'),('ht','north-america'),('hn','north-america'),('jm','north-america'),
  ('mx','north-america'),('ni','north-america'),('pa','north-america'),('kn','north-america'),
  ('lc','north-america'),('vc','north-america'),('tt','north-america'),('us','north-america'),
  ('ai','north-america'),('aw','north-america'),('bl','north-america'),('bq','north-america'),
  ('cw','north-america'),('gl','north-america'),('gp','north-america'),('mq','north-america'),
  ('ms','north-america'),('pr','north-america'),('sx','north-america'),('tc','north-america'),
  ('vg','north-america'),('vi','north-america'),('pm','north-america'),
  -- Sud America
  ('ar','south-america'),('bo','south-america'),('br','south-america'),('cl','south-america'),
  ('co','south-america'),('ec','south-america'),('fk','south-america'),('gf','south-america'),
  ('gy','south-america'),('py','south-america'),('pe','south-america'),('sr','south-america'),
  ('uy','south-america'),('ve','south-america'),
  -- Oceania
  ('as','oceania'),('au','oceania'),('ck','oceania'),('fj','oceania'),('pf','oceania'),
  ('gu','oceania'),('ki','oceania'),('mh','oceania'),('fm','oceania'),('nr','oceania'),
  ('nc','oceania'),('nz','oceania'),('nu','oceania'),('nf','oceania'),('mp','oceania'),
  ('pw','oceania'),('pg','oceania'),('pn','oceania'),('ws','oceania'),('sb','oceania'),
  ('tk','oceania'),('to','oceania'),('tv','oceania'),('vu','oceania'),('wf','oceania'),
  -- Antartide
  ('aq','antarctica'),('bv','antarctica'),('tf','antarctica'),('hm','antarctica'),
  ('gs','antarctica')
ON CONFLICT (code) DO UPDATE SET continent = EXCLUDED.continent;

-- ----------------------------------------------------------------------------
-- 4) RPC
-- ----------------------------------------------------------------------------

-- Cerca viaggiatori per username (prefix match), con stato dell'amicizia
-- rispetto all'utente corrente. security definer: profiles non consente
-- SELECT su righe altrui (migration 0010).
CREATE OR REPLACE FUNCTION public.search_travelers(search_query text)
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
    AND p.username ILIKE (replace(replace(search_query, '\', '\\'), '_', '\_') || '%')
    AND p.id != auth.uid()
  ORDER BY p.username
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_travelers(text) TO authenticated;

-- Profilo pubblico di un viaggiatore + statistiche aggregate (paesi/continenti
-- visitati calcolati su TUTTI i suoi viaggi — info pubbliche per tutti) +
-- stato amicizia con l'utente corrente.
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

-- Viaggi pubblici di un utente (solo is_public = true), per il profilo pubblico.
CREATE OR REPLACE FUNCTION public.get_public_trips_for_user(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  start_date date,
  end_date date,
  destinations jsonb,
  cover_image_url text,
  cover_position_y integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.start_date, t.end_date, t.destinations,
         t.cover_image_url, t.cover_position_y, t.created_at
  FROM public.trips t
  WHERE t.owner_id = target_user_id AND t.is_public = true
  ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_trips_for_user(uuid) TO authenticated;

-- Invia una richiesta di amicizia. Se esiste già una coppia in stato
-- 'declined', la riattiva come pending; se già pending/accepted, errore.
CREATE OR REPLACE FUNCTION public.send_friend_request(addressee_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_addressee_id uuid := addressee_id;
  existing_id uuid;
  existing_status text;
BEGIN
  IF v_addressee_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot_add_self';
  END IF;

  SELECT f.id, f.status INTO existing_id, existing_status
  FROM public.friendships f
  WHERE (f.requester_id = auth.uid() AND f.addressee_id = v_addressee_id)
     OR (f.requester_id = v_addressee_id AND f.addressee_id = auth.uid())
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    IF existing_status = 'pending' OR existing_status = 'accepted' THEN
      RAISE EXCEPTION 'request_exists';
    END IF;
    UPDATE public.friendships
    SET requester_id = auth.uid(),
        addressee_id = v_addressee_id,
        status = 'pending',
        responded_at = NULL,
        created_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id, status)
  VALUES (auth.uid(), v_addressee_id, 'pending')
  RETURNING id INTO existing_id;

  RETURN existing_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_friend_request(uuid) TO authenticated;

-- Accetta/rifiuta una richiesta di amicizia arrivata.
CREATE OR REPLACE FUNCTION public.respond_to_friend_request(friendship_id uuid, accept boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.friendships
  SET status = CASE WHEN accept THEN 'accepted' ELSE 'declined' END,
      responded_at = now()
  WHERE id = friendship_id
    AND addressee_id = auth.uid()
    AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_friend_request(uuid, boolean) TO authenticated;

-- Rende un viaggio pubblico/privato (solo owner).
CREATE OR REPLACE FUNCTION public.set_trip_public(trip_id uuid, is_public boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.trips
  SET is_public = set_trip_public.is_public
  WHERE id = trip_id AND public.is_trip_owner(trip_id);
$$;

GRANT EXECUTE ON FUNCTION public.set_trip_public(uuid, boolean) TO authenticated;