-- Supabase Storage setup for product images.
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query → paste → Run.

-- 1) Create the public bucket "products" (idempotent)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- 2) Public READ access to objects in the "products" bucket
drop policy if exists "Public read products bucket" on storage.objects;
create policy "Public read products bucket"
  on storage.objects
  for select
  using (bucket_id = 'products');

-- 3) Only the service role can write (admin API uses the service key)
drop policy if exists "Service role write products bucket" on storage.objects;
create policy "Service role write products bucket"
  on storage.objects
  for all
  to service_role
  using (bucket_id = 'products')
  with check (bucket_id = 'products');

-- Notes:
--   * The admin panel uploads via the server (service role key) → policies above are enough.
--   * Anyone can READ the files (needed so they show on the public site).
--   * No one but the service role can write/delete (no anonymous uploads possible).
