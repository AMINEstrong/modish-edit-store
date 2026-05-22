import { createClient } from "@supabase/supabase-js";

let adminSupabase = null;
let anonSupabase = null;

function getSupabaseUrl() {
  return (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    "https://tcancucbtrzirgyrwwee.supabase.co"
  );
}

function getAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

function getAdminSupabase() {
  if (!adminSupabase) {
    const supabaseUrl = getSupabaseUrl();
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

function getAnonSupabase() {
  if (!anonSupabase) {
    anonSupabase = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return anonSupabase;
}

async function getUserFromRequest(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  const { data, error } = await getAnonSupabase().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

async function userIsAdmin(admin, userId) {
  const { data } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

function isMissingPaymentMethodColumn(error) {
  const msg = error?.message ?? "";
  return (
    msg.includes("payment_method") &&
    (msg.includes("column") || msg.includes("schema cache"))
  );
}

async function insertOrder(admin, payload) {
  let result = await admin.from("orders").insert(payload).select().single();
  if (result.error && isMissingPaymentMethodColumn(result.error)) {
    const { payment_method: _pm, ...withoutPayment } = payload;
    result = await admin.from("orders").insert(withoutPayment).select().single();
  }
  return result;
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

      const paymentMethod = orderData.payment_method || "cash_on_delivery";
      if (paymentMethod !== "cash_on_delivery") {
        return res.status(400).json({ success: false, error: "Invalid payment method" });
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

      const { data: order, error: orderErr } = await insertOrder(admin, {
        user_id: userId || null,
        full_name: orderData.full_name,
        email: orderData.email,
        phone: orderData.phone || null,
        address: orderData.address,
        city: orderData.city,
        postal_code: orderData.postal_code,
        country: orderData.country,
        payment_method: paymentMethod,
        total,
        status: "pending",
      });

      if (orderErr) {
        return res.status(400).json({ success: false, error: orderErr.message });
      }

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: idBySlug.get(i.productSlug) ?? null,
        product_name: String(i.productName ?? "").trim() || "Article",
        size: String(i.size ?? "").trim() || "Taille unique",
        color: String(i.color ?? "").trim() || "Couleur unique",
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unitPrice) || 0,
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

  app.patch("/api/orders/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body ?? {};

      if (!orderId) {
        return res.status(400).json({ success: false, error: "Missing order id" });
      }
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status" });
      }
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
          success: false,
          error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
        });
      }

      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const admin = getAdminSupabase();
      if (!(await userIsAdmin(admin, user.id))) {
        return res.status(403).json({ success: false, error: "Admin only" });
      }

      const { error: updateErr } = await admin
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (updateErr) {
        return res.status(400).json({ success: false, error: updateErr.message });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("[api/orders PATCH]", err);
      return res
        .status(500)
        .json({ success: false, error: err?.message || "Update failed" });
    }
  });

  app.delete("/api/orders/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      if (!orderId) {
        return res.status(400).json({ success: false, error: "Missing order id" });
      }

      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({
          success: false,
          error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
        });
      }

      const user = await getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const admin = getAdminSupabase();
      const isAdmin = await userIsAdmin(admin, user.id);

      if (!isAdmin) {
        const { data: order, error: fetchErr } = await admin
          .from("orders")
          .select("user_id")
          .eq("id", orderId)
          .maybeSingle();

        if (fetchErr || !order) {
          return res.status(404).json({ success: false, error: "Order not found" });
        }
        if (order.user_id !== user.id) {
          return res.status(403).json({ success: false, error: "Forbidden" });
        }
      }

      const { error: delErr } = await admin.from("orders").delete().eq("id", orderId);
      if (delErr) {
        return res.status(400).json({ success: false, error: delErr.message });
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("[api/orders DELETE]", err);
      return res
        .status(500)
        .json({ success: false, error: err?.message || "Delete failed" });
    }
  });
}
