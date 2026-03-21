-- ============================================================
-- T-106: Row Level Security – Guadiana Checklists
-- Roles: admin_global | jefe_sucursal | auditor | asesor | operario
-- ============================================================

-- Helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Helper: obtener branch_id del usuario actual
CREATE OR REPLACE FUNCTION current_user_branch()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT branch_id FROM profiles WHERE id = auth.uid()
$$;

-- ============================================================
-- TABLA: profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (current_user_role() = 'admin_global');

CREATE POLICY "profiles_select_jefe"
  ON profiles FOR SELECT
  USING (
    current_user_role() = 'jefe_sucursal'
    AND branch_id = current_user_branch()
  );

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (current_user_role() = 'admin_global');

CREATE POLICY "profiles_insert_trigger"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- TABLA: form_surveys
-- ============================================================
ALTER TABLE form_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_surveys_select_published"
  ON form_surveys FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND status = 'published'
  );

CREATE POLICY "form_surveys_select_admin"
  ON form_surveys FOR SELECT
  USING (current_user_role() IN ('admin_global', 'auditor'));

CREATE POLICY "form_surveys_insert_admin"
  ON form_surveys FOR INSERT
  WITH CHECK (current_user_role() = 'admin_global');

CREATE POLICY "form_surveys_update_admin"
  ON form_surveys FOR UPDATE
  USING (current_user_role() = 'admin_global');

CREATE POLICY "form_surveys_delete_admin"
  ON form_surveys FOR DELETE
  USING (current_user_role() = 'admin_global');

-- ============================================================
-- TABLA: form_sections
-- ============================================================
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_sections_select_auth"
  ON form_sections FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "form_sections_write_admin"
  ON form_sections FOR ALL
  USING (current_user_role() = 'admin_global');

-- ============================================================
-- TABLA: form_questions
-- ============================================================
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_questions_select_auth"
  ON form_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "form_questions_write_admin"
  ON form_questions FOR ALL
  USING (current_user_role() = 'admin_global');

-- ============================================================
-- TABLA: form_question_options
-- ============================================================
ALTER TABLE form_question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_question_options_select_auth"
  ON form_question_options FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "form_question_options_write_admin"
  ON form_question_options FOR ALL
  USING (current_user_role() = 'admin_global');

-- ============================================================
-- TABLA: form_assignments
-- ============================================================
ALTER TABLE form_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "form_assignments_select_admin"
  ON form_assignments FOR SELECT
  USING (current_user_role() IN ('admin_global', 'auditor'));

CREATE POLICY "form_assignments_select_jefe"
  ON form_assignments FOR SELECT
  USING (
    current_user_role() = 'jefe_sucursal'
    AND branch_id = current_user_branch()
  );

CREATE POLICY "form_assignments_select_user"
  ON form_assignments FOR SELECT
  USING (
    assignee_user_id = auth.uid()
    OR assignee_role = current_user_role()
  );

CREATE POLICY "form_assignments_write_admin"
  ON form_assignments FOR ALL
  USING (current_user_role() = 'admin_global');

-- ============================================================
-- TABLA: resp_survey_runs
-- ============================================================
ALTER TABLE resp_survey_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resp_survey_runs_select_admin"
  ON resp_survey_runs FOR SELECT
  USING (current_user_role() IN ('admin_global', 'auditor'));

CREATE POLICY "resp_survey_runs_select_jefe"
  ON resp_survey_runs FOR SELECT
  USING (
    current_user_role() = 'jefe_sucursal'
    AND branch_id = current_user_branch()
  );

CREATE POLICY "resp_survey_runs_select_own"
  ON resp_survey_runs FOR SELECT
  USING (respondent_id = auth.uid());

CREATE POLICY "resp_survey_runs_insert_auth"
  ON resp_survey_runs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND respondent_id = auth.uid()
  );

CREATE POLICY "resp_survey_runs_update_own"
  ON resp_survey_runs FOR UPDATE
  USING (respondent_id = auth.uid() AND status = 'in_progress');

-- ============================================================
-- TABLA: resp_answers
-- ============================================================
ALTER TABLE resp_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resp_answers_select_admin"
  ON resp_answers FOR SELECT
  USING (current_user_role() IN ('admin_global', 'auditor'));

CREATE POLICY "resp_answers_select_jefe"
  ON resp_answers FOR SELECT
  USING (
    current_user_role() = 'jefe_sucursal'
    AND EXISTS (
      SELECT 1 FROM resp_survey_runs r
      WHERE r.id = run_id
        AND r.branch_id = current_user_branch()
    )
  );

CREATE POLICY "resp_answers_select_own"
  ON resp_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM resp_survey_runs r
      WHERE r.id = run_id AND r.respondent_id = auth.uid()
    )
  );

CREATE POLICY "resp_answers_insert_own"
  ON resp_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM resp_survey_runs r
      WHERE r.id = run_id
        AND r.respondent_id = auth.uid()
        AND r.status = 'in_progress'
    )
  );
