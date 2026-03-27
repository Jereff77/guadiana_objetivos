-- Tabla de configuración global del sistema (clave-valor)
CREATE TABLE IF NOT EXISTS public.system_config (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Lectura pública (landing page sin autenticación)
CREATE POLICY "system_config_read_all"
  ON public.system_config FOR SELECT
  USING (true);

-- Escritura solo para root o con permiso config.edit
CREATE POLICY "system_config_write_auth"
  ON public.system_config FOR ALL
  USING (
    auth.uid() IS NOT NULL AND (
      public.is_root()
      OR public.has_permission('config.edit')
    )
  );

-- Datos iniciales
INSERT INTO public.system_config (key, value) VALUES
  ('empresa_nombre',     'Mi Empresa'),
  ('empresa_slogan',     NULL),
  ('empresa_telefono',   NULL),
  ('empresa_email',      NULL),
  ('empresa_direccion',  NULL),
  ('branding_logo_url',  NULL),
  ('branding_color_hex', '#004B8D'),
  ('smtp_host',          NULL),
  ('smtp_port',          '587'),
  ('smtp_user',          NULL),
  ('smtp_password',      NULL),
  ('smtp_from_name',     NULL),
  ('smtp_from_email',    NULL),
  ('smtp_secure',        'false')
ON CONFLICT (key) DO NOTHING;

-- Bucket system-assets para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-assets', 'system-assets', true)
ON CONFLICT (id) DO NOTHING;
