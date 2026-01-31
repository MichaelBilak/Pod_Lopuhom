import { getPool } from "./db";

export type Product = {
  id: string;
  slug: string;
  title: string;
  materials: string | null;
  price: string | null;
  description: string | null;
  images: string[];
  created_at: string;
  updated_at?: string;
};

export type ProductInput = {
  slug: string;
  title: string;
  materials: string | null;
  price: string | null;
  description: string | null;
  images: string[];
};

const normalizeImages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string");
  }
  return [];
};

const mapProductRow = (row: Record<string, unknown>) =>
  ({
    ...row,
    images: normalizeImages(row.images),
  }) as Product;

export const fetchProducts = async () => {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, slug, title, materials, price, description, images, created_at, updated_at
     from products
     order by created_at asc`
  );
  return rows.map((row) => mapProductRow(row));
};

export const fetchProductBySlug = async (slug: string) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, slug, title, materials, price, description, images, created_at, updated_at
     from products
     where slug = $1
     limit 1`,
    [slug]
  );
  if (!rows[0]) return null;
  return mapProductRow(rows[0]);
};

export const fetchProductById = async (id: string) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, slug, title, materials, price, description, images, created_at, updated_at
     from products
     where id = $1
     limit 1`,
    [id]
  );
  if (!rows[0]) return null;
  return mapProductRow(rows[0]);
};

export const createProduct = async (input: ProductInput) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `insert into products (slug, title, materials, price, description, images)
     values ($1, $2, $3, $4, $5, $6)
     returning id, slug, title, materials, price, description, images, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.materials,
      input.price,
      input.description,
      JSON.stringify(input.images),
    ]
  );
  return mapProductRow(rows[0]);
};

export const updateProduct = async (id: string, input: ProductInput) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `update products
     set slug = $1,
         title = $2,
         materials = $3,
         price = $4,
         description = $5,
         images = $6
     where id = $7
     returning id, slug, title, materials, price, description, images, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.materials,
      input.price,
      input.description,
      JSON.stringify(input.images),
      id,
    ]
  );
  if (!rows[0]) return null;
  return mapProductRow(rows[0]);
};

export const deleteProduct = async (id: string) => {
  const pool = getPool();
  const result = await pool.query(`delete from products where id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
};
