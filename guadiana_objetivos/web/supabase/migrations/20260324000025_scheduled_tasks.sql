-- ============================================================================
-- Migración: Sistema de Tareas Programadas de IA
-- ============================================================================

-- Tabla de tareas programadas
CREATE TABLE IF NOT EXISTS ai_scheduled_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  prompt          TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone        TEXT NOT NULL DEFAULT 'America/Mexico_City',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  next_run_at     TIMESTAMPTZ,
  last_run_at     TIMESTAMPTZ,
  last_status     TEXT CHECK (last_status IN ('success', 'error', 'running')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historial de ejecuciones
CREATE TABLE IF NOT EXISTS ai_task_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID NOT NULL REFERENCES ai_scheduled_tasks(id) ON DELETE CASCADE,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  result_content  TEXT,
  email_sent_to   TEXT,
  email_sent_at   TIMESTAMPTZ,
  tokens_used     INTEGER,
  error_message   TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_next_run
  ON ai_scheduled_tasks (next_run_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scheduled_tasks_user
  ON ai_scheduled_tasks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_task_executions_task_id
  ON ai_task_executions (task_id, started_at DESC);

-- Trigger updated_at
CREATE TRIGGER update_ai_scheduled_tasks_updated_at
  BEFORE UPDATE ON ai_scheduled_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE ai_scheduled_tasks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_task_executions  ENABLE ROW LEVEL SECURITY;

-- Usuarios ven y gestionan solo sus propias tareas
CREATE POLICY "tasks_own_all" ON ai_scheduled_tasks
  FOR ALL USING (user_id = auth.uid());

-- Root ve todas las tareas
CREATE POLICY "tasks_root_all" ON ai_scheduled_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root = true)
  );

-- Ejecuciones: el usuario ve las de sus tareas
CREATE POLICY "executions_own_select" ON ai_task_executions
  FOR SELECT USING (
    task_id IN (SELECT id FROM ai_scheduled_tasks WHERE user_id = auth.uid())
  );

-- Root ve todas las ejecuciones
CREATE POLICY "executions_root_all" ON ai_task_executions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_root = true)
  );

-- Service role puede insertar/actualizar ejecuciones (para la Edge Function)
CREATE POLICY "executions_service_all" ON ai_task_executions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "tasks_service_all" ON ai_scheduled_tasks
  FOR ALL USING (auth.role() = 'service_role');
