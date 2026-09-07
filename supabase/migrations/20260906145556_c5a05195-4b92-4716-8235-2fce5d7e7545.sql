CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gift_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  size text,
  description text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gift_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_items TO authenticated;
GRANT ALL ON public.gift_items TO service_role;
ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active gifts are public" ON public.gift_items FOR SELECT USING (active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage gifts" ON public.gift_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gift_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_item_id uuid NOT NULL REFERENCES public.gift_items(id) ON DELETE CASCADE,
  guest_name text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 99),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT guest_name_length CHECK (guest_name IS NULL OR char_length(guest_name) <= 60)
);
CREATE INDEX gift_commitments_item_idx ON public.gift_commitments (gift_item_id);
GRANT INSERT ON public.gift_commitments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_commitments TO authenticated;
GRANT ALL ON public.gift_commitments TO service_role;
ALTER TABLE public.gift_commitments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests can promise gifts" ON public.gift_commitments FOR INSERT
  WITH CHECK (quantity >= 1 AND quantity <= 99 AND EXISTS (SELECT 1 FROM public.gift_items gi WHERE gi.id = gift_item_id AND gi.active));
CREATE POLICY "admins read commitments" ON public.gift_commitments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete commitments" ON public.gift_commitments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.gift_totals()
RETURNS TABLE (gift_item_id uuid, total_quantity bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.gift_item_id, SUM(c.quantity)::bigint
  FROM public.gift_commitments c
  GROUP BY c.gift_item_id
$$;
GRANT EXECUTE ON FUNCTION public.gift_totals() TO anon, authenticated;

INSERT INTO public.categories (name, display_order) VALUES
  ('Fraldas', 1),
  ('Mimos para Maya', 2),
  ('Mimos para mamãe Bella', 3);

INSERT INTO public.gift_items (category_id, name, size, display_order)
SELECT c.id, v.name, v.size, v.ord
FROM public.categories c
JOIN (VALUES
  ('Fraldas', 'Fralda descartável', 'RN', 1),
  ('Fraldas', 'Fralda descartável', 'P', 2),
  ('Fraldas', 'Fralda descartável', 'M', 3),
  ('Fraldas', 'Fralda descartável', 'G', 4),
  ('Mimos para Maya', 'Lenço umedecido sem perfume', NULL, 1),
  ('Mimos para Maya', 'Pomada para assadura', NULL, 2),
  ('Mimos para Maya', 'Sabonete líquido cabeça aos pés neutro', NULL, 3),
  ('Mimos para Maya', 'Fraldinha de boca', NULL, 4),
  ('Mimos para Maya', 'Fralda de ombro', NULL, 5),
  ('Mimos para Maya', 'Fralda passeio', NULL, 6),
  ('Mimos para Maya', 'Toalha com capuz', NULL, 7),
  ('Mimos para Maya', 'Kit mamadeira', NULL, 8),
  ('Mimos para Maya', 'Body manga curta', 'P', 9),
  ('Mimos para Maya', 'Body manga curta', 'M', 10),
  ('Mimos para Maya', 'Body manga longa fino', 'P', 11),
  ('Mimos para Maya', 'Body manga longa fino', 'M', 12),
  ('Mimos para Maya', 'Mijão sem pé / shortinho', 'P', 13),
  ('Mimos para Maya', 'Mijão sem pé / shortinho', 'M', 14),
  ('Mimos para Maya', 'Mijão com pé fino', 'P', 15),
  ('Mimos para Maya', 'Mijão com pé fino', 'M', 16),
  ('Mimos para Maya', 'Macaquinho curto de tecido leve ou algodão', 'M', 17),
  ('Mimos para Maya', 'Macacão longo fino de algodão', 'M', 18),
  ('Mimos para Maya', 'Cueiros finos', NULL, 19),
  ('Mimos para mamãe Bella', 'Higiene pessoal pós-parto e outros', NULL, 1)
) AS v(cat, name, size, ord) ON v.cat = c.name;