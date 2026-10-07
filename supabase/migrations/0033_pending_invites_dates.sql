-- fetch_pending_invites: aggiunge le date del viaggio, così chi riceve l'invito
-- capisce a quale viaggio è stato invitato prima di accettare.
-- Cambia il tipo di ritorno, quindi la funzione va ricreata.
DROP FUNCTION IF EXISTS public.fetch_pending_invites();
CREATE FUNCTION public.fetch_pending_invites()
RETURNS TABLE(
  participant_id uuid,
  trip_id uuid,
  trip_name text,
  trip_cover_image_url text,
  trip_start_date date,
  trip_end_date date,
  role text,
  invited_by_username text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tp.id, t.id, t.name, t.cover_image_url, t.start_date, t.end_date,
         tp.role, inviter.username, tp.created_at
  FROM public.trip_participants tp
  JOIN public.trips t ON t.id = tp.trip_id
  LEFT JOIN public.profiles inviter ON inviter.id = tp.invited_by
  WHERE tp.user_id = auth.uid() AND tp.status = 'pending'
  ORDER BY tp.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.fetch_pending_invites() TO authenticated;
