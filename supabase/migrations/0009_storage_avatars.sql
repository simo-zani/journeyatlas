-- ============================================================================
-- JourneyAtlas - Storage: bucket avatars (foto profilo)
-- Esegui nel Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================================

-- 1. Crea il bucket (public = URL pubblici per le immagini)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','image/avif'];

-- 2. Chiunque puo leggere (bucket pubblico)
drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 3. Solo utenti autenticati possono caricare (path: {userId}/...)
drop policy if exists "avatars_insert_owner" on storage.objects;
create policy "avatars_insert_owner"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Solo il proprietario puo sovrascrivere
drop policy if exists "avatars_update_owner" on storage.objects;
create policy "avatars_update_owner"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Solo il proprietario puo eliminare
drop policy if exists "avatars_delete_owner" on storage.objects;
create policy "avatars_delete_owner"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
