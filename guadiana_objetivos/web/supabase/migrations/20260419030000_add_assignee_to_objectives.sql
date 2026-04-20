-- ============================================================
-- Migración: Agrega assignee_id a la tabla objectives
-- Aplicada en: 2026-04-19
-- Descripción: Cambia el modelo de objetivos departamentales a objetivos
--   individuales por usuario. Cada objetivo puede tener un assignee_id
--   que referencia a profiles(id), permitiendo el nuevo flujo centrado
--   en usuarios dentro de /objetivos/{deptId}.
-- ============================================================

-- ── 1. Agregar columna assignee_id ──────────────────────────────────────────

ALTER TABLE objectives
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Índice para consultas agrupadas por usuario
CREATE INDEX IF NOT EXISTS idx_objectives_assignee_id ON objectives(assignee_id);

-- Índice compuesto para la consulta principal (dept + mes + año + assignee)
CREATE INDEX IF NOT EXISTS idx_objectives_dept_period_assignee
  ON objectives(org_department_id, month, year, assignee_id);

-- ── 2. Comentarios de documentación ────────────────────────────────────────

COMMENT ON COLUMN objectives.assignee_id IS
  'Usuario al que se asigna este objetivo individualmente. '
  'NULL = objetivo departamental sin asignación específica.';

-- ── 3. Notas de migración de datos ─────────────────────────────────────────

-- Los objetivos existentes (sin assignee_id) quedan con NULL y siguen
-- siendo visibles en la vista de configuración departamental.
-- Los nuevos objetivos creados desde la vista de equipo (/objetivos/{deptId})
-- siempre tendrán assignee_id populated.
