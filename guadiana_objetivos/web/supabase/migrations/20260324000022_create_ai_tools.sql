-- M4: Sistema de Herramientas Python para el Agente GUADIANA

CREATE TABLE IF NOT EXISTS ai_tools (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,              -- slug usado como tool name en la API de Claude
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,                     -- Claude usa esto para decidir cuándo invocar
  parameters_schema JSONB NOT NULL DEFAULT '{}',       -- JSON Schema de los parámetros de entrada
  python_code       TEXT NOT NULL,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  priority          INTEGER NOT NULL DEFAULT 50,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_active ON ai_tools(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_tools_name   ON ai_tools(name);

CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ia_view_can_read_tools"
  ON ai_tools FOR SELECT
  USING (has_permission('ia.view') OR is_root());

CREATE POLICY "ia_configure_can_insert_tools"
  ON ai_tools FOR INSERT
  WITH CHECK (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_update_tools"
  ON ai_tools FOR UPDATE
  USING (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_delete_tools"
  ON ai_tools FOR DELETE
  USING (has_permission('ia.configure') OR is_root());
