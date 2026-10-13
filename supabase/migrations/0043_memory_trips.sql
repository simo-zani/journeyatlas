-- ============================================================================
-- JourneyAtlas - Migration 0043: viaggi "ricordo" (passati, senza documentazione)
-- Esegui questo script nel Supabase SQL Editor (si può rieseguire: è idempotente).
--
-- Un viaggio-ricordo è un viaggio passato registrato in fretta: i paesi visitati
-- (le città solo se le si ricorda) e le date, anche solo il mese. Serve a far
-- contare i viaggi di una volta nell'atlante e nelle statistiche del profilo.
-- Non si apre il gestionale del viaggio: dalla dashboard lo si modifica soltanto
-- (paesi, città, scali, date, compagni) con il modulo del ricordo.
--
--   is_memory:      true per i viaggi creati dal modulo "viaggio passato"
--   stopovers:      aeroporti di scalo (vedi sotto)
--   date_precision: 'day' (date esatte) o 'month' (solo mese): con 'month'
--                   start_date è il primo giorno del mese di partenza e
--                   end_date l'ultimo del mese di ritorno, così confronti e
--                   conteggi esistenti (atlante, profilo) funzionano invariati;
--                   l'app mostra solo mese e anno.
--
-- Le mete di cui si conosce solo il paese sono elementi di `destinations` con
-- city vuota e countryCode valorizzato: atlante e get_traveler_profile
-- leggono già countryCode.
-- ============================================================================

alter table public.trips
  add column if not exists is_memory boolean not null default false;

alter table public.trips
  add column if not exists date_precision text not null default 'day'
    check (date_precision in ('day', 'month'));

-- Scali di un viaggio-ricordo (che non ha la sezione Spostamenti):
-- [{ iata, name, city, countryCode, lat, lon }]. L'atlante li tratta come i
-- paesi di passaggio ricavati dai mezzi dei viaggi completi.
alter table public.trips
  add column if not exists stopovers jsonb not null default '[]'::jsonb;

-- ============================================================================
-- Fine migration
-- ============================================================================
