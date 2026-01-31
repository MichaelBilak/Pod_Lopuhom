import "dotenv/config";
import { Client } from "pg";
import { products } from "../src/data/products";

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

const upsertSql = `
insert into products (slug, title, materials, price, description, images)
values ($1, $2, $3, $4, $5, $6)
on conflict (slug)
do update set
  title = excluded.title,
  materials = excluded.materials,
  price = excluded.price,
  description = excluded.description,
  images = excluded.images;
`;

const run = async () => {
  await client.connect();

  for (const product of products) {
    await client.query(upsertSql, [
      product.slug,
      product.title,
      product.materials,
      product.price,
      product.description,
      JSON.stringify(product.images),
    ]);
  }

  await client.end();
  console.log(`Seeded ${products.length} products.`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
