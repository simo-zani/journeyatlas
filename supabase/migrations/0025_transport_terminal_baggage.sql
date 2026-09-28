-- ============================================================================
-- JourneyAtlas - Migration 0025: Terminal e bagagli sui mezzi
--
--   - departure_terminal  text NULL
--   - arrival_terminal    text NULL
--   - has_backpack        boolean NULL
--   - has_carry_on        boolean NULL
--   - has_checked_baggage boolean NULL
--
-- Il terminal non si può derivare dall'aeroporto (dipende dal volo/compagnia,
-- non dallo scalo): resta un campo libero compilato a mano, come già
-- departure_airport/arrival_airport.
-- ============================================================================

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS departure_terminal text;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS arrival_terminal text;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_backpack boolean;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_carry_on boolean;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_checked_baggage boolean;
