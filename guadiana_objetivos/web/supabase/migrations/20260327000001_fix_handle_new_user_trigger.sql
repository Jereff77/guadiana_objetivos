-- ============================================================
-- Fix handle_new_user trigger
-- Problemas anteriores:
--   1. Faltaba SET search_path = public (tablas no encontradas)
--   2. El SELECT a roles con RLS podía fallar silenciosamente
--   3. Sin EXCEPTION WHEN OTHERS: un error bloqueaba la creación de auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Intentar obtener el primer rol no-root activo (falla silenciosa si RLS lo bloquea)
  BEGIN
    SELECT id INTO default_role_id
    FROM public.roles
    WHERE is_root = false AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    default_role_id := NULL;
  END;

  -- Insertar perfil; ON CONFLICT DO NOTHING para idempotencia
  INSERT INTO public.profiles (id, full_name, role, role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'asesor',
    default_role_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca fallar la creación de auth.users por un error del trigger
  RAISE WARNING 'handle_new_user: error creando profile para %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
