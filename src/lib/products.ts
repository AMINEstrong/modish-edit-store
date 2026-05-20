import tshirt from "@/assets/p-tshirt.jpg";
import hoodie from "@/assets/p-hoodie.jpg";
import jacket from "@/assets/p-jacket.jpg";
import jeansM from "@/assets/p-jeans-m.jpg";
import sneakers from "@/assets/p-sneakers.jpg";
import dress from "@/assets/p-dress.jpg";
import heels from "@/assets/p-heels.jpg";
import bag from "@/assets/p-bag.jpg";
import top from "@/assets/p-top.jpg";
import skirt from "@/assets/p-skirt.jpg";
import { supabase } from "@/integrations/supabase/client";

export type Gender = "homme" | "femme";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  gender: Gender;
  category: string;
  image: string;
  additionalImages: string[];
  colors: string[];
  sizes: string[];
  description: string;
  stock: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  gender: string;
  category: string;
  image_url: string;
  additional_images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
};

export const HOMME_CATEGORIES = [
  "T-shirts",
  "Hoodies",
  "Jackets",
  "Jeans",
  "Shoes",
  "Accessories",
] as const;

export const FEMME_CATEGORIES = [
  "Dresses",
  "Tops",
  "Skirts",
  "Jeans",
  "Heels",
  "Bags",
  "Accessories",
] as const;

const SLUG_IMAGES: Record<string, string> = {
  "essential-cotton-tee": tshirt,
  "atelier-hoodie": hoodie,
  "wool-overcoat": jacket,
  "selvedge-denim": jeansM,
  "low-leather-sneaker": sneakers,
  "silk-slip-dress": dress,
  "draped-silk-blouse": top,
  "pleated-midi-skirt": skirt,
  "pointed-leather-pump": heels,
  "structured-tote": bag,
};

const FILENAME_IMAGES: Record<string, string> = {
  "p-tshirt.jpg": tshirt,
  "p-hoodie.jpg": hoodie,
  "p-jacket.jpg": jacket,
  "p-jeans-m.jpg": jeansM,
  "p-sneakers.jpg": sneakers,
  "p-dress.jpg": dress,
  "p-top.jpg": top,
  "p-skirt.jpg": skirt,
  "p-heels.jpg": heels,
  "p-bag.jpg": bag,
};

export function resolveProductImage(slug: string, imageUrl: string): string {
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }
  if (SLUG_IMAGES[slug]) return SLUG_IMAGES[slug];
  const filename = imageUrl.split("/").pop() ?? "";
  if (FILENAME_IMAGES[filename]) return FILENAME_IMAGES[filename];
  return imageUrl;
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    gender: row.gender as Gender,
    category: row.category,
    image: resolveProductImage(row.slug, row.image_url),
    additionalImages: (row.additional_images ?? []).map(img => resolveProductImage(row.slug, img)),
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    stock: row.stock ?? 0,
  };
}

export async function fetchProducts(
  filter: {
    gender?: Gender;
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
  } = {},
): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("created_at", { ascending: false });

  if (filter.gender) query = query.eq("gender", filter.gender);

  const { data, error } = await query;
  if (error) throw error;

  return filterProducts((data as ProductRow[]).map(mapProductRow), filter);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapProductRow(data as ProductRow);
}

export function filterProducts(
  products: Product[],
  filter: {
    gender?: Gender;
    category?: string;
    size?: string;
    color?: string;
    maxPrice?: number;
    minPrice?: number;
    search?: string;
  } = {},
): Product[] {
  return products.filter((p) => {
    if (filter.gender && p.gender !== filter.gender) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (filter.size && !p.sizes.includes(filter.size)) return false;
    if (filter.color && !p.colors.includes(filter.color)) return false;
    if (filter.minPrice != null && p.price < filter.minPrice) return false;
    if (filter.maxPrice != null && p.price > filter.maxPrice) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
