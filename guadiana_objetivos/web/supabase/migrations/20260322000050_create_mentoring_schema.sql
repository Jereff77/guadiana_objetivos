-- T-042: Tablas de Mentoring (M6)

-- mentoring_pairs: pares mentor-mentee
CREATE TABLE mentoring_pairs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentee_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date  DATE NOT NULL,
  end_date    DATE,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  objectives  TEXT,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mentor_id, mentee_id)
);

-- mentoring_sessions: sesiones programadas dentro de un par
CREATE TABLE mentoring_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id         UUID NOT NULL REFERENCES mentoring_pairs(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  modality        TEXT NOT NULL DEFAULT 'presencial' CHECK (modality IN ('presencial', 'virtual', 'hibrido')),
  agenda          TEXT,
  topics_covered  TEXT[],
  commitments     TEXT,
  mentor_rating   SMALLINT CHECK (mentor_rating BETWEEN 1 AND 5),
  mentor_notes    TEXT,
  mentee_rating   SMALLINT CHECK (mentee_rating BETWEEN 1 AND 5),
  mentee_feedback TEXT,
  objective_id    UUID REFERENCES objectives(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_mentoring_pairs_mentor    ON mentoring_pairs(mentor_id);
CREATE INDEX idx_mentoring_pairs_mentee    ON mentoring_pairs(mentee_id);
CREATE INDEX idx_mentoring_pairs_active    ON mentoring_pairs(is_active);
CREATE INDEX idx_mentoring_sessions_pair   ON mentoring_sessions(pair_id);
CREATE INDEX idx_mentoring_sessions_date   ON mentoring_sessions(scheduled_at DESC);
CREATE INDEX idx_mentoring_sessions_status ON mentoring_sessions(status);

-- Triggers updated_at
CREATE TRIGGER update_mentoring_pairs_updated_at
  BEFORE UPDATE ON mentoring_pairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_mentoring_sessions_updated_at
  BEFORE UPDATE ON mentoring_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE mentoring_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view own mentoring pairs"
  ON mentoring_pairs FOR SELECT
  USING (
    mentor_id = auth.uid()
    OR mentee_id = auth.uid()
    OR has_permission('mentoring.view')
    OR is_root()
  );

CREATE POLICY "manage mentoring pairs"
  ON mentoring_pairs FOR ALL
  USING (has_permission('mentoring.manage') OR is_root());

CREATE POLICY "view own mentoring sessions"
  ON mentoring_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentoring_pairs mp
      WHERE mp.id = pair_id
        AND (mp.mentor_id = auth.uid() OR mp.mentee_id = auth.uid())
    )
    OR has_permission('mentoring.view')
    OR is_root()
  );

CREATE POLICY "mentor can manage sessions"
  ON mentoring_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM mentoring_pairs mp
      WHERE mp.id = pair_id AND mp.mentor_id = auth.uid()
    )
    OR has_permission('mentoring.manage')
    OR is_root()
  );
