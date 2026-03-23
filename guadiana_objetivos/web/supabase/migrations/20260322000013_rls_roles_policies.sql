-- ============================================================
-- T-004: RLS para tablas M0
-- platform_modules, roles, role_permissions, role_change_log, profiles
-- ============================================================

-- platform_modules: lectura pública, escritura solo root
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_read_all" ON platform_modules
  FOR SELECT USING (true);
CREATE POLICY "modules_manage_root" ON platform_modules
  FOR ALL USING (is_root());

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_read" ON roles
  FOR SELECT USING (has_permission('roles.view') OR is_root());
CREATE POLICY "roles_manage" ON roles
  FOR ALL USING (has_permission('roles.manage') OR is_root());

-- role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_permissions_read" ON role_permissions
  FOR SELECT USING (has_permission('roles.view') OR is_root());
CREATE POLICY "role_permissions_manage" ON role_permissions
  FOR ALL USING (has_permission('roles.manage') OR is_root());

-- role_change_log
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_log_read_root" ON role_change_log
  FOR SELECT USING (is_root());
CREATE POLICY "role_log_insert" ON role_change_log
  FOR INSERT WITH CHECK (true);

-- profiles: nuevas políticas para M0 (las existentes se conservan)
CREATE POLICY "profiles_view_permission" ON profiles
  FOR SELECT USING (id = auth.uid() OR has_permission('users.view') OR is_root());
CREATE POLICY "profiles_edit_permission" ON profiles
  FOR UPDATE USING (id = auth.uid() OR has_permission('users.edit') OR is_root());
