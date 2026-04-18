CREATE TABLE org_positions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  sort_order INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE org_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_positions_view"   ON org_positions FOR SELECT USING (has_permission('organigrama.view') OR is_root());
CREATE POLICY "org_positions_insert" ON org_positions FOR INSERT WITH CHECK (has_permission('organigrama.manage') OR is_root());
CREATE POLICY "org_positions_update" ON org_positions FOR UPDATE USING (has_permission('organigrama.manage') OR is_root());
CREATE POLICY "org_positions_delete" ON org_positions FOR DELETE USING (has_permission('organigrama.manage') OR is_root());

INSERT INTO org_positions (name, sort_order) VALUES
  ('Gerente de Departamento', 1),
  ('Jefe de Área',            2),
  ('Colaborador',             3);

ALTER TABLE org_members ADD COLUMN position_id UUID REFERENCES org_positions(id) ON DELETE SET NULL;

UPDATE org_members m
SET    position_id = p.id
FROM   org_positions p
WHERE  (m.hierarchy = 'gerente_departamento' AND p.name = 'Gerente de Departamento')
    OR (m.hierarchy = 'jefe_area'            AND p.name = 'Jefe de Área')
    OR (m.hierarchy = 'colaborador'          AND p.name = 'Colaborador');

ALTER TABLE org_members DROP COLUMN hierarchy;
