-- ============================================================================
-- JourneyAtlas - Add username to profiles table
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
--
-- - username è opzionale a livello di database (i profili esistenti creati
--   prima di questa migrazione non ne hanno uno), ma l'app lo richiede
--   obbligatoriamente in fase di registrazione.
-- - Consentiti solo lettere, numeri, punto, trattino e underscore (niente
--   spazi né altri caratteri speciali).
-- - Univoco case-insensitive ("Simo" e "simo" sono considerati lo stesso
--   username).
-- ============================================================================

-- 1. Colonna username
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- 2. Formato consentito: lettere, numeri, punto, trattino, underscore
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[A-Za-z0-9_.-]+$');

-- 3. Univocità case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- 4. Il trigger di creazione profilo legge lo username passato in
--    supabase.auth.signUp({ options: { data: { username } } })
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- 5. Funzione per controllare la disponibilità di uno username senza dare
--    accesso in lettura diretto alla tabella profiles dal client anonimo.
CREATE OR REPLACE FUNCTION public.username_exists(check_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE lower(username) = lower(check_username)
  );
$$;

GRANT EXECUTE ON FUNCTION public.username_exists(text) TO anon, authenticated;
