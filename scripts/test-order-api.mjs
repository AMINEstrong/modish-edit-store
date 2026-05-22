/**
 * Quick smoke test: POST /api/orders (needs SUPABASE_SERVICE_ROLE_KEY in .env).
 * Run: node scripts/test-order-api.mjs
 * Dev server optional; uses Supabase admin client directly if API unreachable.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(name) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: products } = await admin.from("products").select("slug").limit(1);
const slug = products?.[0]?.slug;
if (!slug) {
  console.error("No products in DB — add one before testing orders");
  process.exit(1);
}

const body = {
  userId: null,
  orderData: {
    full_name: "Test API",
    email: "test-api@slistyle.local",
    phone: "0600000000",
    address: "1 rue test",
    city: "Casablanca",
    postal_code: "20000",
    country: "Maroc",
    payment_method: "cash_on_delivery",
  },
  items: [
    {
      productSlug: slug,
      productName: "Test product",
      size: "M",
      color: "#000000",
      quantity: 1,
      unitPrice: 99,
    },
  ],
  total: 99,
};

const port = process.env.TEST_PORT || "8080";
const res = await fetch(`http://127.0.0.1:${port}/api/orders`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const json = await res.json().catch(() => ({}));
console.log("POST /api/orders", res.status, json);

if (!json.orderId) process.exit(res.ok ? 0 : 1);

const { data: order, error } = await admin
  .from("orders")
  .select("*, order_items(*)")
  .eq("id", json.orderId)
  .single();

if (error) {
  console.error("DB read failed:", error.message);
  process.exit(1);
}

console.log("DB order:", {
  id: order.id.slice(0, 8),
  items: order.order_items?.length ?? 0,
  payment_method: order.payment_method ?? "(column absent)",
  status: order.status,
});

await admin.from("orders").delete().eq("id", json.orderId);
console.log("Cleanup: test order deleted");
