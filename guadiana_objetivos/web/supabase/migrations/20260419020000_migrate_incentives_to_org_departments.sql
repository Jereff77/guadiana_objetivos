-- ============================================================
-- Migración: Reemplaza department_id por org_dept_id en incentivos
-- Aplicada en: 2026-04-19
-- Descripción: Elimina la dependencia de la tabla legacy `departments`
--   en incentive_schemas e incentive_records, conectando los incentivos
--   directamente con las tablas del organigrama (org_departments, org_areas).
-- ============================================================

-- ── 1. incentive_schemas ────────────────────────────────────────────────────

-- Agregar columnas nuevas
ALTER TABLE incentive_schemas
  ADD COLUMN IF NOT EXISTS org_dept_id  UUID REFERENCES org_departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS org_area_id  UUID REFERENCES org_areas(id)       ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS name         TEXT;

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_incentive_schemas_org_dept_id ON incentive_schemas(org_dept_id);
CREATE INDEX IF NOT EXISTS idx_incentive_schemas_org_area_id ON incentive_schemas(org_area_id);

-- Eliminar columna obsoleta (ejecutar solo después de migrar datos)
-- ALTER TABLE incentive_schemas DROP COLUMN IF EXISTS department_id;

-- ── 2. incentive_records ────────────────────────────────────────────────────

-- Agregar columna nueva
ALTER TABLE incentive_records
  ADD COLUMN IF NOT EXISTS org_dept_id UUID REFERENCES org_departments(id) ON DELETE SET NULL;

-- Índice para reportes por departamento
CREATE INDEX IF NOT EXISTS idx_incentive_records_org_dept_id ON incentive_records(org_dept_id);

-- Eliminar columna obsoleta (ejecutar solo después de migrar datos)
-- ALTER TABLE incentive_records DROP COLUMN IF EXISTS department_id;

-- ── 3. RLS (mantener políticas existentes, agregar para nuevas columnas) ────

-- Las políticas existentes ya cubren las tablas; no se requieren cambios
-- ya que el acceso se controla por permisos de plataforma (has_permission).

-- ── 4. Comentarios de documentación ────────────────────────────────────────

COMMENT ON COLUMN incentive_schemas.org_dept_id IS
  'Departamento del organigrama al que aplica este plan. NULL = aplica globalmente.';

COMMENT ON COLUMN incentive_schemas.org_area_id IS
  'Área específica a la que aplica este plan. NULL = aplica al departamento completo.';

COMMENT ON COLUMN incentive_schemas.name IS
  'Nombre descriptivo del plan de incentivo (ej: "Plan Ventas Q1 2026").';

COMMENT ON COLUMN incentive_records.org_dept_id IS
  'Departamento del organigrama asociado a este registro de incentivo.';
