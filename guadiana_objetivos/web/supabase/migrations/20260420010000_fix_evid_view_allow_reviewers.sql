-- Permite a revisores (objetivos.review) y responsables de depto/área ver evidencias.
-- Antes solo tenían acceso quienes tenían objetivos.view, bloqueando la revisión.
DROP POLICY IF EXISTS "evid_view" ON objective_evidences;

CREATE POLICY "evid_view" ON objective_evidences
  FOR SELECT USING (
    is_root()
    OR has_permission('objetivos.view')
    OR has_permission('objetivos.review')
    OR submitted_by = auth.uid()
    OR deliverable_id IN (
      SELECT od.id
      FROM objective_deliverables od
      JOIN objectives o ON o.id = od.objective_id
      WHERE o.org_department_id IN (
        SELECT id FROM org_departments WHERE responsible_id = auth.uid()
        UNION ALL
        SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
      )
    )
  );
