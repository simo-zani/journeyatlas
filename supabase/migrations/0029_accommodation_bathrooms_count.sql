-- ============================================================================
-- JourneyAtlas - Migration 0029: Accommodation bathrooms count
-- Numero di bagni di un appartamento (NULL = non specificato).
--
-- Per gli appartamenti la colonna esistente `rooms_count` (0023) conta le
-- stanze; per gli hotel resta il numero di camere prenotate. I bagni valgono
-- solo per gli appartamenti: il form non li chiede ne' li salva per gli hotel.
-- ============================================================================
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS bathrooms_count smallint;

ALTER TABLE public.accommodations
  DROP CONSTRAINT IF EXISTS accommodations_bathrooms_count_check;

ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_bathrooms_count_check
    CHECK (bathrooms_count IS NULL OR bathrooms_count >= 1);
