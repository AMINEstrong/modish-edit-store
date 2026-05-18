-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Trigger: auto-create profile + assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  gender TEXT NOT NULL CHECK (gender IN ('homme', 'femme')),
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  colors TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] NOT NULL DEFAULT '{}',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles policies
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- products policies (public read, admin write)
CREATE POLICY "Anyone views products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- orders policies
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- order_items policies
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create own order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
);

-- updated_at trigger for products
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial catalog
INSERT INTO public.products (slug, name, description, price, gender, category, image_url, colors, sizes, stock) VALUES
('essential-cotton-tee', 'Essential Cotton Tee', 'A wardrobe staple cut from heavyweight organic cotton. Clean lines, considered fit.', 45, 'homme', 'T-shirts', '/src/assets/p-tshirt.jpg', ARRAY['#f5f3ee','#0d0d0d','#8b7355'], ARRAY['XS','S','M','L','XL'], 24),
('atelier-hoodie', 'Atelier Heavy Hoodie', '500gsm brushed loopback. Boxy oversized fit with a structured hood.', 145, 'homme', 'Hoodies', '/src/assets/p-hoodie.jpg', ARRAY['#2d2d2d','#0d0d0d','#e8e4dd'], ARRAY['S','M','L','XL'], 12),
('wool-overcoat', 'Tailored Wool Overcoat', 'Single-breasted overcoat in pure Italian wool. Notch lapel, two-button closure.', 590, 'homme', 'Jackets', '/src/assets/p-jacket.jpg', ARRAY['#0d0d0d','#2d2d2d'], ARRAY['S','M','L','XL'], 6),
('selvedge-denim', 'Selvedge Straight Denim', '14oz Japanese selvedge denim with a clean straight leg. Made to age beautifully.', 220, 'homme', 'Jeans', '/src/assets/p-jeans-m.jpg', ARRAY['#0c1a3a','#0d0d0d'], ARRAY['28','30','32','34','36'], 18),
('low-leather-sneaker', 'Low Leather Sneaker', 'Hand-finished Italian leather upper on a cup sole. Quiet luxury at its best.', 280, 'homme', 'Shoes', '/src/assets/p-sneakers.jpg', ARRAY['#f5f3ee','#0d0d0d'], ARRAY['40','41','42','43','44','45'], 9),
('silk-slip-dress', 'Silk Bias Slip Dress', 'Bias-cut silk charmeuse with delicate adjustable straps. Light as air.', 380, 'femme', 'Dresses', '/src/assets/p-dress.jpg', ARRAY['#f0ebe3','#0d0d0d'], ARRAY['XS','S','M','L'], 8),
('draped-silk-blouse', 'Draped Silk Blouse', 'Fluid silk crêpe with a soft cowl neckline and mother-of-pearl buttons.', 245, 'femme', 'Tops', '/src/assets/p-top.jpg', ARRAY['#f0ebe3','#0d0d0d','#8b7355'], ARRAY['XS','S','M','L'], 14),
('pleated-midi-skirt', 'Pleated Midi Skirt', 'Sunray pleats in a featherlight crêpe. Sits high on the waist, flows below the knee.', 195, 'femme', 'Skirts', '/src/assets/p-skirt.jpg', ARRAY['#c2956b','#0d0d0d'], ARRAY['XS','S','M','L'], 11),
('pointed-leather-pump', 'Pointed Leather Pump', 'A clean, elongated silhouette in soft Italian nappa leather. 90mm heel.', 320, 'femme', 'Heels', '/src/assets/p-heels.jpg', ARRAY['#0d0d0d'], ARRAY['36','37','38','39','40','41'], 7),
('structured-tote', 'Structured Leather Tote', 'Vegetable-tanned calfskin with brushed brass hardware. Roomy yet refined.', 450, 'femme', 'Bags', '/src/assets/p-bag.jpg', ARRAY['#c2956b','#0d0d0d'], ARRAY['One Size'], 5);