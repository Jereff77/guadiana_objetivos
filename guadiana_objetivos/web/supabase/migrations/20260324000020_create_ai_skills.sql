-- M4: Sistema de Habilidades (Skills) para el asistente GUADIANA

CREATE TABLE IF NOT EXISTS ai_skills (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  skill_type       TEXT NOT NULL CHECK (skill_type IN ('knowledge', 'behavior', 'process')),
  content          TEXT NOT NULL,
  trigger_keywords TEXT[] DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  priority         INTEGER NOT NULL DEFAULT 50,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_skills_active ON ai_skills(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_skills_prio   ON ai_skills(priority DESC);

CREATE TRIGGER update_ai_skills_updated_at
  BEFORE UPDATE ON ai_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE ai_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ia_view_can_read_skills"
  ON ai_skills FOR SELECT
  USING (has_permission('ia.view') OR is_root());

CREATE POLICY "ia_configure_can_insert_skills"
  ON ai_skills FOR INSERT
  WITH CHECK (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_update_skills"
  ON ai_skills FOR UPDATE
  USING (has_permission('ia.configure') OR is_root());

CREATE POLICY "ia_configure_can_delete_skills"
  ON ai_skills FOR DELETE
  USING (has_permission('ia.configure') OR is_root());
