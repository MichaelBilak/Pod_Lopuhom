import { getPool } from "./db";

export type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  is_new: boolean;
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
  category: string;
  is_new: boolean;
  materials: string | null;
  price: string | null;
  description: string | null;
  images: string[];
};

const imageCaseMap: Record<string, string> = {
  "/images/products/necklaces_21.0.JPG": "/images/products/necklaces_21.0.jpg",
  "/images/products/necklaces_21.1.JPG": "/images/products/necklaces_21.1.jpg",
};

const normalizeImages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => imageCaseMap[item] ?? item);
  }
  return [];
};

const normalizeIsNew = (value: unknown) => value === true;

const mapProductRow = (row: Record<string, unknown>) =>
  ({
    ...row,
    images: normalizeImages(row.images),
    is_new: normalizeIsNew(row.is_new),
  }) as Product;

export const fetchProducts = async () => {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, slug, title, category, is_new, materials, price, description, images, created_at, updated_at
     from products
     order by created_at asc`
  );
  return rows.map((row) => mapProductRow(row));
};

export const fetchProductBySlug = async (slug: string) => {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, slug, title, category, is_new, materials, price, description, images, created_at, updated_at
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
    `select id, slug, title, category, is_new, materials, price, description, images, created_at, updated_at
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
    `insert into products (slug, title, category, is_new, materials, price, description, images)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, slug, title, category, is_new, materials, price, description, images, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.category,
      input.is_new,
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
         category = $3,
         is_new = $4,
         materials = $5,
         price = $6,
         description = $7,
         images = $8
     where id = $9
     returning id, slug, title, category, is_new, materials, price, description, images, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.category,
      input.is_new,
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
