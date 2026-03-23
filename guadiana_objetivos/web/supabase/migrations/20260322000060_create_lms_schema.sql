-- ============================================================
-- T-044: FASE 6 — LMS (M7)
-- Tablas: lms_content, lms_quizzes, lms_paths, lms_progress
-- ============================================================

-- ── lms_content ──────────────────────────────────────────────
CREATE TABLE lms_content (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  content_type  TEXT NOT NULL CHECK (content_type IN ('pdf', 'video', 'text', 'quiz')),
  storage_path  TEXT,           -- PDFs en bucket 'lms-content'
  video_url     TEXT,           -- URL externa YouTube/Vimeo
  text_body     TEXT,
  is_published  BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── lms_quizzes ──────────────────────────────────────────────
-- Evaluación asociada a un contenido (relación 1:1 opcional)
CREATE TABLE lms_quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  UUID NOT NULL REFERENCES lms_content(id) ON DELETE CASCADE,
  questions   JSONB NOT NULL DEFAULT '[]',
  -- Estructura esperada:
  -- [{"question": "...", "options": ["A","B","C","D"], "correct": 0}]
  min_score   SMALLINT DEFAULT 70 CHECK (min_score BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (content_id)
);

-- ── lms_paths ────────────────────────────────────────────────
-- Rutas de aprendizaje: secuencias ordenadas de contenidos
CREATE TABLE lms_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  content_ids   UUID[] NOT NULL DEFAULT '{}',
  cert_title    TEXT,           -- Título del certificado al completar
  is_published  BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── lms_progress ─────────────────────────────────────────────
-- Progreso individual por usuario/contenido o usuario/ruta
CREATE TABLE lms_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id    UUID REFERENCES lms_content(id) ON DELETE CASCADE,
  path_id       UUID REFERENCES lms_paths(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  quiz_score    NUMERIC(5,2),
  certified     BOOLEAN DEFAULT false,
  UNIQUE (user_id, content_id),
  CONSTRAINT lms_progress_has_target CHECK (content_id IS NOT NULL OR path_id IS NOT NULL)
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX ON lms_content (is_published);
CREATE INDEX ON lms_content (category);
CREATE INDEX ON lms_content (created_by);
CREATE INDEX ON lms_paths (is_published);
CREATE INDEX ON lms_progress (user_id);
CREATE INDEX ON lms_progress (content_id);
CREATE INDEX ON lms_progress (path_id);

-- ── Triggers updated_at ───────────────────────────────────────
CREATE TRIGGER lms_content_updated_at
  BEFORE UPDATE ON lms_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lms_paths_updated_at
  BEFORE UPDATE ON lms_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE lms_content  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_quizzes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_paths    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_progress ENABLE ROW LEVEL SECURITY;

-- lms_content: todos con capacitacion.view ven publicados; manage ve y crea todo
CREATE POLICY "lms_content_select" ON lms_content
  FOR SELECT USING (
    is_published = true AND has_permission('capacitacion.view')
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_content_insert" ON lms_content
  FOR INSERT WITH CHECK (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_content_update" ON lms_content
  FOR UPDATE USING (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_content_delete" ON lms_content
  FOR DELETE USING (has_permission('capacitacion.manage') OR is_root());

-- lms_quizzes: mismo acceso que el contenido padre
CREATE POLICY "lms_quizzes_select" ON lms_quizzes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lms_content c
      WHERE c.id = lms_quizzes.content_id
        AND (c.is_published = true AND has_permission('capacitacion.view')
             OR has_permission('capacitacion.manage')
             OR is_root())
    )
  );

CREATE POLICY "lms_quizzes_insert" ON lms_quizzes
  FOR INSERT WITH CHECK (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_quizzes_update" ON lms_quizzes
  FOR UPDATE USING (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_quizzes_delete" ON lms_quizzes
  FOR DELETE USING (has_permission('capacitacion.manage') OR is_root());

-- lms_paths: igual que content
CREATE POLICY "lms_paths_select" ON lms_paths
  FOR SELECT USING (
    is_published = true AND has_permission('capacitacion.view')
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_paths_insert" ON lms_paths
  FOR INSERT WITH CHECK (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_paths_update" ON lms_paths
  FOR UPDATE USING (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_paths_delete" ON lms_paths
  FOR DELETE USING (has_permission('capacitacion.manage') OR is_root());

-- lms_progress: cada usuario ve su propio progreso; manage ve todo
CREATE POLICY "lms_progress_select" ON lms_progress
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_progress_insert" ON lms_progress
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND has_permission('capacitacion.view')
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_progress_update" ON lms_progress
  FOR UPDATE USING (
    user_id = auth.uid()
    OR has_permission('capacitacion.manage')
    OR is_root()
  );
