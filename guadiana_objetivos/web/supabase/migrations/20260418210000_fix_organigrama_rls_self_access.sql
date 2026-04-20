-- Fix: usuarios responsables o miembros del organigrama pueden ver
-- su propia información sin necesitar el permiso organigrama.view

-- 1. org_departments — el responsable ve su propio departamento
DROP POLICY IF EXISTS "organigrama_view_departments" ON org_departments;
CREATE POLICY "organigrama_view_departments"
  ON org_departments FOR SELECT
  USING (
    has_permission('organigrama.view')
    OR is_root()
    OR responsible_id = auth.uid()
  );

-- 2. org_areas — responsable de área ve sus áreas;
--    responsable de depto ve todas las áreas de su depto;
--    miembro de área ve su propia área
DROP POLICY IF EXISTS "organigrama_view_areas" ON org_areas;
CREATE POLICY "organigrama_view_areas"
  ON org_areas FOR SELECT
  USING (
    has_permission('organigrama.view')
    OR is_root()
    OR responsible_id = auth.uid()
    OR department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
    )
    OR id IN (
      SELECT area_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- 3. org_members — usuario ve sus propias membresías de área
DROP POLICY IF EXISTS "organigrama_view_members" ON org_members;
CREATE POLICY "organigrama_view_members"
  ON org_members FOR SELECT
  USING (
    has_permission('organigrama.view')
    OR is_root()
    OR user_id = auth.uid()
  );
