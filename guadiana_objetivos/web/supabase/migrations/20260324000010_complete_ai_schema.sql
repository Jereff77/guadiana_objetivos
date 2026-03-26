-- M4: Completar Schema de IA - Asistente de IA para Guadiana Objetivos
-- Esta migración agrega las tablas faltantes para el módulo de IA completo
-- Referencia: .specs/asistente-ia/design.md

-- ============================================================================
-- 1. Agregar permiso faltante ia.analyze
-- ============================================================================

INSERT INTO platform_modules (key, label, module, sort_order, is_active)
VALUES ('ia.analyze', 'Ejecutar análisis IA', 'IA', 3, true)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 2. Tabla: ai_analysis_log
--    Almacena el historial de todos los análisis realizados por IA
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_analysis_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_type   TEXT NOT NULL CHECK (analysis_type IN ('evidence', 'objective', 'training')),
  target_id       UUID NOT NULL,                  -- evidence_id, objective_id, etc.
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  result_summary  TEXT,
  result_json     JSONB,                         -- Resultado estructurado
  status          TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- Índices para ai_analysis_log
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user ON ai_analysis_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis_log(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_target ON ai_analysis_log(target_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created ON ai_analysis_log(created_at DESC);

-- ============================================================================
-- 3. Tabla: ai_recommendations
--    Almacena recomendaciones generadas por IA (capacitación, mejoras, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('training', 'objective', 'general')),
  title           TEXT NOT NULL,
  description     TEXT,
  priority        TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  link_id         UUID,                          -- course_id, objective_id, etc.
  link_type       TEXT,                          -- 'lms_course', 'objective', etc.
  status          TEXT NOT NULL CHECK (status IN ('pending', 'acknowledged', 'dismissed', 'completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  dismissed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

-- Índices para ai_recommendations
CREATE INDEX IF NOT EXISTS idx_ai_rec_user ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_rec_status ON ai_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_rec_type ON ai_recommendations(recommendation_type);

-- ============================================================================
-- 4. Tabla: ai_settings
--    Configuración del sistema de IA por departamento
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID REFERENCES departments(id) ON DELETE CASCADE,
  setting_key     TEXT NOT NULL,
  setting_value   TEXT,
  description     TEXT,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, setting_key)
);

-- Configuraciones por defecto globales
INSERT INTO ai_settings (department_id, setting_key, setting_value, description) VALUES
(NULL, 'system_prompt_enabled', 'true', 'Habilitar system prompt personalizado'),
(NULL, 'analysis_threshold', '70', 'Umbral de aprobación automática (%)'),
(NULL, 'max_tokens_per_request', '4000', 'Límite de tokens por solicitud'),
(NULL, 'budget_alert_threshold', '80', 'Alertar al usar X% del presupuesto'),
(NULL, 'evidence_agent_enabled', 'true', 'Habilitar agente de evidencias'),
(NULL, 'objective_agent_enabled', 'true', 'Habilitar agente de objetivos'),
(NULL, 'training_agent_enabled', 'true', 'Habilitar agente de capacitación'),
(NULL, 'chat_agent_enabled', 'true', 'Habilitar asistente de chat')
ON CONFLICT (department_id, setting_key) DO NOTHING;

-- Índices para ai_settings
CREATE INDEX IF NOT EXISTS idx_ai_settings_dept ON ai_settings(department_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_key ON ai_settings(setting_key);

-- Trigger updated_at para ai_settings
CREATE TRIGGER update_ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. Tabla: ai_chat_sessions
--    Sesiones de chat con el asistente
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  message_count   INTEGER DEFAULT 0
);

-- Índices para ai_chat_sessions
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_started ON ai_chat_sessions(started_at DESC);

-- ============================================================================
-- 6. Tabla: ai_chat_messages
--    Mensajes individuales de las sesiones de chat
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para ai_chat_messages
CREATE INDEX IF NOT EXISTS idx_ai_chat_msg_session ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_msg_created ON ai_chat_messages(created_at);

-- ============================================================================
-- 7. RLS (Row Level Security) Policies
-- ============================================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE ai_analysis_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- ai_analysis_log policies
CREATE POLICY "Users can see own analyses"
  ON ai_analysis_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own analyses"
  ON ai_analysis_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ai_recommendations policies
CREATE POLICY "Users can see own recommendations"
  ON ai_recommendations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create recommendations"
  ON ai_recommendations FOR INSERT
  WITH CHECK (true);  -- Las recomendaciones son creadas por el sistema

-- ai_settings policies
CREATE POLICY "Anyone can read global settings"
  ON ai_settings FOR SELECT
  USING (department_id IS NULL OR has_permission('ia.view') OR is_root());

CREATE POLICY "Only ia.configure can update settings"
  ON ai_settings FOR INSERT
  WITH CHECK (has_permission('ia.configure') OR is_root());

CREATE POLICY "Only ia.configure can update existing settings"
  ON ai_settings FOR UPDATE
  USING (has_permission('ia.configure') OR is_root());

-- ai_chat_sessions policies
CREATE POLICY "Users can see own sessions"
  ON ai_chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON ai_chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON ai_chat_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- ai_chat_messages policies
CREATE POLICY "Users can see messages from own sessions"
  ON ai_chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to own sessions"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. Funciones auxiliares
-- ============================================================================

-- Función para obtener configuración de IA (con fallback a global)
CREATE OR REPLACE FUNCTION get_ai_setting(p_key TEXT, p_department_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
  SELECT setting_value
  FROM ai_settings
  WHERE setting_key = p_key
    AND (department_id = p_department_id OR department_id IS NULL)
  ORDER BY department_id DESC NULLS LAST
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Notas:
-- - Esta migración completa el schema del módulo M4 (IA)
-- - Las tablas ai_prompts y ai_analysis_results ya existen en 20260322000040_create_ai_schema.sql
-- - Los permisos ia.view y ia.configure ya existen, se agrega ia.analyze
-- - El diseño sigue las convenciones de Guadiana (UUID, timestamps, RLS)
-- ============================================================================
