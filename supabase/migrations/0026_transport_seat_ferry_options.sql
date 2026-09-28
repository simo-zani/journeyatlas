-- ============================================================================
-- JourneyAtlas - Migration 0026: Opzioni posto treno e traghetto
--
--   Treno:
--     has_seat    boolean  -- poltrona / posto a sedere
--     has_cabin   boolean  -- cabina notte
--
--   Traghetto (in aggiunta a treno):
--     has_car_on_ferry   boolean  -- auto al seguito
--     has_deck_passage   boolean  -- passaggio ponte
-- ============================================================================

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_seat boolean;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_cabin boolean;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_car_on_ferry boolean;

ALTER TABLE public.flights
  ADD COLUMN IF NOT EXISTS has_deck_passage boolean;
