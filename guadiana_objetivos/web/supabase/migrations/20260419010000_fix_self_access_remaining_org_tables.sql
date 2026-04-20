-- Fix: autoacceso para tablas del organigrama sin permiso organigrama.view
-- Usuarios con objetivos.view pero sin organigrama.view (ej: Gerencia) deben poder
-- leer su propia información en el organigrama para que getOrgContext() funcione.

-- 1. org_members: el usuario ve sus propias membresías de área
CREATE POLICY "organigrama_view_members_self_access"
  ON org_members FOR SELECT
  USING (user_id = auth.uid());

-- 2. org_areas: responsable de área, responsable de depto, o miembro de área/depto
CREATE POLICY "organigrama_view_areas_self_access"
  ON org_areas FOR SELECT
  USING (
    responsible_id = auth.uid()
    OR department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
    )
    OR id IN (
      SELECT area_id FROM org_members WHERE user_id = auth.uid()
    )
    OR department_id IN (
      SELECT department_id FROM org_department_members WHERE user_id = auth.uid()
    )
  );

-- 3. org_department_members: el usuario ve sus propias membresías de departamento
CREATE POLICY "org_dept_members_self_access"
  ON org_department_members FOR SELECT
  USING (user_id = auth.uid());

-- 4. org_direction: cualquier usuario autenticado puede leer (información estructural)
CREATE POLICY "org_direction_select_authenticated"
  ON org_direction FOR SELECT
  USING (auth.uid() IS NOT NULL);
