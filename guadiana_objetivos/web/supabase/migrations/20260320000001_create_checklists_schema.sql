-- ============================================================
-- T-105: Esquema de base de datos Guadiana Checklists
-- Tablas form_* y resp_* según especificación técnica
-- Aplicar en: Supabase Dashboard > SQL Editor, o con supabase db push
-- ============================================================

-- Perfiles de usuario (roles y sucursal)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin_global', 'jefe_sucursal', 'auditor', 'asesor', 'operario')) DEFAULT 'asesor',
  branch_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'asesor');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 1. Formularios
-- ============================================================
CREATE TABLE IF NOT EXISTS form_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  category TEXT,
  target_role TEXT,
  ai_context TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  is_template BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_surveys_code   ON form_surveys(code);
CREATE INDEX IF NOT EXISTS idx_form_surveys_status ON form_surveys(status);

-- ============================================================
-- 2. Secciones de formulario
-- ============================================================
CREATE TABLE IF NOT EXISTS form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_sections_survey ON form_sections(survey_id, "order");

-- ============================================================
-- 3. Preguntas
-- ============================================================
CREATE TABLE IF NOT EXISTS form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES form_sections(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'boolean', 'single_choice', 'multiple_choice',
    'text_short', 'text_long', 'number', 'date'
  )),
  required BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_questions_section ON form_questions(section_id, "order");

-- ============================================================
-- 4. Opciones de pregunta
-- ============================================================
CREATE TABLE IF NOT EXISTS form_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT,
  score NUMERIC(10,2),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_question_options_question ON form_question_options(question_id, "order");

-- ============================================================
-- 5. Asignaciones de formulario
-- ============================================================
CREATE TABLE IF NOT EXISTS form_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys(id) ON DELETE CASCADE,
  assignee_user_id UUID REFERENCES auth.users(id),
  assignee_role TEXT,
  branch_id UUID,
  required_frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_assignments_survey ON form_assignments(survey_id, assignee_user_id, branch_id);

-- ============================================================
-- 6. Ejecuciones de formulario (cabecera de respuesta)
-- ============================================================
CREATE TABLE IF NOT EXISTS resp_survey_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys(id),
  assignment_id UUID REFERENCES form_assignments(id),
  respondent_id UUID NOT NULL REFERENCES auth.users(id),
  audited_user_id UUID REFERENCES auth.users(id),
  branch_id UUID,
  context JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')) DEFAULT 'in_progress',
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resp_survey_runs_survey
  ON resp_survey_runs(survey_id, branch_id, respondent_id, completed_at);

-- ============================================================
-- 7. Respuestas a preguntas
-- ============================================================
CREATE TABLE IF NOT EXISTS resp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES resp_survey_runs(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES form_questions(id),
  option_id UUID REFERENCES form_question_options(id),
  value_text TEXT,
  value_number NUMERIC,
  value_bool BOOLEAN,
  value_date DATE,
  value_json JSONB,
  not_applicable BOOLEAN NOT NULL DEFAULT false,
  comment TEXT,  -- columna "ACCIONES A SEGUIR" del formato original
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resp_answers_run ON resp_answers(run_id, question_id);

-- ============================================================
-- Triggers updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_form_surveys_updated_at
  BEFORE UPDATE ON form_surveys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
