-- ============================================================================
-- JourneyAtlas - Migration 0038: Spese condivise (stile Tricount)
-- Esegui questo script nel Supabase SQL Editor.
--
-- Contiene:
--   * trips.expense_currency: valuta in cui si calcolano totali e saldi
--   * expense_categories: categorie personalizzate (nome + icona), come la
--     check list; quelle predefinite restano hardcoded nel client
--   * expenses: una spesa (o un rimborso, kind = 'transfer') pagata da un
--     partecipante del viaggio
--   * expense_splits: per chi è la spesa e quanto tocca a ciascuno
--   * save_expense: RPC che scrive spesa + ripartizione in un'unica
--     transazione, verificando che i conti tornino
--
-- Pagatore e beneficiari sono righe di trip_participants (non utenti): così
-- anche i compagni senza account possono pagare/partecipare, e quando uno di
-- loro collega il proprio account (respond_to_invite mantiene l'id della riga)
-- le sue spese restano sue.
--
-- Le FK verso trip_participants sono NO ACTION (non RESTRICT, non CASCADE):
--   * non si può rimuovere un partecipante che compare in una spesa — i saldi
--     degli altri cambierebbero di nascosto;
--   * eliminando l'intero viaggio, spese e partecipanti spariscono insieme per
--     cascade. NB: il controllo immediato non basta in questo caso — la 0039
--     rende queste FK differite a fine transazione (vedi lì il perché).
--
-- Permessi: le spese le vede chiunque partecipi al viaggio; le può inserire
-- qualunque partecipante accettato (anche un viewer: è un viaggiatore e deve
-- poter registrare ciò che paga); modificarle/eliminarle può chi l'ha creata
-- oppure un owner/editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Valuta di riferimento del viaggio
-- ----------------------------------------------------------------------------
alter table public.trips
  add column if not exists expense_currency text not null default 'EUR';

-- ----------------------------------------------------------------------------
-- 2) Categorie spese personalizzate
-- ----------------------------------------------------------------------------
create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  name text not null,
  icon text not null default 'tag',
  created_at timestamptz not null default now(),
  unique (trip_id, name)
);

create index if not exists idx_expense_categories_trip_id on public.expense_categories(trip_id);

alter table public.expense_categories enable row level security;

drop policy if exists "expense_categories_select" on public.expense_categories;
create policy "expense_categories_select"
  on public.expense_categories for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "expense_categories_insert" on public.expense_categories;
create policy "expense_categories_insert"
  on public.expense_categories for insert
  with check (public.is_trip_participant(trip_id));

drop policy if exists "expense_categories_update" on public.expense_categories;
create policy "expense_categories_update"
  on public.expense_categories for update
  using (public.can_edit_trip(trip_id));

drop policy if exists "expense_categories_delete" on public.expense_categories;
create policy "expense_categories_delete"
  on public.expense_categories for delete
  using (public.can_edit_trip(trip_id));

-- ----------------------------------------------------------------------------
-- 3) Spese
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  kind text not null default 'expense' check (kind in ('expense', 'transfer')),
  title text not null,
  -- Importo nella valuta della spesa
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'EUR',
  -- 1 unità di `currency` = exchange_rate unità della valuta del viaggio
  exchange_rate numeric(18, 8) not null default 1 check (exchange_rate > 0),
  category text,
  expense_date date not null default current_date,
  payer_participant_id uuid not null references public.trip_participants(id),
  split_mode text not null default 'equal' check (split_mode in ('equal', 'amounts', 'shares')),
  notes text,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_trip_id on public.expenses(trip_id);
create index if not exists idx_expenses_payer on public.expenses(payer_participant_id);

drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at
  before update on public.expenses
  for each row execute procedure public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4) Ripartizione: quanto della spesa tocca a ciascun partecipante
-- ----------------------------------------------------------------------------
create table if not exists public.expense_splits (
  expense_id uuid not null references public.expenses(id) on delete cascade,
  participant_id uuid not null references public.trip_participants(id),
  -- Quota nella valuta della spesa (la somma delle quote = expenses.amount)
  amount numeric(12, 2) not null check (amount >= 0),
  -- Peso usato con split_mode = 'shares' (es. 2 = doppia quota)
  shares numeric(8, 2) not null default 1 check (shares >= 0),
  primary key (expense_id, participant_id)
);

create index if not exists idx_expense_splits_participant on public.expense_splits(participant_id);

-- ----------------------------------------------------------------------------
-- 5) RLS
-- ----------------------------------------------------------------------------
create or replace function public.can_modify_expense(expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.expenses e
    where e.id = can_modify_expense.expense_id
      and (e.created_by_user_id = auth.uid() or public.can_edit_trip(e.trip_id))
      and public.is_trip_participant(e.trip_id)
  );
$$;

alter table public.expenses enable row level security;

drop policy if exists "expenses_select" on public.expenses;
create policy "expenses_select"
  on public.expenses for select
  using (public.is_trip_participant(trip_id));

drop policy if exists "expenses_insert" on public.expenses;
create policy "expenses_insert"
  on public.expenses for insert
  with check (public.is_trip_participant(trip_id) and created_by_user_id = auth.uid());

drop policy if exists "expenses_update" on public.expenses;
create policy "expenses_update"
  on public.expenses for update
  using (public.can_modify_expense(id))
  with check (public.is_trip_participant(trip_id));

drop policy if exists "expenses_delete" on public.expenses;
create policy "expenses_delete"
  on public.expenses for delete
  using (public.can_modify_expense(id));

alter table public.expense_splits enable row level security;

drop policy if exists "expense_splits_select" on public.expense_splits;
create policy "expense_splits_select"
  on public.expense_splits for select
  using (exists (
    select 1 from public.expenses e
    where e.id = expense_id and public.is_trip_participant(e.trip_id)
  ));

drop policy if exists "expense_splits_insert" on public.expense_splits;
create policy "expense_splits_insert"
  on public.expense_splits for insert
  with check (public.can_modify_expense(expense_id));

drop policy if exists "expense_splits_update" on public.expense_splits;
create policy "expense_splits_update"
  on public.expense_splits for update
  using (public.can_modify_expense(expense_id));

drop policy if exists "expense_splits_delete" on public.expense_splits;
create policy "expense_splits_delete"
  on public.expense_splits for delete
  using (public.can_modify_expense(expense_id));

-- ----------------------------------------------------------------------------
-- 6) RPC: crea/aggiorna una spesa con la sua ripartizione, atomicamente.
--    SECURITY INVOKER: valgono le policy qui sopra, la funzione aggiunge solo
--    i controlli di coerenza che le policy non possono esprimere.
--
--    p_expense: { id?, trip_id, kind, title, amount, currency, exchange_rate,
--                 category, expense_date, payer_participant_id, split_mode, notes }
--    p_splits:  [{ participant_id, amount, shares }]
-- ----------------------------------------------------------------------------
create or replace function public.save_expense(p_expense jsonb, p_splits jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := nullif(p_expense->>'id', '')::uuid;
  v_trip uuid := (p_expense->>'trip_id')::uuid;
  v_amount numeric(12, 2) := (p_expense->>'amount')::numeric;
  v_split_total numeric(12, 2);
  v_bad int;
begin
  if jsonb_array_length(coalesce(p_splits, '[]'::jsonb)) = 0 then
    raise exception 'La spesa deve essere assegnata ad almeno una persona';
  end if;

  select coalesce(sum((s->>'amount')::numeric), 0) into v_split_total
  from jsonb_array_elements(p_splits) s;
  if v_split_total <> v_amount then
    raise exception 'La somma delle quote (%) non corrisponde all''importo (%)', v_split_total, v_amount;
  end if;

  -- Pagatore e beneficiari devono essere partecipanti accettati di questo viaggio
  select count(*) into v_bad
  from (
    select (p_expense->>'payer_participant_id')::uuid as pid
    union
    select (s->>'participant_id')::uuid from jsonb_array_elements(p_splits) s
  ) ids
  where not exists (
    select 1 from public.trip_participants tp
    where tp.id = ids.pid and tp.trip_id = v_trip and tp.status = 'accepted'
  );
  if v_bad > 0 then
    raise exception 'Partecipante non valido per questo viaggio';
  end if;

  if v_id is null then
    insert into public.expenses (
      trip_id, kind, title, amount, currency, exchange_rate, category,
      expense_date, payer_participant_id, split_mode, notes, created_by_user_id
    ) values (
      v_trip,
      coalesce(p_expense->>'kind', 'expense'),
      p_expense->>'title',
      v_amount,
      coalesce(p_expense->>'currency', 'EUR'),
      coalesce((p_expense->>'exchange_rate')::numeric, 1),
      nullif(p_expense->>'category', ''),
      coalesce((p_expense->>'expense_date')::date, current_date),
      (p_expense->>'payer_participant_id')::uuid,
      coalesce(p_expense->>'split_mode', 'equal'),
      nullif(p_expense->>'notes', ''),
      auth.uid()
    )
    returning id into v_id;
  else
    update public.expenses set
      kind = coalesce(p_expense->>'kind', kind),
      title = p_expense->>'title',
      amount = v_amount,
      currency = coalesce(p_expense->>'currency', currency),
      exchange_rate = coalesce((p_expense->>'exchange_rate')::numeric, exchange_rate),
      category = nullif(p_expense->>'category', ''),
      expense_date = coalesce((p_expense->>'expense_date')::date, expense_date),
      payer_participant_id = (p_expense->>'payer_participant_id')::uuid,
      split_mode = coalesce(p_expense->>'split_mode', split_mode),
      notes = nullif(p_expense->>'notes', '')
    where id = v_id and trip_id = v_trip;
    if not found then
      raise exception 'Spesa non trovata o non modificabile';
    end if;
    delete from public.expense_splits where expense_id = v_id;
  end if;

  insert into public.expense_splits (expense_id, participant_id, amount, shares)
  select v_id,
         (s->>'participant_id')::uuid,
         (s->>'amount')::numeric,
         coalesce((s->>'shares')::numeric, 1)
  from jsonb_array_elements(p_splits) s;

  return v_id;
end;
$$;

grant execute on function public.save_expense(jsonb, jsonb) to authenticated;

-- ============================================================================
-- Fine migration
-- ============================================================================
