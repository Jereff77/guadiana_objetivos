-- M9: Taller de Interdependencia en la Toma de Decisiones
-- Crea tabla, RLS, RPC y permission_keys

-- 1. Permission keys
INSERT INTO public.platform_modules (key, label, module, sort_order, is_active) VALUES
  ('taller_fill', 'Llenar y editar su formulario del taller', 'Taller', 110, true),
  ('taller_view_own', 'Ver su propio formulario del taller', 'Taller', 111, true),
  ('taller_view_all', 'Ver formularios del taller de todos los usuarios', 'Taller', 112, true)
ON CONFLICT (key) DO NOTHING;

-- 2. Tabla taller_decisiones
CREATE TABLE IF NOT EXISTS public.taller_decisiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  departamento TEXT,
  puesto TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT now(),
  fecha_actualizacion TIMESTAMPTZ,
  decisiones JSONB DEFAULT '[]'::jsonb,
  reflexion_1 TEXT,
  reflexion_2 TEXT,
  reflexion_3 TEXT,
  reflexion_4 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT taller_decisiones_user_id_unique UNIQUE (user_id)
);

-- 3. RLS
ALTER TABLE public.taller_decisiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "taller_insert_own" ON public.taller_decisiones
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "taller_select_own" ON public.taller_decisiones
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "taller_update_own" ON public.taller_decisiones
  FOR UPDATE USING (user_id = auth.uid());

-- 4. RPC: lista de usuarios activos para dropdowns
CREATE OR REPLACE FUNCTION public.get_taller_users()
RETURNS TABLE(id UUID, full_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name
  FROM profiles p
  WHERE p.is_active = true
  ORDER BY p.full_name ASC;
$$;
