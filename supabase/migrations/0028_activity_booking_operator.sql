-- ============================================================================
-- JourneyAtlas - Migration 0028: operatore di prenotazione delle attivita'
-- Aggiunge alla tabella activities:
--   - booking_operator       (nome operatore, es. "GetYourGuide")
--   - booking_operator_logo  (logo personalizzato come data URL, gia' ritagliato
--                             a ~96x96 webp dal client: pochi KB per riga)
-- Idempotente.
-- ============================================================================
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS booking_operator      text,
  ADD COLUMN IF NOT EXISTS booking_operator_logo text;
