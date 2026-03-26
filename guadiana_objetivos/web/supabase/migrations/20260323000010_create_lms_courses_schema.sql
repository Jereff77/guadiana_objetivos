-- ============================================================
-- LMS Cursos — lms_courses, lms_course_topics, lms_course_progress
-- ============================================================

-- ── lms_courses ───────────────────────────────────────────────
CREATE TABLE lms_courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  cover_url     TEXT,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── lms_course_topics ─────────────────────────────────────────
-- Cada fila es un elemento del temario de un curso.
-- topic_type = 'content' → referencia a lms_content (video/pdf/texto)
-- topic_type = 'survey'  → referencia a form_surveys (evaluación)
CREATE TABLE lms_course_topics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  topic_type   TEXT NOT NULL CHECK (topic_type IN ('content', 'survey')),
  content_id   UUID REFERENCES lms_content(id) ON DELETE SET NULL,
  survey_id    UUID REFERENCES form_surveys(id) ON DELETE SET NULL,
  is_required  BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT topic_has_source CHECK (
    (topic_type = 'content' AND content_id IS NOT NULL) OR
    (topic_type = 'survey'  AND survey_id  IS NOT NULL)
  )
);

-- ── lms_course_progress ───────────────────────────────────────
-- Progreso por usuario y tema (UNIQUE user+topic)
CREATE TABLE lms_course_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id)          ON DELETE CASCADE,
  course_id      UUID NOT NULL REFERENCES lms_courses(id)       ON DELETE CASCADE,
  topic_id       UUID NOT NULL REFERENCES lms_course_topics(id) ON DELETE CASCADE,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  quiz_score     NUMERIC(5,2),
  survey_run_id  UUID REFERENCES resp_survey_runs(id) ON DELETE SET NULL,
  UNIQUE (user_id, topic_id)
);

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX ON lms_courses (is_published);
CREATE INDEX ON lms_courses (category);
CREATE INDEX ON lms_courses (created_by);
CREATE INDEX ON lms_course_topics (course_id, sort_order);
CREATE INDEX ON lms_course_progress (user_id);
CREATE INDEX ON lms_course_progress (course_id);
CREATE INDEX ON lms_course_progress (topic_id);

-- ── Triggers updated_at ───────────────────────────────────────
CREATE TRIGGER lms_courses_updated_at
  BEFORE UPDATE ON lms_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER lms_course_topics_updated_at
  BEFORE UPDATE ON lms_course_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE lms_courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_course_topics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_course_progress ENABLE ROW LEVEL SECURITY;

-- lms_courses: view ve publicados; manage/root ve todo
CREATE POLICY "lms_courses_select" ON lms_courses
  FOR SELECT USING (
    (is_published = true AND has_permission('capacitacion.view'))
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_courses_insert" ON lms_courses
  FOR INSERT WITH CHECK (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_courses_update" ON lms_courses
  FOR UPDATE USING (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_courses_delete" ON lms_courses
  FOR DELETE USING (has_permission('capacitacion.manage') OR is_root());

-- lms_course_topics: visibles si el curso es visible
CREATE POLICY "lms_course_topics_select" ON lms_course_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM lms_courses c
      WHERE c.id = lms_course_topics.course_id
        AND (
          (c.is_published = true AND has_permission('capacitacion.view'))
          OR has_permission('capacitacion.manage')
          OR is_root()
        )
    )
  );

CREATE POLICY "lms_course_topics_insert" ON lms_course_topics
  FOR INSERT WITH CHECK (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_course_topics_update" ON lms_course_topics
  FOR UPDATE USING (has_permission('capacitacion.manage') OR is_root());

CREATE POLICY "lms_course_topics_delete" ON lms_course_topics
  FOR DELETE USING (has_permission('capacitacion.manage') OR is_root());

-- lms_course_progress: usuario ve y gestiona el propio; manage/root ve todo
CREATE POLICY "lms_course_progress_select" ON lms_course_progress
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_course_progress_insert" ON lms_course_progress
  FOR INSERT WITH CHECK (
    (user_id = auth.uid() AND has_permission('capacitacion.view'))
    OR has_permission('capacitacion.manage')
    OR is_root()
  );

CREATE POLICY "lms_course_progress_update" ON lms_course_progress
  FOR UPDATE USING (
    user_id = auth.uid()
    OR has_permission('capacitacion.manage')
    OR is_root()
  );
