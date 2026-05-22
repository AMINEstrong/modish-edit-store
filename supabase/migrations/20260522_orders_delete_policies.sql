-- Allow users to delete their own orders; admins can delete any order.
-- order_items are removed via ON DELETE CASCADE.

DROP POLICY IF EXISTS "Users delete own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;

CREATE POLICY "Users delete own orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
