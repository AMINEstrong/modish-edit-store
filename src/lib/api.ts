async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function signUpUser(data: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ success: boolean; error?: string }> {
  return postJson("/api/signup", data);
}

export async function placeOrder(data: {
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
}): Promise<{ success: boolean; error?: string; orderId?: string }> {
  return postJson("/api/orders", data);
}
