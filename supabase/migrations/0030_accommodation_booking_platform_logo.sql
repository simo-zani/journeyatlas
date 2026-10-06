-- ============================================================================
-- JourneyAtlas - Migration 0030: logo personalizzato della piattaforma di prenotazione
-- Aggiunge a accommodations:
--   - booking_platform_logo  (logo caricato a mano per piattaforme non in elenco,
--                             come data URL gia' ritagliato a ~96x96 webp dal client)
-- Idempotente.
-- ============================================================================
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS booking_platform_logo text;
