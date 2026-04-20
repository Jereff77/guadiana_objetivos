-- ─── Organigrama: departamentos, áreas y miembros ────────────────────────────

CREATE TABLE IF NOT EXISTS org_departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  position_x  REAL NOT NULL DEFAULT 0,
  position_y  REAL NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_areas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id  UUID NOT NULL REFERENCES org_departments(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  position_x     REAL NOT NULL DEFAULT 0,
  position_y     REAL NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS org_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id    UUID NOT NULL REFERENCES org_areas(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hierarchy  TEXT NOT NULL CHECK (hierarchy IN ('gerente_departamento', 'jefe_area', 'colaborador')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (area_id, user_id)
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE org_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_areas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members     ENABLE ROW LEVEL SECURITY;

-- org_departments
CREATE POLICY "organigrama_view_departments"
  ON org_departments FOR SELECT
  USING (has_permission('organigrama.view') OR is_root());

CREATE POLICY "organigrama_manage_departments_insert"
  ON org_departments FOR INSERT
  WITH CHECK (has_permission('organigrama.manage') OR is_root());

CREATE POLICY "organigrama_manage_departments_update"
  ON org_departments FOR UPDATE
  USING (has_permission('organigrama.manage') OR is_root());

CREATE POLICY "organigrama_manage_departments_delete"
  ON org_departments FOR DELETE
  USING (has_permission('organigrama.manage') OR is_root());

-- org_areas
CREATE POLICY "organigrama_view_areas"
  ON org_areas FOR SELECT
  USING (has_permission('organigrama.view') OR is_root());

CREATE POLICY "organigrama_manage_areas_insert"
  ON org_areas FOR INSERT
  WITH CHECK (has_permission('organigrama.manage') OR is_root());

CREATE POLICY "organigrama_manage_areas_update"
  ON org_areas FOR UPDATE
  USING (has_permission('organigrama.manage') OR is_root());

CREATE POLICY "organigrama_manage_areas_delete"
  ON org_areas FOR DELETE
  USING (has_permission('organigrama.manage') OR is_root());

-- org_members
CREATE POLICY "organigrama_view_members"
  ON org_members FOR SELECT
  USING (has_permission('organigrama.view') OR is_root());

CREATE POLICY "organigrama_manage_members_insert"
  ON org_members FOR INSERT
  WITH CHECK (has_permission('organigrama.manage') OR is_root());

CREATE POLICY "organigrama_manage_members_delete"
  ON org_members FOR DELETE
  USING (has_permission('organigrama.manage') OR is_root());

-- ─── Permisos en platform_modules ─────────────────────────────────────────────

INSERT INTO platform_modules (key, label, module, sort_order)
VALUES
  ('organigrama.view',   'Ver Organigrama',       'organigrama', 1),
  ('organigrama.manage', 'Gestionar Organigrama',  'organigrama', 2)
ON CONFLICT (key) DO NOTHING;
