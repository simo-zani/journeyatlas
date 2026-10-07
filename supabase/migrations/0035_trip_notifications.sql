-- Notifiche per l'utente: per ora, "sei stato rimosso dal viaggio".
-- Si scrivono solo tramite la funzione remove_trip_participant (SECURITY
-- DEFINER): non c'è nessuna policy di INSERT, quindi nessun client può
-- inventarsi notifiche per altri utenti. Il destinatario le legge e le chiude.

create table if not exists public.trip_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'removed' check (kind in ('removed')),
  trip_name text not null,
  actor_username text,
  created_at timestamptz not null default now()
);

create index if not exists trip_notifications_user_idx
  on public.trip_notifications (user_id, created_at desc);

alter table public.trip_notifications enable row level security;

drop policy if exists "trip_notifications_select_own" on public.trip_notifications;
create policy "trip_notifications_select_own"
  on public.trip_notifications for select
  using (user_id = auth.uid());

drop policy if exists "trip_notifications_delete_own" on public.trip_notifications;
create policy "trip_notifications_delete_own"
  on public.trip_notifications for delete
  using (user_id = auth.uid());

-- Rimuove un partecipante (solo il proprietario) e, se aveva un account ed era
-- già dentro il viaggio, gli lascia una notifica. Un invito ancora pending
-- viene semplicemente annullato, senza notifica.
create or replace function public.remove_trip_participant(participant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  tp public.trip_participants%rowtype;
  v_trip_name text;
  v_actor text;
begin
  select * into tp from public.trip_participants where id = participant_id;
  if not found then
    return;
  end if;

  if not public.is_trip_owner(tp.trip_id) then
    raise exception 'Operazione non consentita';
  end if;
  if tp.role = 'owner' then
    raise exception 'Il proprietario non può essere rimosso';
  end if;

  delete from public.trip_participants where id = tp.id;

  if tp.user_id is not null and tp.status = 'accepted' then
    select name into v_trip_name from public.trips where id = tp.trip_id;
    select username into v_actor from public.profiles where id = auth.uid();
    insert into public.trip_notifications (user_id, kind, trip_name, actor_username)
    values (tp.user_id, 'removed', coalesce(v_trip_name, ''), v_actor);
  end if;
end;
$$;

grant execute on function public.remove_trip_participant(uuid) to authenticated;
