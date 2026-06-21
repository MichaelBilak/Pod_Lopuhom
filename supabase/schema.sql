-- Product management schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to run on existing DB: adds missing columns if products table already exists.

create extension if not exists "pgcrypto";

-- Products table (full schema for new installs)
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  price numeric,
  discount numeric default 0,
  category text,
  collection text default 'Herbarium',
  price_on_request boolean default false,
  is_active boolean default true,
  sort_order integer default 0,
  is_new boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add new columns to existing products table (no-op if already present)
alter table products add column if not exists discount numeric default 0;
alter table products add column if not exists price_on_request boolean default false;
alter table products add column if not exists is_active boolean default true;
alter table products add column if not exists sort_order integer default 0;
alter table products add column if not exists is_new boolean default false;
alter table products add column if not exists description_ru text;
alter table products add column if not exists description_it text;
alter table products add column if not exists collection text default 'Herbarium';
alter table products drop column if exists materials;

-- If price was created as text (old schema), convert to numeric (optional; remove if it fails)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'price'
    and data_type = 'text'
  ) then
    alter table products alter column price type numeric using nullif(trim(price), '')::numeric;
  end if;
exception when others then
  null; -- leave price as text if conversion fails
end $$;

update products set collection = 'Herbarium' where collection is null;

-- Product images table
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer default 0,
  object_position text default '50% 50%',
  created_at timestamptz default now()
);

alter table product_images add column if not exists object_position text default '50% 50%';

-- Indexes for common queries
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_is_active_sort on products(is_active, sort_order);
create index if not exists idx_products_is_new on products(sort_order) where is_new = true;
create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_product_images_sort on product_images(product_id, sort_order);

-- Trigger to update updated_at on products
create or replace function set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row
  execute procedure set_products_updated_at();

-- Orders table: written by the Stripe webhook on checkout.session.completed.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent_id text,
  product_id uuid references products(id) on delete set null,
  product_slug text,
  quantity integer not null default 1,
  amount_total integer not null,
  currency text not null default 'eur',
  customer_email text,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  status text not null default 'paid',
  created_at timestamptz default now()
);

create index if not exists idx_orders_created_at on orders(created_at desc);
create index if not exists idx_orders_product_id on orders(product_id);
create index if not exists idx_orders_status on orders(status);
