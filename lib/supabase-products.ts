import { getSupabaseAdmin } from "./supabase";
import type { Database } from "./database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductTableInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductImageRow = Database["public"]["Tables"]["product_images"]["Row"];
type ProductImageTableInsert =
  Database["public"]["Tables"]["product_images"]["Insert"];

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  object_position: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  description_ru?: string | null;
  description_it?: string | null;
  price: number | null;
  discount: number;
  materials: string | null;
  category: string | null;
  price_on_request: boolean;
  is_active: boolean;
  is_new: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
};

/** For public catalog: only active products, with images ordered by sort_order. First image = main. */
export async function fetchProductsForPublic(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (productsError) throw productsError;
  if (!products?.length) return [];

  const productIds = (products as ProductRow[]).map((p) => p.id);
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (imagesError) throw imagesError;

  const imagesByProduct = (images ?? []).reduce<Record<string, ProductImage[]>>(
    (acc, img) => {
      const row = img as ProductImageRow;
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push({
        id: row.id,
        product_id: row.product_id,
        image_url: row.image_url,
        alt_text: row.alt_text,
        sort_order: row.sort_order,
        object_position: (row as ProductImageRow & { object_position?: string | null }).object_position ?? null,
        created_at: row.created_at,
      });
      return acc;
    },
    {}
  );

  return (products as ProductRow[]).map((p) => ({
    ...p,
    images: imagesByProduct[p.id] ?? [],
  }));
}

/** For home page "New / Latest pieces": active products with is_new = true, with images. */
export async function fetchNewProductsForHome(limit = 8): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_new", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (productsError) throw productsError;
  if (!products?.length) return [];

  const productIds = (products as ProductRow[]).map((p) => p.id);
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (imagesError) throw imagesError;

  const imagesByProduct = (images ?? []).reduce<Record<string, ProductImage[]>>(
    (acc, img) => {
      const row = img as ProductImageRow;
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push({
        id: row.id,
        product_id: row.product_id,
        image_url: row.image_url,
        alt_text: row.alt_text,
        sort_order: row.sort_order,
        object_position: (row as ProductImageRow & { object_position?: string | null }).object_position ?? null,
        created_at: row.created_at,
      });
      return acc;
    },
    {}
  );

  return (products as ProductRow[]).map((p) => ({
    ...p,
    images: imagesByProduct[p.id] ?? [],
  }));
}

/** Admin: all products with images. */
export async function fetchProductsAdmin(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (productsError) throw productsError;
  if (!products?.length) return [];

  const productIds = (products as ProductRow[]).map((p) => p.id);
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  if (imagesError) throw imagesError;

  const imagesByProduct = (images ?? []).reduce<Record<string, ProductImage[]>>(
    (acc, img) => {
      const row = img as ProductImageRow;
      if (!acc[row.product_id]) acc[row.product_id] = [];
      acc[row.product_id].push({
        id: row.id,
        product_id: row.product_id,
        image_url: row.image_url,
        alt_text: row.alt_text,
        sort_order: row.sort_order,
        object_position: (row as ProductImageRow & { object_position?: string | null }).object_position ?? null,
        created_at: row.created_at,
      });
      return acc;
    },
    {}
  );

  return (products as ProductRow[]).map((p) => ({
    ...p,
    images: imagesByProduct[p.id] ?? [],
  }));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (productError || !product) return null;

  const row = product as ProductRow;
  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", row.id)
    .order("sort_order", { ascending: true });

  if (imagesError) return { ...row, images: [] };

  return {
    ...row,
    images: (images ?? []).map((img) => {
      const row = img as ProductImageRow;
      return {
        id: row.id,
        product_id: row.product_id,
        image_url: row.image_url,
        alt_text: row.alt_text,
        sort_order: row.sort_order,
        object_position: (row as ProductImageRow & { object_position?: string | null }).object_position ?? null,
        created_at: row.created_at,
      };
    }),
  };
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) return null;

  const row = product as ProductRow;
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", row.id)
    .order("sort_order", { ascending: true });

  return {
    ...row,
    images: (images ?? []).map((img) => {
      const imgRow = img as ProductImageRow;
      return {
        id: imgRow.id,
        product_id: imgRow.product_id,
        image_url: imgRow.image_url,
        alt_text: imgRow.alt_text,
        sort_order: imgRow.sort_order,
        object_position: (imgRow as ProductImageRow & { object_position?: string | null }).object_position ?? null,
        created_at: imgRow.created_at,
      };
    }),
  };
}

export type ProductInsert = {
  title: string;
  slug: string;
  description?: string | null;
  description_ru?: string | null;
  description_it?: string | null;
  price?: number | null;
  discount?: number;
  materials?: string | null;
  category?: string | null;
  price_on_request?: boolean;
  is_active?: boolean;
  is_new?: boolean;
  sort_order?: number;
};

export async function createProduct(input: ProductInsert): Promise<Product> {
  const supabase = getSupabaseAdmin();
  const payload: ProductTableInsert = {
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    description_ru: input.description_ru ?? null,
    description_it: input.description_it ?? null,
    price: input.price ?? null,
    discount: input.discount ?? 0,
    materials: input.materials ?? null,
    category: input.category ?? null,
    price_on_request: input.price_on_request ?? false,
    is_active: input.is_active ?? true,
    is_new: input.is_new ?? false,
    sort_order: input.sort_order ?? 0,
  };
  const { data, error } = await supabase
    .from("products")
    .insert(payload as never)
    .select()
    .single();

  if (error) throw error;
  return { ...(data as ProductRow), images: [] };
}

export type ProductUpdate = ProductInsert;

export async function updateProduct(
  id: string,
  input: ProductUpdate
): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const payload: Database["public"]["Tables"]["products"]["Update"] = {
    title: input.title,
    slug: input.slug,
    description: input.description ?? null,
    description_ru: input.description_ru ?? null,
    description_it: input.description_it ?? null,
    price: input.price ?? null,
    discount: input.discount ?? 0,
    materials: input.materials ?? null,
    category: input.category ?? null,
    price_on_request: input.price_on_request ?? false,
    is_active: input.is_active ?? true,
    is_new: input.is_new ?? false,
    sort_order: input.sort_order ?? 0,
  };
  const { data, error } = await supabase
    .from("products")
    .update(payload as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) return null;
  const product = await fetchProductById(id);
  return product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  return !error;
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText?: string | null,
  sortOrder?: number
): Promise<ProductImage> {
  const supabase = getSupabaseAdmin();
  const payload: ProductImageTableInsert = {
    product_id: productId,
    image_url: imageUrl,
    alt_text: altText ?? null,
    sort_order: sortOrder ?? 0,
  };
  const { data, error } = await supabase
    .from("product_images")
    .insert(payload as never)
    .select()
    .single();

  if (error) throw error;
  const row = data as ProductImageRow;
  return {
    id: row.id,
    product_id: row.product_id,
    image_url: row.image_url,
    alt_text: row.alt_text,
    sort_order: row.sort_order,
    object_position: (row as ProductImageRow & { object_position?: string | null }).object_position ?? null,
    created_at: row.created_at,
  };
}

/** Returns the new object_position if update succeeded, null otherwise.
 * If productId is provided, only updates when the image belongs to that product. */
export async function updateProductImagePosition(
  imageId: string,
  objectPosition: string,
  productId?: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("product_images")
    .update({ object_position: objectPosition } as never)
    .eq("id", imageId);
  if (productId) {
    query = query.eq("product_id", productId);
  }
  const { data, error } = await query.select("object_position").single();
  if (error || !data) return null;
  const pos = (data as { object_position?: string | null }).object_position;
  return typeof pos === "string" ? pos : null;
}

export async function updateProductImageOrder(
  imageId: string,
  sortOrder: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("product_images")
    .update({ sort_order: sortOrder } as never)
    .eq("id", imageId);
  if (error) throw error;
}

/** Reassigns sort_order on products based on their position in `idsInOrder`. */
export async function reorderProducts(idsInOrder: string[]): Promise<void> {
  const supabase = getSupabaseAdmin();
  for (let i = 0; i < idsInOrder.length; i++) {
    const { error } = await supabase
      .from("products")
      .update({ sort_order: i } as never)
      .eq("id", idsInOrder[i]);
    if (error) throw error;
  }
}

export async function reorderProductImages(
  productId: string,
  imageIdsInOrder: string[]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  for (let i = 0; i < imageIdsInOrder.length; i++) {
    const { error } = await supabase
      .from("product_images")
      .update({ sort_order: i } as never)
      .eq("id", imageIdsInOrder[i])
      .eq("product_id", productId);
    if (error) throw error;
  }
}

export async function deleteProductImage(imageId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  return !error;
}

/** Get a single image row (for getting URL before delete). */
export async function getProductImage(
  imageId: string
): Promise<{ image_url: string; object_position?: string | null } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_images")
    .select("image_url, object_position")
    .eq("id", imageId)
    .single();
  if (error || !data) return null;
  const d = data as { image_url: string; object_position?: string | null };
  return { image_url: d.image_url, object_position: d.object_position ?? null };
}

/** Check if an image row exists (uses only 'id' so it works even without object_position column). */
export async function productImageExists(imageId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_images")
    .select("id")
    .eq("id", imageId)
    .maybeSingle();
  return !error && data != null;
}

/** Get image with product_id to verify it belongs to the product. */
export async function getProductImageWithProductId(
  imageId: string
): Promise<{ product_id: string; object_position?: string | null } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, object_position")
    .eq("id", imageId)
    .single();
  if (error || !data) return null;
  const d = data as { product_id: string; object_position?: string | null };
  return { product_id: d.product_id, object_position: d.object_position ?? null };
}
