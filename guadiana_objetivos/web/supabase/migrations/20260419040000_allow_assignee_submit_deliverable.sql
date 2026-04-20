-- Permite al assignee de un entregable actualizar su propio status a 'submitted'
-- La policy anterior solo permitía a responsables de departamento/área actualizar entregables.

DROP POLICY IF EXISTS "deliv_update" ON objective_deliverables;

CREATE POLICY "deliv_update" ON objective_deliverables
  FOR UPDATE USING (
    is_root()
    OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
    OR objective_id IN (
      SELECT o.id FROM objectives o
      WHERE o.org_department_id IN (
        SELECT id FROM org_departments WHERE responsible_id = auth.uid()
        UNION ALL
        SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
      )
    )
    OR assignee_id = auth.uid()  -- el propio asignado puede enviar su entregable
  );
