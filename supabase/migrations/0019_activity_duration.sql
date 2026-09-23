-- ============================================================================
-- JourneyAtlas - Migration 0019: Durata attività (giornata intera / più giorni
-- / orario di fine)
-- Esegui questo script nel Supabase SQL Editor.
--
-- Aggiunge:
--   - all_day: attività senza orario specifico ("giornata intera")
--   - end_date: se diversa da activity_date, l'attività dura più giorni
--   - end_time: orario di fine nello stesso giorno (es. 15:00-17:00)
-- activity_date/activity_time restano la data/orario di INIZIO.
-- ============================================================================

alter table public.activities
  add column if not exists all_day boolean not null default false,
  add column if not exists end_date date,
  add column if not exists end_time time;

alter table public.activities
  drop constraint if exists activities_end_date_after_start;
alter table public.activities
  add constraint activities_end_date_after_start
    check (end_date is null or activity_date is null or end_date >= activity_date);

-- ============================================================================
-- Fine migration
-- ============================================================================
