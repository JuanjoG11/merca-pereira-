-- ============================================================
-- MERCADO PEREIRA RESILIENTE - Setup COMPLETO para Supabase
-- Ejecuta este script en:
-- https://supabase.com/dashboard/project/wqqwmtfupeejqzfnujdm/sql/new
-- ============================================================

-- 1. Tabla principal de productos
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT,
  price             NUMERIC NOT NULL DEFAULT 0,
  category          TEXT,
  neighborhood      TEXT,
  neighborhood_name TEXT,
  seller_name       TEXT NOT NULL,
  seller_phone      TEXT NOT NULL,
  delivery_badge    TEXT DEFAULT 'domicilio',
  image             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de acceso (borrar antes si ya existen, luego crear)
DROP POLICY IF EXISTS "allow_public_read"   ON public.marketplace_products;
DROP POLICY IF EXISTS "allow_public_insert" ON public.marketplace_products;

CREATE POLICY "allow_public_read"
  ON public.marketplace_products FOR SELECT USING (true);

CREATE POLICY "allow_public_insert"
  ON public.marketplace_products FOR INSERT WITH CHECK (true);

-- 4. Realtime (solo agregar si no está ya en la publicación)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'marketplace_products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_products;
  END IF;
END $$;

-- 5. Bucket de Storage para fotos (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 6. Políticas del bucket de Storage
DROP POLICY IF EXISTS "allow_public_storage_read"   ON storage.objects;
DROP POLICY IF EXISTS "allow_public_storage_upload" ON storage.objects;

CREATE POLICY "allow_public_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "allow_public_storage_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

-- ✅ Listo! Tabla, RLS, Realtime y Storage configurados.
