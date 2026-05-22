-- Payment method on orders (checkout select: cash on delivery).
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery';

ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_payment_method_check
CHECK (payment_method IN ('cash_on_delivery'));
