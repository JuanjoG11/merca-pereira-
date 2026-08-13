-- ============================================================
-- MERCADO / LA VITRINA PEREIRANA - SQL Adicional para Admin
-- Ejecuta en: https://supabase.com/dashboard/project/wqqwmtfupeejqzfnujdm/sql/new
-- ============================================================

-- Políticas de UPDATE y DELETE para el panel de administración
DROP POLICY IF EXISTS "allow_admin_update" ON public.marketplace_products;
DROP POLICY IF EXISTS "allow_admin_delete" ON public.marketplace_products;

CREATE POLICY "allow_admin_update"
  ON public.marketplace_products FOR UPDATE USING (true);

CREATE POLICY "allow_admin_delete"
  ON public.marketplace_products FOR DELETE USING (true);

-- Columna opcional: ocultar/mostrar productos sin borrarlos
ALTER TABLE public.marketplace_products
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- ✅ Listo. El panel de admin ya puede editar y eliminar productos.
