import { createClient } from "@supabase/supabase-js";

let adminSupabase = null;

function getAdminSupabase() {
  if (!adminSupabase) {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      "https://tcancucbtrzirgyrwwee.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY is not set — signup and orders API will fail.",
      );
    }

    adminSupabase = createClient(supabaseUrl, serviceRoleKey || "", {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminSupabase;
}

export function registerApiRoutes(app) {
  app.post("/api/signup", async (req, res) => {
    try {
      const { email, password, fullName } = req.body ?? {};
      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, error: "Missing fields" });
      }

      const { error } = await getAdminSupabase().auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("[api/signup]", err);
      return res
        .status(500)
        .json({ success: false, error: err?.message || "Signup failed" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { userId, orderData, items, total } = req.body ?? {};

      if (!orderData || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: "Invalid order data" });
      }

      const admin = getAdminSupabase();
      const slugs = [...new Set(items.map((i) => i.productSlug))];
      const { data: dbProducts, error: lookupErr } = await admin
        .from("products")
        .select("id, slug")
        .in("slug", slugs);

      if (lookupErr) {
        return res
          .status(500)
          .json({ success: false, error: "Failed to lookup products" });
      }

      const idBySlug = new Map((dbProducts ?? []).map((p) => [p.slug, p.id]));

      const { data: order, error: orderErr } = await admin
        .from("orders")
        .insert({
          user_id: userId || null,
          full_name: orderData.full_name,
          email: orderData.email,
          phone: orderData.phone || null,
          address: orderData.address,
          city: orderData.city,
          postal_code: orderData.postal_code,
          country: orderData.country,
          total,
          status: "pending",
        })
        .select()
        .single();

      if (orderErr) {
        return res.status(400).json({ success: false, error: orderErr.message });
      }

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: idBySlug.get(i.productSlug) ?? null,
        product_name: i.productName,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }));

      const { error: itemsErr } = await admin.from("order_items").insert(itemsPayload);

      if (itemsErr) {
        await admin.from("orders").delete().eq("id", order.id);
        return res
          .status(500)
          .json({ success: false, error: "Failed to save order items" });
      }

      return res.json({ success: true, orderId: order.id });
    } catch (err) {
      console.error("[api/orders]", err);
      return res
        .status(500)
        .json({ success: false, error: err?.message || "Order failed" });
    }
  });
}
