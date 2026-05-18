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

export type Gender = "homme" | "femme";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  gender: Gender;
  category: string;
  image: string;
  colors: string[]; // hex
  sizes: string[];
  description: string;
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

export const products: Product[] = [
  {
    id: "m1", slug: "essential-cotton-tee", name: "Essential Cotton Tee",
    price: 45, gender: "homme", category: "T-shirts", image: tshirt,
    colors: ["#f5f3ee", "#0d0d0d", "#8b7355"],
    sizes: ["XS", "S", "M", "L", "XL"], stock: 24,
    description: "A wardrobe staple cut from heavyweight organic cotton. Clean lines, considered fit.",
  },
  {
    id: "m2", slug: "atelier-hoodie", name: "Atelier Heavy Hoodie",
    price: 145, gender: "homme", category: "Hoodies", image: hoodie,
    colors: ["#2d2d2d", "#0d0d0d", "#e8e4dd"],
    sizes: ["S", "M", "L", "XL"], stock: 12,
    description: "500gsm brushed loopback. Boxy oversized fit with a structured hood.",
  },
  {
    id: "m3", slug: "wool-overcoat", name: "Tailored Wool Overcoat",
    price: 590, gender: "homme", category: "Jackets", image: jacket,
    colors: ["#0d0d0d", "#2d2d2d"],
    sizes: ["S", "M", "L", "XL"], stock: 6,
    description: "Single-breasted overcoat in pure Italian wool. Notch lapel, two-button closure.",
  },
  {
    id: "m4", slug: "selvedge-denim", name: "Selvedge Straight Denim",
    price: 220, gender: "homme", category: "Jeans", image: jeansM,
    colors: ["#0c1a3a", "#0d0d0d"],
    sizes: ["28", "30", "32", "34", "36"], stock: 18,
    description: "14oz Japanese selvedge denim with a clean straight leg. Made to age beautifully.",
  },
  {
    id: "m5", slug: "low-leather-sneaker", name: "Low Leather Sneaker",
    price: 280, gender: "homme", category: "Shoes", image: sneakers,
    colors: ["#f5f3ee", "#0d0d0d"],
    sizes: ["40", "41", "42", "43", "44", "45"], stock: 9,
    description: "Hand-finished Italian leather upper on a cup sole. Quiet luxury at its best.",
  },
  {
    id: "f1", slug: "silk-slip-dress", name: "Silk Bias Slip Dress",
    price: 380, gender: "femme", category: "Dresses", image: dress,
    colors: ["#f0ebe3", "#0d0d0d"],
    sizes: ["XS", "S", "M", "L"], stock: 8,
    description: "Bias-cut silk charmeuse with delicate adjustable straps. Light as air.",
  },
  {
    id: "f2", slug: "draped-silk-blouse", name: "Draped Silk Blouse",
    price: 245, gender: "femme", category: "Tops", image: top,
    colors: ["#f0ebe3", "#0d0d0d", "#8b7355"],
    sizes: ["XS", "S", "M", "L"], stock: 14,
    description: "Fluid silk crêpe with a soft cowl neckline and mother-of-pearl buttons.",
  },
  {
    id: "f3", slug: "pleated-midi-skirt", name: "Pleated Midi Skirt",
    price: 195, gender: "femme", category: "Skirts", image: skirt,
    colors: ["#c2956b", "#0d0d0d"],
    sizes: ["XS", "S", "M", "L"], stock: 11,
    description: "Sunray pleats in a featherlight crêpe. Sits high on the waist, flows below the knee.",
  },
  {
    id: "f4", slug: "pointed-leather-pump", name: "Pointed Leather Pump",
    price: 320, gender: "femme", category: "Heels", image: heels,
    colors: ["#0d0d0d"],
    sizes: ["36", "37", "38", "39", "40", "41"], stock: 7,
    description: "A clean, elongated silhouette in soft Italian nappa leather. 90mm heel.",
  },
  {
    id: "f5", slug: "structured-tote", name: "Structured Leather Tote",
    price: 450, gender: "femme", category: "Bags", image: bag,
    colors: ["#c2956b", "#0d0d0d"],
    sizes: ["One Size"], stock: 5,
    description: "Vegetable-tanned calfskin with brushed brass hardware. Roomy yet refined.",
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProducts(filter: {
  gender?: Gender;
  category?: string;
  size?: string;
  color?: string;
  maxPrice?: number;
  minPrice?: number;
  search?: string;
} = {}) {
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
