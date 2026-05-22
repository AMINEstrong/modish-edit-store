import { supabase } from "@/integrations/supabase/client";

async function authFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Connexion requise");
  }

  return fetch(path, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${session.access_token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

async function parseApiError(res: Response): Promise<never> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  throw new Error(data.error || `Erreur (${res.status})`);
}

export async function deleteOrder(orderId: string): Promise<void> {
  const res = await authFetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "DELETE",
  });
  if (!res.ok) await parseApiError(res);
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<void> {
  const res = await authFetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await parseApiError(res);
}
