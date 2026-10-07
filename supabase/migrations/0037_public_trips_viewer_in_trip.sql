-- Profilo pubblico: per ogni viaggio indica se anche chi sta guardando (auth.uid())
-- è partecipante accettato di quel viaggio, così l'app può mostrare "ci sei anche tu".
-- Aggiunge una colonna al tipo di ritorno, quindi la funzione va ricreata.

DROP FUNCTION IF EXISTS public.get_public_trips_for_user(uuid);
CREATE FUNCTION public.get_public_trips_for_user(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  start_date date,
  end_date date,
  destinations jsonb,
  cover_image_url text,
  cover_position_y integer,
  created_at timestamptz,
  viewer_in_trip boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.start_date, t.end_date, t.destinations,
         t.cover_image_url, t.cover_position_y, t.created_at,
         EXISTS (
           SELECT 1 FROM public.trip_participants me
           WHERE me.trip_id = t.id
             AND me.user_id = auth.uid()
             AND me.status = 'accepted'
         ) AS viewer_in_trip
  FROM public.trips t
  WHERE t.is_public = true
    AND (
      t.owner_id = target_user_id
      OR EXISTS (
        SELECT 1 FROM public.trip_participants tp
        WHERE tp.trip_id = t.id
          AND tp.user_id = target_user_id
          AND tp.status = 'accepted'
      )
    )
  ORDER BY t.start_date DESC NULLS LAST, t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_trips_for_user(uuid) TO authenticated;
