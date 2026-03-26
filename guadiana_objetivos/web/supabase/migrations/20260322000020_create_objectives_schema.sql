-- ============================================================
-- T-022: Tablas de Objetivos M1
-- departments, objectives, objective_deliverables,
-- objective_evidences, objective_reviews, objective_progress
-- system_alerts (M2 alerts, needed by M1)
-- ============================================================

-- 1. departments
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  manager_id  UUID REFERENCES profiles(id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dept_view" ON departments FOR SELECT
  USING (has_permission('objetivos.view') OR is_root());
CREATE POLICY "dept_manage" ON departments FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());

-- 2. objectives
CREATE TABLE objectives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  month           SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            SMALLINT NOT NULL,
  weight          NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  target_value    NUMERIC(10,2),
  evidence_type   TEXT NOT NULL DEFAULT 'document',  -- document|photo|text|checklist
  checklist_id    UUID REFERENCES form_surveys(id),
  status          TEXT NOT NULL DEFAULT 'active',    -- active|closed|cancelled
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (department_id, month, year, title)
);

ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obj_view" ON objectives FOR SELECT
  USING (has_permission('objetivos.view') OR is_root());
CREATE POLICY "obj_manage" ON objectives FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());

-- 3. objective_deliverables
CREATE TABLE objective_deliverables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id  UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  due_date      DATE,
  assignee_id   UUID REFERENCES profiles(id),
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending|submitted|approved|rejected
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objective_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deliv_view" ON objective_deliverables FOR SELECT
  USING (has_permission('objetivos.view') OR assignee_id = auth.uid() OR is_root());
CREATE POLICY "deliv_manage" ON objective_deliverables FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());

-- 4. objective_evidences
CREATE TABLE objective_evidences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id) ON DELETE CASCADE,
  submitted_by    UUID NOT NULL REFERENCES profiles(id),
  storage_path    TEXT,
  evidence_url    TEXT,
  text_content    TEXT,
  run_id          UUID REFERENCES resp_survey_runs(id),
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  notes           TEXT
);

ALTER TABLE objective_evidences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evid_view" ON objective_evidences FOR SELECT
  USING (has_permission('objetivos.view') OR submitted_by = auth.uid() OR is_root());
CREATE POLICY "evid_submit" ON objective_evidences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "evid_manage" ON objective_evidences FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());

-- 5. objective_reviews
CREATE TABLE objective_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id),
  reviewer_id     UUID NOT NULL REFERENCES profiles(id),
  verdict         TEXT NOT NULL,  -- approved|rejected
  comment         TEXT,
  reviewed_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objective_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_view" ON objective_reviews FOR SELECT
  USING (has_permission('objetivos.view') OR reviewer_id = auth.uid() OR is_root());
CREATE POLICY "review_create" ON objective_reviews FOR INSERT
  WITH CHECK (has_permission('objetivos.review') OR is_root());

-- 6. objective_progress
CREATE TABLE objective_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id    UUID NOT NULL REFERENCES objectives(id),
  department_id   UUID NOT NULL REFERENCES departments(id),
  month           SMALLINT NOT NULL,
  year            SMALLINT NOT NULL,
  completion_pct  NUMERIC(5,2) DEFAULT 0,
  calculated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (objective_id, month, year)
);

ALTER TABLE objective_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_view" ON objective_progress FOR SELECT
  USING (has_permission('objetivos.view') OR is_root());
CREATE POLICY "progress_manage" ON objective_progress FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());

-- 7. system_alerts (M2 — creado aquí por dependencia con M1)
CREATE TABLE system_alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT NOT NULL,   -- low_completion|deadline_approaching|period_closed
  entity_type    TEXT NOT NULL,   -- objective|deliverable|department
  entity_id      UUID NOT NULL,
  message        TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'warning',  -- info|warning|critical
  is_read        BOOLEAN DEFAULT false,
  target_role_id UUID REFERENCES roles(id),
  target_user    UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_view" ON system_alerts FOR SELECT
  USING (
    target_user = auth.uid()
    OR has_permission('dashboard.view')
    OR is_root()
  );
CREATE POLICY "alerts_insert" ON system_alerts FOR INSERT
  WITH CHECK (true);
CREATE POLICY "alerts_update" ON system_alerts FOR UPDATE
  USING (target_user = auth.uid() OR is_root());

-- Índices de rendimiento
CREATE INDEX idx_objectives_dept_period ON objectives(department_id, year, month);
CREATE INDEX idx_deliverables_objective ON objective_deliverables(objective_id);
CREATE INDEX idx_deliverables_assignee ON objective_deliverables(assignee_id);
CREATE INDEX idx_evidences_deliverable ON objective_evidences(deliverable_id);
CREATE INDEX idx_progress_dept ON objective_progress(department_id, year, month);
CREATE INDEX idx_alerts_target ON system_alerts(target_user, is_read);
