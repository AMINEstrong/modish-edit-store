import { useQuery } from "@tanstack/react-query";
import {
  fetchProductBySlug,
  fetchProducts,
  type Gender,
  type Product,
} from "@/lib/products";

export const productKeys = {
  all: ["products"] as const,
  list: (filter?: { gender?: Gender; search?: string }) => ["products", "list", filter] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
};

export function useProducts(filter?: { gender?: Gender; search?: string }) {
  return useQuery({
    queryKey: productKeys.list(filter),
    queryFn: () => fetchProducts(filter),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => fetchProductBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: [...productKeys.all, "ids", ids.sort().join(",")] as const,
    queryFn: async (): Promise<Product[]> => {
      if (ids.length === 0) return [];
      const all = await fetchProducts();
      return all.filter((p) => ids.includes(p.id));
    },
    enabled: ids.length > 0,
  });
}
