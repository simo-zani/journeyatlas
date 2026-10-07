-- Profilo pubblico: tra i viaggi pubblici di un utente compaiono anche quelli a
-- cui partecipa (partecipante accettato), non solo quelli di cui è proprietario.
-- Restano visibili solo i viaggi con is_public = true. Stessa firma e stesso
-- tipo di ritorno di 0012, quindi basta ricreare la funzione.

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
