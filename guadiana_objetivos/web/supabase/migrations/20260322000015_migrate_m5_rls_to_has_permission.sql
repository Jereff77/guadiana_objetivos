-- ============================================================
-- T-021: Migrar RLS de M5 de roles hardcodeados a has_permission()
-- ============================================================

-- ── form_surveys ─────────────────────────────────────────────
DROP POLICY IF EXISTS "form_surveys_select_admin" ON form_surveys;
DROP POLICY IF EXISTS "form_surveys_select_published" ON form_surveys;
DROP POLICY IF EXISTS "form_surveys_insert_admin" ON form_surveys;
DROP POLICY IF EXISTS "form_surveys_update_admin" ON form_surveys;
DROP POLICY IF EXISTS "form_surveys_delete_admin" ON form_surveys;

CREATE POLICY "surveys_select" ON form_surveys FOR SELECT
  USING (
    has_permission('formularios.view')
    OR (auth.uid() IS NOT NULL AND status = 'published')
    OR is_root()
  );
CREATE POLICY "surveys_insert" ON form_surveys FOR INSERT
  WITH CHECK (has_permission('formularios.create') OR is_root());
CREATE POLICY "surveys_update" ON form_surveys FOR UPDATE
  USING (has_permission('formularios.edit') OR is_root());
CREATE POLICY "surveys_delete" ON form_surveys FOR DELETE
  USING (has_permission('formularios.delete') OR is_root());

-- ── form_sections ─────────────────────────────────────────────
DROP POLICY IF EXISTS "form_sections_select_auth" ON form_sections;
DROP POLICY IF EXISTS "form_sections_write_admin" ON form_sections;

CREATE POLICY "sections_select" ON form_sections FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "sections_write" ON form_sections FOR ALL
  USING (has_permission('formularios.edit') OR is_root());

-- ── form_questions ────────────────────────────────────────────
DROP POLICY IF EXISTS "form_questions_select_auth" ON form_questions;
DROP POLICY IF EXISTS "form_questions_write_admin" ON form_questions;

CREATE POLICY "questions_select" ON form_questions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "questions_write" ON form_questions FOR ALL
  USING (has_permission('formularios.edit') OR is_root());

-- ── form_question_options ─────────────────────────────────────
DROP POLICY IF EXISTS "form_question_options_select_auth" ON form_question_options;
DROP POLICY IF EXISTS "form_question_options_write_admin" ON form_question_options;

CREATE POLICY "options_select" ON form_question_options FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "options_write" ON form_question_options FOR ALL
  USING (has_permission('formularios.edit') OR is_root());

-- ── form_assignments ──────────────────────────────────────────
DROP POLICY IF EXISTS "form_assignments_select_admin" ON form_assignments;
DROP POLICY IF EXISTS "form_assignments_select_jefe" ON form_assignments;
DROP POLICY IF EXISTS "form_assignments_select_user" ON form_assignments;
DROP POLICY IF EXISTS "form_assignments_write_admin" ON form_assignments;

CREATE POLICY "assignments_select" ON form_assignments FOR SELECT
  USING (
    has_permission('formularios.assign')
    OR has_permission('formularios.view')
    OR assignee_user_id = auth.uid()
    OR is_root()
  );
CREATE POLICY "assignments_write" ON form_assignments FOR ALL
  USING (has_permission('formularios.assign') OR is_root());
