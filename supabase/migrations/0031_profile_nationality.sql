-- ============================================================================
-- JourneyAtlas - Migration 0031: Profile nationality
-- La nazionalità dell'utente, facoltativa.
--
--   - nationality  text NULL   -- codice paese ISO 3166-1 alpha-2 (es. 'IT')
--
-- A cosa serve: nel tab "Info Paese" il paese dell'utente non ha senso come
-- "meta" da conoscere (e la sua lingua non serve nel frasario). Se la
-- nazionalità è impostata quel paese viene nascosto; se non lo è, si mostrano
-- sempre tutti i paesi del viaggio.
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nationality text;
