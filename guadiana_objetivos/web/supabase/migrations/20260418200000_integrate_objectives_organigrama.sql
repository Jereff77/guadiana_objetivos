-- =============================================================
-- FASE 1: Limpiar datos de prueba huérfanos
-- =============================================================
DELETE FROM objective_reviews WHERE deliverable_id IN (
  SELECT od.id FROM objective_deliverables od
  JOIN objectives o ON o.id = od.objective_id
);
DELETE FROM objective_deliverables WHERE objective_id IN (SELECT id FROM objectives);
DELETE FROM objective_progress WHERE objective_id IN (SELECT id FROM objectives);
DELETE FROM objectives;

-- =============================================================
-- FASE 2: objectives — reemplazar department_id → org_department_id
-- =============================================================

ALTER TABLE objectives DROP CONSTRAINT IF EXISTS objectives_department_id_month_year_title_key;
ALTER TABLE objectives DROP CONSTRAINT IF EXISTS objectives_department_id_fkey;

ALTER TABLE objectives
  ADD COLUMN org_department_id UUID REFERENCES org_departments(id) ON DELETE CASCADE;

ALTER TABLE objectives ALTER COLUMN org_department_id SET NOT NULL;
ALTER TABLE objectives DROP COLUMN department_id;

ALTER TABLE objectives ADD CONSTRAINT objectives_org_dept_month_year_title_key
  UNIQUE (org_department_id, month, year, title);

-- =============================================================
-- FASE 3: objective_progress — eliminar department_id
-- =============================================================

ALTER TABLE objective_progress DROP CONSTRAINT IF EXISTS objective_progress_department_id_fkey;
ALTER TABLE objective_progress DROP COLUMN IF EXISTS department_id;

-- =============================================================
-- FASE 4: Eliminar tabla departments y sus políticas
-- =============================================================

DROP POLICY IF EXISTS dept_view ON departments;
DROP POLICY IF EXISTS dept_manage ON departments;
DROP TABLE IF EXISTS departments CASCADE;

-- =============================================================
-- FASE 5: Nuevas RLS para objectives
-- =============================================================

DROP POLICY IF EXISTS obj_view ON objectives;
DROP POLICY IF EXISTS obj_manage ON objectives;

CREATE POLICY "obj_select" ON objectives FOR SELECT
USING (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR org_department_id IN (
    SELECT id FROM org_departments WHERE responsible_id = auth.uid()
  )
  OR org_department_id IN (
    SELECT department_id FROM org_department_members WHERE user_id = auth.uid()
  )
  OR org_department_id IN (
    SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
  )
  OR org_department_id IN (
    SELECT DISTINCT oa.department_id
    FROM org_areas oa
    JOIN org_members om ON om.area_id = oa.id
    WHERE om.user_id = auth.uid()
  )
);

CREATE POLICY "obj_insert" ON objectives FOR INSERT
WITH CHECK (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR org_department_id IN (
    SELECT id FROM org_departments WHERE responsible_id = auth.uid()
  )
);

CREATE POLICY "obj_update" ON objectives FOR UPDATE
USING (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR org_department_id IN (
    SELECT id FROM org_departments WHERE responsible_id = auth.uid()
  )
);

CREATE POLICY "obj_delete" ON objectives FOR DELETE
USING (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR org_department_id IN (
    SELECT id FROM org_departments WHERE responsible_id = auth.uid()
  )
);

-- =============================================================
-- FASE 6: Nuevas RLS para objective_deliverables
-- =============================================================

DROP POLICY IF EXISTS deliv_view ON objective_deliverables;
DROP POLICY IF EXISTS deliv_manage ON objective_deliverables;

CREATE POLICY "deliv_select" ON objective_deliverables FOR SELECT
USING (
  is_root()
  OR assignee_id = auth.uid()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR objective_id IN (
    SELECT o.id FROM objectives o
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
      UNION ALL
      SELECT department_id FROM org_department_members WHERE user_id = auth.uid()
      UNION ALL
      SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
      UNION ALL
      SELECT DISTINCT oa.department_id
      FROM org_areas oa
      JOIN org_members om ON om.area_id = oa.id
      WHERE om.user_id = auth.uid()
    )
  )
);

CREATE POLICY "deliv_insert" ON objective_deliverables FOR INSERT
WITH CHECK (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR objective_id IN (
    SELECT o.id FROM objectives o
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
    )
  )
  OR (
    assignee_id IN (
      SELECT om.user_id FROM org_members om
      JOIN org_areas oa ON oa.id = om.area_id
      WHERE oa.responsible_id = auth.uid()
    )
    AND objective_id IN (
      SELECT o.id FROM objectives o
      WHERE o.org_department_id IN (
        SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "deliv_update" ON objective_deliverables FOR UPDATE
USING (
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
);

CREATE POLICY "deliv_delete" ON objective_deliverables FOR DELETE
USING (
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
);

-- =============================================================
-- FASE 7: Nuevas RLS para objective_reviews
-- =============================================================

DROP POLICY IF EXISTS review_view ON objective_reviews;
DROP POLICY IF EXISTS review_create ON objective_reviews;

CREATE POLICY "review_select" ON objective_reviews FOR SELECT
USING (
  is_root()
  OR reviewer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR deliverable_id IN (
    SELECT id FROM objective_deliverables WHERE assignee_id = auth.uid()
  )
  OR deliverable_id IN (
    SELECT od.id FROM objective_deliverables od
    JOIN objectives o ON o.id = od.objective_id
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
      UNION ALL
      SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
    )
  )
);

CREATE POLICY "review_insert" ON objective_reviews FOR INSERT
WITH CHECK (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR deliverable_id IN (
    SELECT od.id FROM objective_deliverables od
    JOIN objectives o ON o.id = od.objective_id
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
    )
  )
  OR deliverable_id IN (
    SELECT od.id FROM objective_deliverables od
    WHERE od.assignee_id IN (
      SELECT om.user_id FROM org_members om
      JOIN org_areas oa ON oa.id = om.area_id
      WHERE oa.responsible_id = auth.uid()
    )
  )
);

-- =============================================================
-- FASE 8: RLS para objective_progress
-- =============================================================

DROP POLICY IF EXISTS progress_view ON objective_progress;
DROP POLICY IF EXISTS progress_manage ON objective_progress;

CREATE POLICY "progress_select" ON objective_progress FOR SELECT
USING (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR objective_id IN (
    SELECT o.id FROM objectives o
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
      UNION ALL
      SELECT department_id FROM org_department_members WHERE user_id = auth.uid()
      UNION ALL
      SELECT department_id FROM org_areas WHERE responsible_id = auth.uid()
      UNION ALL
      SELECT DISTINCT oa.department_id
      FROM org_areas oa
      JOIN org_members om ON om.area_id = oa.id
      WHERE om.user_id = auth.uid()
    )
  )
);

CREATE POLICY "progress_manage" ON objective_progress FOR ALL
USING (
  is_root()
  OR EXISTS (SELECT 1 FROM org_direction WHERE responsible_id = auth.uid())
  OR objective_id IN (
    SELECT o.id FROM objectives o
    WHERE o.org_department_id IN (
      SELECT id FROM org_departments WHERE responsible_id = auth.uid()
    )
  )
);
