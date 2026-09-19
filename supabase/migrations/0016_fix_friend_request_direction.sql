-- ============================================================================
-- JourneyAtlas - Fix direzione richiesta amicizia (1.9c)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- Bug corretto: quando una richiesta era precedentemente 'declined' e l'altro
-- utente inviava una nuova richiesta, la funzione non aggiornava requester_id
-- e addressee_id, lasciando invariato chi fosse il mittente e chi il destinatario.
-- ============================================================================

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
    -- Riattiva impostando chi invia ora come requester_id e il target come addressee_id
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
