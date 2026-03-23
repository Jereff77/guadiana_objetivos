-- ============================================================
-- T-003: Funciones SQL de permisos (M0)
-- is_root(), has_permission(), current_user_role_id()
-- Actualización de handle_new_user()
-- ============================================================

-- Verificar si el usuario actual tiene rol root
CREATE OR REPLACE FUNCTION is_root()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.is_root = true
  );
$$;

-- Verificar un permiso específico (root bypasea todo)
CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT is_root() OR EXISTS (
    SELECT 1
    FROM profiles p
    JOIN role_permissions rp ON rp.role_id = p.role_id
    JOIN platform_modules pm ON pm.id = rp.module_id
    WHERE p.id = auth.uid()
      AND pm.key = permission_key
      AND pm.is_active = true
  );
$$;

-- Obtener el role_id del usuario actual
CREATE OR REPLACE FUNCTION current_user_role_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role_id FROM profiles WHERE id = auth.uid();
$$;

-- Actualizar handle_new_user para asignar role_id por defecto
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Obtener el primer rol no-root activo (si existe)
  SELECT id INTO default_role_id
  FROM roles
  WHERE is_root = false AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO profiles (id, full_name, role, role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'asesor',        -- mantener campo legacy durante migración
    default_role_id  -- nuevo campo
  );
  RETURN NEW;
END;
$$;
