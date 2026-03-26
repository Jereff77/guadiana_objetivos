-- T-036: Tablas de IA (M4)

-- ai_prompts: prompts del sistema configurables desde UI
CREATE TABLE ai_prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  context       TEXT NOT NULL DEFAULT 'verification' CHECK (context IN ('verification', 'lms_chat')),
  system_prompt TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ai_analysis_results: resultados del análisis IA por entregable
CREATE TABLE ai_analysis_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id) ON DELETE CASCADE,
  evidence_ids    UUID[] NOT NULL DEFAULT '{}',
  verdict         TEXT NOT NULL CHECK (verdict IN ('approved', 'rejected', 'needs_review')),
  confidence      NUMERIC(3,2) CHECK (confidence BETWEEN 0 AND 1),
  summary         TEXT,
  findings        JSONB,            -- {"positive": [...], "negative": [...]}
  prompt_used     TEXT,
  model_used      TEXT,
  human_verdict   TEXT CHECK (human_verdict IN ('approved', 'rejected', NULL)),
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_ai_results_deliverable ON ai_analysis_results(deliverable_id);
CREATE INDEX idx_ai_results_verdict     ON ai_analysis_results(verdict);
CREATE INDEX idx_ai_results_created     ON ai_analysis_results(created_at DESC);
CREATE INDEX idx_ai_prompts_context     ON ai_prompts(context, is_active);

-- Trigger updated_at para ai_prompts
CREATE TRIGGER update_ai_prompts_updated_at
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- ai_prompts policies
CREATE POLICY "view ai prompts"
  ON ai_prompts FOR SELECT
  USING (has_permission('ia.view') OR has_permission('ia.configure') OR is_root());

CREATE POLICY "configure ai prompts"
  ON ai_prompts FOR ALL
  USING (has_permission('ia.configure') OR is_root());

-- ai_analysis_results policies
CREATE POLICY "view ai results"
  ON ai_analysis_results FOR SELECT
  USING (has_permission('ia.view') OR has_permission('objetivos.review') OR is_root());

CREATE POLICY "insert ai results"
  ON ai_analysis_results FOR INSERT
  WITH CHECK (has_permission('objetivos.review') OR is_root());

CREATE POLICY "update ai results (human review)"
  ON ai_analysis_results FOR UPDATE
  USING (has_permission('objetivos.review') OR is_root());

-- Seed: prompt de verificación por defecto
INSERT INTO ai_prompts (name, context, system_prompt, is_active) VALUES (
  'Verificación de Objetivos',
  'verification',
  'Eres un asistente experto en evaluación de cumplimiento de objetivos empresariales para Llantas y Rines del Guadiana. Tu función es analizar las evidencias presentadas (documentos, imágenes, textos) y determinar si el entregable cumple con los criterios establecidos en el objetivo.

Debes responder en formato JSON con la siguiente estructura:
{
  "verdict": "approved|rejected|needs_review",
  "confidence": 0.0-1.0,
  "summary": "Resumen ejecutivo del análisis en 2-3 oraciones",
  "findings": {
    "positive": ["hallazgo positivo 1", "hallazgo positivo 2"],
    "negative": ["hallazgo negativo 1"]
  }
}

Criterios de evaluación:
- approved: La evidencia cumple claramente con el objetivo establecido
- rejected: La evidencia no cumple o es insuficiente
- needs_review: La evidencia es parcial o requiere validación humana adicional

Sé objetivo, conciso y basa tu análisis únicamente en las evidencias proporcionadas.',
  true
);
