import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// Helper to lazily initialize the Supabase Admin Client ONLY on the server side.
let adminSupabaseInstance: ReturnType<typeof createClient> | null = null;

function getAdminSupabase() {
  if (typeof window !== "undefined") {
    throw new Error("getAdminSupabase can only be executed on the server side.");
  }
  if (!adminSupabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://tcancucbtrzirgyrwwee.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables on the server.");
    }

    adminSupabaseInstance = createClient(supabaseUrl, serviceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return adminSupabaseInstance;
}

/**
 * Server function to sign up a user and automatically confirm their email.
 * This bypasses the email verification step completely.
 */
export const signUpUserFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: { email: string; password: string; fullName: string } }) => {
    try {
      const { email, password, fullName } = data;
      console.log("👤 [Server] Creating auto-confirmed user for:", email);

      const adminSupabase = getAdminSupabase();
      const { data: userData, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (error) {
        console.error("❌ [Server] Supabase admin user creation error:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ [Server] Auto-confirmed user created successfully:", userData.user?.id);
      return { success: true };
    } catch (err: any) {
      console.error("💥 [Server] signUpUserFn unhandled error:", err);
      return { success: false, error: err?.message || "An unexpected error occurred during signup." };
    }
  });

/**
 * Server function to place an order and insert its items.
 * Bypasses RLS policies by using the service role client.
 */
export const placeOrderFn = createServerFn({ method: "POST" })
  .handler(async ({ data }: {
    data: {
      userId: string | null;
      orderData: {
        full_name: string;
        email: string;
        phone?: string;
        address: string;
        city: string;
        postal_code: string;
        country: string;
      };
      items: Array<{
        productSlug: string;
        productName: string;
        size: string;
        color: string;
        quantity: number;
        unitPrice: number;
      }>;
      total: number;
    }
  }) => {
    try {
      const { userId, orderData, items, total } = data;
      console.log("📦 [Server] Processing new order submission...", { userId, email: orderData?.email });

      if (!orderData) {
        throw new Error("Missing order data parameters.");
      }

      const adminSupabase = getAdminSupabase();

      // 1. Fetch matching product IDs from database using slugs
      const slugs = Array.from(new Set(items.map((i) => i.productSlug)));
      const { data: dbProducts, error: lookupErr } = await adminSupabase
        .from("products")
        .select("id, slug")
        .in("slug", slugs);

      if (lookupErr) {
        console.error("❌ [Server] Products lookup error:", lookupErr);
        return { success: false, error: "Failed to lookup products details." };
      }
      
      const idBySlug = new Map((dbProducts ?? []).map((p) => [p.slug, p.id as string]));

      // 2. Insert order
      console.log("📝 [Server] Inserting order into DB...");
      const { data: order, error: orderErr } = await adminSupabase
        .from("orders")
        .insert({
          user_id: userId || null, // null if guest checkout
          full_name: orderData.full_name,
          email: orderData.email,
          phone: orderData.phone || null,
          address: orderData.address,
          city: orderData.city,
          postal_code: orderData.postal_code,
          country: orderData.country,
          total: total,
          status: "pending",
        })
        .select()
        .single();

      if (orderErr) {
        console.error("❌ [Server] Order insertion failed:", orderErr);
        return { success: false, error: orderErr.message };
      }

      console.log("✅ [Server] Order inserted successfully. Order ID:", order.id);

      // 3. Insert order items
      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: idBySlug.get(i.productSlug) ?? null,
        product_name: i.productName,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unit_price: i.unitPrice,
      }));

      console.log("📋 [Server] Inserting order items:", itemsPayload.length);
      const { error: itemsErr } = await adminSupabase
        .from("order_items")
        .insert(itemsPayload);

      if (itemsErr) {
        console.error("❌ [Server] Order items insertion failed:", itemsErr);
        // Attempt to clean up the orphaned order since items failed
        await adminSupabase.from("orders").delete().eq("id", order.id);
        return { success: false, error: "Failed to save order items details." };
      }

      console.log("🎉 [Server] Order and items processed successfully!");
      return { success: true, orderId: order.id };
    } catch (err: any) {
      console.error("💥 [Server] placeOrderFn unhandled error:", err);
      return { success: false, error: err?.message || "An unexpected error occurred while placing your order." };
    }
  });
