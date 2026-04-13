-- M4: Sistema de Políticas y Reglas para el asistente GUADIANA

CREATE TABLE IF NOT EXISTS ai_policies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  policy_type      TEXT NOT NULL CHECK (policy_type IN ('privacy','access_control','behavior','compliance')),
  content          TEXT NOT NULL,
  severity         TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('critical','high','medium')),
  trigger_contexts TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  priority         INTEGER NOT NULL DEFAULT 50,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_policies_active   ON ai_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_policies_severity ON ai_policies(severity);
CREATE INDEX IF NOT EXISTS idx_ai_policies_prio     ON ai_policies(priority DESC);

CREATE TRIGGER update_ai_policies_updated_at
  BEFORE UPDATE ON ai_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ai_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ia_view_can_read_policies"
  ON ai_policies FOR SELECT
  USING (has_permission('ia.view') OR is_root());

CREATE POLICY "ia_configure_can_insert_policies"
  ON ai_policies FOR INSERT
  WITH CHECK (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_update_policies"
  ON ai_policies FOR UPDATE
  USING (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_delete_policies"
  ON ai_policies FOR DELETE
  USING (has_permission('ia.configure') OR is_root());
