-- T-033: Tablas de incentivos (M3)
-- incentive_schemas: esquemas de bonificación por departamento/rol
CREATE TABLE incentive_schemas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  role_id       UUID REFERENCES roles(id) ON DELETE SET NULL,  -- NULL = todos los roles del depto
  base_amount   NUMERIC(10,2) NOT NULL,
  tiers         JSONB NOT NULL DEFAULT '[]',
  -- ejemplo: [{"min_pct": 80, "max_pct": 89, "bonus_pct": 50}, {"min_pct": 90, "max_pct": 100, "bonus_pct": 100}]
  valid_from    DATE NOT NULL,
  valid_to      DATE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- incentive_records: registros individuales de incentivos calculados
CREATE TABLE incentive_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id     UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  schema_id         UUID REFERENCES incentive_schemas(id) ON DELETE SET NULL,
  month             SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year              SMALLINT NOT NULL CHECK (year >= 2020),
  completion_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  base_amount       NUMERIC(10,2) NOT NULL,
  bonus_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
  calculated_amount NUMERIC(10,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','paid')),
  approved_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, month, year)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_incentive_schemas_dept    ON incentive_schemas(department_id);
CREATE INDEX idx_incentive_schemas_active  ON incentive_schemas(is_active, valid_from, valid_to);
CREATE INDEX idx_incentive_records_user    ON incentive_records(user_id);
CREATE INDEX idx_incentive_records_dept    ON incentive_records(department_id);
CREATE INDEX idx_incentive_records_period  ON incentive_records(year, month);
CREATE INDEX idx_incentive_records_status  ON incentive_records(status);

-- Triggers para updated_at
CREATE TRIGGER update_incentive_schemas_updated_at
  BEFORE UPDATE ON incentive_schemas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_incentive_records_updated_at
  BEFORE UPDATE ON incentive_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE incentive_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_records ENABLE ROW LEVEL SECURITY;

-- incentive_schemas policies
CREATE POLICY "view incentive schemas"
  ON incentive_schemas FOR SELECT
  USING (has_permission('incentivos.view') OR is_root());

CREATE POLICY "manage incentive schemas"
  ON incentive_schemas FOR ALL
  USING (has_permission('incentivos.manage') OR is_root());

-- incentive_records policies
CREATE POLICY "view own incentive records"
  ON incentive_records FOR SELECT
  USING (user_id = auth.uid() OR has_permission('incentivos.view') OR is_root());

CREATE POLICY "manage incentive records"
  ON incentive_records FOR INSERT
  WITH CHECK (has_permission('incentivos.manage') OR is_root());

CREATE POLICY "update incentive records"
  ON incentive_records FOR UPDATE
  USING (has_permission('incentivos.manage') OR has_permission('incentivos.approve') OR is_root());

CREATE POLICY "delete incentive records"
  ON incentive_records FOR DELETE
  USING (has_permission('incentivos.manage') OR is_root());
