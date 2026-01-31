import "dotenv/config";
import { Client } from "pg";

const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set.");
}

const client = new Client({
  connectionString,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
});

const schemaSql = `
create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  materials text,
  price text,
  description text,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
before update on products
for each row
execute procedure set_updated_at();
`;

const run = async () => {
  await client.connect();
  await client.query(schemaSql);
  await client.end();
  console.log("Database schema is ready.");
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
