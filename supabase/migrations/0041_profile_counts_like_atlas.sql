-- ============================================================================
-- JourneyAtlas - Migration 0041: conteggi del profilo allineati all'atlante
-- Esegui questo script nel Supabase SQL Editor.
--
-- get_traveler_profile (paesi e continenti visitati) ora segue le stesse
-- regole della pagina "Il mio atlante":
--   * contano i viaggi di cui si è proprietari E quelli a cui si partecipa
--     (invito accettato), ma solo se già iniziati (start_date, o end_date se
--     manca, <= oggi); i viaggi futuri sono "in programma", non visitati
--   * contano i paesi segnati a mano (atlas_marks, anche solo una regione)
--   * il numero di paesi conta solo i 195 stati sovrani (193 membri ONU +
--     Vaticano e Palestina): territori (Groenlandia, Porto Rico, Hong Kong...)
--     e stati a riconoscimento limitato restano fuori, come nell'atlante
--   * i continenti si contano su tutto ciò che è stato visitato
--
-- Unica differenza con l'atlante: qui non si fanno calcoli geometrici, quindi
-- una meta a Kyrenia conta per Cipro (l'atlante la attribuisce a Cipro del
-- Nord dalle coordinate). Gli scali non contano in nessuno dei due.
-- ============================================================================

-- 1) Stati sovrani (denominatore "% del mondo" e filtro del conteggio)
create table if not exists public.sovereign_countries (
  code text primary key
);

grant select on public.sovereign_countries to authenticated;

insert into public.sovereign_countries (code) values
  ('AD'), ('AE'), ('AF'), ('AG'), ('AL'), ('AM'), ('AO'), ('AR'), ('AT'), ('AU'), ('AZ'),
  ('BA'), ('BB'), ('BD'), ('BE'), ('BF'), ('BG'), ('BH'), ('BI'), ('BJ'), ('BN'), ('BO'),
  ('BR'), ('BS'), ('BT'), ('BW'), ('BY'), ('BZ'), ('CA'), ('CD'), ('CF'), ('CG'), ('CH'),
  ('CI'), ('CL'), ('CM'), ('CN'), ('CO'), ('CR'), ('CU'), ('CV'), ('CY'), ('CZ'), ('DE'),
  ('DJ'), ('DK'), ('DM'), ('DO'), ('DZ'), ('EC'), ('EE'), ('EG'), ('ER'), ('ES'), ('ET'),
  ('FI'), ('FJ'), ('FM'), ('FR'), ('GA'), ('GB'), ('GD'), ('GE'), ('GH'), ('GM'), ('GN'),
  ('GQ'), ('GR'), ('GT'), ('GW'), ('GY'), ('HN'), ('HR'), ('HT'), ('HU'), ('ID'), ('IE'),
  ('IL'), ('IN'), ('IQ'), ('IR'), ('IS'), ('IT'), ('JM'), ('JO'), ('JP'), ('KE'), ('KG'),
  ('KH'), ('KI'), ('KM'), ('KN'), ('KP'), ('KR'), ('KW'), ('KZ'), ('LA'), ('LB'), ('LC'),
  ('LI'), ('LK'), ('LR'), ('LS'), ('LT'), ('LU'), ('LV'), ('LY'), ('MA'), ('MC'), ('MD'),
  ('ME'), ('MG'), ('MH'), ('MK'), ('ML'), ('MM'), ('MN'), ('MR'), ('MT'), ('MU'), ('MV'),
  ('MW'), ('MX'), ('MY'), ('MZ'), ('NA'), ('NE'), ('NG'), ('NI'), ('NL'), ('NO'), ('NP'),
  ('NR'), ('NZ'), ('OM'), ('PA'), ('PE'), ('PG'), ('PH'), ('PK'), ('PL'), ('PS'), ('PT'),
  ('PW'), ('PY'), ('QA'), ('RO'), ('RS'), ('RU'), ('RW'), ('SA'), ('SB'), ('SC'), ('SD'),
  ('SE'), ('SG'), ('SI'), ('SK'), ('SL'), ('SM'), ('SN'), ('SO'), ('SR'), ('SS'), ('ST'),
  ('SV'), ('SY'), ('SZ'), ('TD'), ('TG'), ('TH'), ('TJ'), ('TL'), ('TM'), ('TN'), ('TO'),
  ('TR'), ('TT'), ('TV'), ('TZ'), ('UA'), ('UG'), ('US'), ('UY'), ('UZ'), ('VA'), ('VC'),
  ('VE'), ('VN'), ('VU'), ('WS'), ('YE'), ('ZA'), ('ZM'), ('ZW')
on conflict (code) do nothing;

-- 2) Profilo viaggiatore con i nuovi conteggi
drop function if exists public.get_traveler_profile(uuid);

create or replace function public.get_traveler_profile(target_user_id uuid)
returns table(
  id uuid,
  username text,
  avatar_url text,
  created_at timestamptz,
  friend_status text,
  friendship_id uuid,
  countries_visited bigint,
  continents_visited bigint,
  total_trips_count bigint,
  public_trips_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with my_trips as (
    select t.*
    from public.trips t
    where t.owner_id = target_user_id
       or exists (
         select 1 from public.trip_participants tp
         where tp.trip_id = t.id and tp.user_id = target_user_id and tp.status = 'accepted'
       )
  ),
  visited as (
    select upper(d.value ->> 'countryCode') as code
    from my_trips t
    cross join lateral jsonb_array_elements(coalesce(t.destinations, '[]'::jsonb)) as d
    where coalesce(t.start_date, t.end_date) <= current_date
      and coalesce(d.value ->> 'countryCode', '') <> ''
    union
    select m.country_code from public.atlas_marks m where m.user_id = target_user_id
  ),
  cnts as (
    select
      count(s.code) as countries,
      count(distinct cc.continent) as continents
    from visited v
    left join public.sovereign_countries s on s.code = v.code
    -- le entità senza ISO prendono il continente del paese da cui si sono separate
    left join public.country_continents cc on upper(cc.code) = case v.code
      when 'X-NCY' then 'CY'
      when 'X-SOL' then 'SO'
      when 'X-ABK' then 'GE'
      when 'X-SOS' then 'GE'
      when 'X-TRN' then 'MD'
      else v.code
    end
  ),
  fs as (
    select f.id,
      case
        when f.status = 'accepted' then 'friends'
        when f.status = 'pending' and f.requester_id = auth.uid() then 'outgoing'
        when f.status = 'pending' and f.addressee_id = auth.uid() then 'incoming'
        else null::text
      end as friend_status
    from public.friendships f
    where (f.requester_id = auth.uid() and f.addressee_id = target_user_id)
       or (f.requester_id = target_user_id and f.addressee_id = auth.uid())
    order by case when f.status = 'accepted' then 0 when f.status = 'pending' then 1 else 2 end
    limit 1
  )
  select
    p.id,
    p.username,
    p.avatar_url,
    p.created_at,
    case
      when target_user_id = auth.uid() then 'self'
      when fs.friend_status is not null then fs.friend_status
      else null::text
    end,
    fs.id,
    cnts.countries,
    cnts.continents,
    (select count(*) from public.trips t2 where t2.owner_id = target_user_id)::bigint as total_trips_count,
    (select count(*) from public.trips t2 where t2.owner_id = target_user_id and t2.is_public)::bigint as public_trips_count
  from public.profiles p
  cross join cnts
  left join fs on true
  where p.id = target_user_id;
$$;

grant execute on function public.get_traveler_profile(uuid) to authenticated;

-- ============================================================================
-- Fine migration
-- ============================================================================
