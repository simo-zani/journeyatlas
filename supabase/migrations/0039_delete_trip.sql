-- ============================================================================
-- JourneyAtlas - Migration 0039: eliminazione di un viaggio
-- Esegui questo script nel Supabase SQL Editor.
--
-- 1) FK delle spese verso trip_participants DIFFERITE a fine transazione.
--    La 0038 le aveva lasciate NO ACTION immediate contando sul controllo "a
--    fine statement", ma eliminando un viaggio le cascate partono in ordine:
--    prima si cancellano i partecipanti, e il controllo su expense_splits può
--    scattare prima della cascata spese → ripartizioni, facendo fallire
--    l'eliminazione. Differite, si controllano al commit, quando le cascate
--    sono tutte concluse. Resta invece vietato (al commit, stesso errore
--    23503) rimuovere un partecipante che compare in una spesa.
--
-- 2) delete_trip(trip_id): solo il proprietario. Avvisa i partecipanti con
--    account (come la rimozione da un viaggio) e cancella il viaggio: tutto il
--    resto (partecipanti, attività, alloggi, mezzi, check list, spese,
--    categorie...) è legato a trips con ON DELETE CASCADE. I file su storage
--    (copertina, foto alloggi) li rimuove il client prima di chiamarla.
-- ============================================================================

alter table public.expenses
  alter constraint expenses_payer_participant_id_fkey deferrable initially deferred;

alter table public.expense_splits
  alter constraint expense_splits_participant_id_fkey deferrable initially deferred;

-- Nuovo tipo di avviso: il viaggio è stato eliminato dal proprietario.
alter table public.trip_notifications
  drop constraint if exists trip_notifications_kind_check;
alter table public.trip_notifications
  add constraint trip_notifications_kind_check check (kind in ('removed', 'trip_deleted'));

create or replace function public.delete_trip(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_name text;
  v_actor text;
begin
  if not public.is_trip_owner(p_trip_id) then
    raise exception 'Solo il proprietario può eliminare il viaggio';
  end if;

  select name into v_trip_name from public.trips where id = p_trip_id;
  if not found then
    return;
  end if;
  select username into v_actor from public.profiles where id = auth.uid();

  insert into public.trip_notifications (user_id, kind, trip_name, actor_username)
  select tp.user_id, 'trip_deleted', v_trip_name, v_actor
  from public.trip_participants tp
  where tp.trip_id = p_trip_id
    and tp.user_id is not null
    and tp.user_id <> auth.uid()
    and tp.status = 'accepted';

  delete from public.trips where id = p_trip_id;
end;
$$;

grant execute on function public.delete_trip(uuid) to authenticated;

-- ============================================================================
-- Fine migration
-- ============================================================================
