# Módulo de Incentivos - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: M3 - Sistema de Incentivos y Bonos
**Estado**: ✅ Completado

## Resumen Ejecutivo

Sistema de cálculo de incentivos basado en cumplimiento de objetivos. Permite configurar esquemas de bono (sueldo base + bono máximo) con tramos por % de cumplimiento, ejecutar cálculos automáticos por período, y aprobar excepciones para entregas tardías. Integrado con organigrama departamental.

---

## Características Implementadas

### ✅ Esquemas de Incentivo
**Ubicación**: `/incentivos/configurar`

**Funcionalidades**:
- Crear esquemas con:
  - Nombre del esquema
  - Departamento o área (integrado con organigrama)
  - Sueldo base (informativo)
  - Bono máximo al 100% (nuevo campo post-fix)
  - Tramos (tiers) por % de cumplimiento:
    - Rango: desde% hasta%
    - % del bono que se gana
- Tipo de período:
  - `monthly`: cierra el último día de cada mes dentro de la vigencia
  - `annual`: evaluación al 31 de diciembre
  - `custom`: evaluación al vencer `valid_to`
- Vigencia: fechas desde/hasta

**Permisos**:
- Ver: `incentivos.view`
- Gestionar: `incentivos.manage` (o responsable de depto/área)

**Archivos**:
- `src/app/(dashboard)/incentivos/configurar/page.tsx` - Página configurar
- `src/components/incentivos/incentive-schema-form.tsx` - Formulario
- `src/components/incentivos/incentive-schemas-list.tsx` - Lista
- `src/app/(dashboard)/incentivos/incentive-actions.ts` - Server Actions

**Data Model**:
```typescript
interface IncentiveSchema {
  id: string
  org_dept_id?: string
  org_area_id?: string
  name: string
  base_amount: number        // Sueldo base (informativo)
  bonus_amount: number       // Bono máximo al 100%
  period_type: 'monthly' | 'annual' | 'custom'
  valid_from: Date
  valid_to: Date
  tiers: IncentiveTier[]
}

interface IncentiveTier {
  id: string
  schema_id: string
  from_pct: number           // Ej: 0
  to_pct: number             // Ej: 69
  bonus_pct: number          // Ej: 0 (gana 0% del bono)
}
```

---

### ✅ Cálculo de Incentivos
**Ubicación**: `/incentivos/calcular`

**Funcionalidades**:
- Selector de mes/año
- Botón "Calcular incentivos"
- Proceso:
  1. Busca esquemas activos para el período
  2. Calcula cumplimiento de objetivos de cada usuario
  3. Busca tramo aplicable según %
  4. Aplica fórmula: `bonus_amount × (tier_pct / 100)`
  5. Guarda registro en `incentive_records`
- Banner de resultado con éxitos/errores

**Permisos**:
- Ejecutar: `incentivos.manage`

**Fórmula**:
```
calculated_amount = bonus_amount × (tier.bonus_pct / 100)

Ejemplo:
- Bono máximo: $10,000
- Cumplimiento: 75%
- Tramo (70-79%): 80% del bono
- Incentivo: $10,000 × 0.80 = $8,000
```

**Archivos**:
- `src/app/(dashboard)/incentivos/calcular/page.tsx` - Página calcular
- `src/app/(dashboard)/incentivos/incentive-actions.ts` - `calculateIncentivesForPeriod()`

---

### ✅ Registros de Incentivos
**Ubicación**: `/incentivos`

**Funcionalidades**:
- Lista de registros calculados
- Filtros por mes/año, departamento
- Columnas:
  - Usuario
  - Esquema
  - Período (mes/año)
  - Sueldo base
  - Bono máximo
  - % cumplimiento
  - % del bono ganado
  - Bono calculado
- Exportar CSV

**Permisos**:
- Ver: `incentivos.view` (o acceso extendido a `objetivos.view`)
- Exportar: `incentivos.manage`

**Archivos**:
- `src/app/(dashboard)/incentivos/page.tsx` - Lista de registros
- `src/components/incentivos/incentive-records-list.tsx` - Tabla

---

### ✅ Entregas Tardías
**Ubicación**: Panel de revisión en objetivos y `/incentivos`

**Funcionalidades**:
- `objective_deliverables.submitted_at`: timestamp de entrega
- Si `submitted_at > fecha_cierre_del_período` → "Entregado con retraso"
- Badge "Entregado con retraso" en panel de revisión
- Botón "Aprobar tardío" (solo `incentivos.approve`)
- Registra:
  - `late_approved_by`: ID del aprobador
  - `late_approved_at`: Timestamp de aprobación

**Permisos**:
- Aprobar tardío: `incentivos.approve`

**Sección "Entregas Tardías Pendientes"**:
- Lista de entregas tardías sin aprobación
- Botón "Aprobar" para cada una
- Solo visible para usuarios con `incentivos.approve`

**Archivos**:
- `src/components/objetivos/review-panel.tsx` - Panel con badge tardío
- `src/components/incentivos/late-deliverables-list.tsx` - Lista pendientes
- `src/app/(dashboard)/objetivos/deliverable-actions.ts` - `approveLateSubmission()`

---

### ✅ Integración con Organigrama
**Ubicación**: Configuración de esquemas

**Funcionalidades**:
- Esquemas se asignan a:
  - Departamento (`org_dept_id`)
  - Área (`org_area_id`)
- Migrados desde tabla obsoleta `departments`
- Usuarios con `incentivos.manage` ven todos los esquemas
- Responsables de depto/área pueden configurar esquemas de su unidad

**Migración Aplicada**:
```sql
-- 20260419020000_migrate_incentives_to_org_departments.sql
ALTER TABLE incentive_schemas ADD COLUMN org_dept_id UUID REFERENCES org_departments(id);
ALTER TABLE incentive_schemas ADD COLUMN org_area_id UUID REFERENCES org_areas(id);
-- Migración de datos desde department_id
```

---

## Schema de Base de Datos

### Tablas Principales

#### `incentive_schemas`
```sql
id              UUID PRIMARY KEY
org_dept_id     UUID REFERENCES org_departments(id)
org_area_id     UUID REFERENCES org_areas(id)
name            TEXT
base_amount     NUMERIC(10,2)  -- Sueldo base (informativo)
bonus_amount    NUMERIC(10,2)  -- Bono máximo al 100%
period_type     TEXT (monthly|annual|custom)
valid_from      DATE
valid_to        DATE
created_by      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `incentive_tiers`
```sql
id          UUID PRIMARY KEY
schema_id   UUID REFERENCES incentive_schemas(id) ON DELETE CASCADE
from_pct    NUMERIC(5,2)  -- Ej: 0
to_pct      NUMERIC(5,2)  -- Ej: 69
bonus_pct   NUMERIC(5,2)  -- Ej: 80 (gana 80% del bono)
UNIQUE (schema_id, from_pct, to_pct)
```

#### `incentive_records`
```sql
id                  UUID PRIMARY KEY
schema_id           UUID REFERENCES incentive_schemas(id)
user_id             UUID REFERENCES profiles(id)
period_month        SMALLINT
period_year         SMALLINT
base_amount         NUMERIC(10,2)  -- Guardado como referencia histórica
calculated_amount   NUMERIC(10,2)
tier_pct            NUMERIC(5,2)   -- % del bono ganado
calculated_at       TIMESTAMPTZ
UNIQUE (schema_id, user_id, period_month, period_year)
```

---

## RLS Políticas

### `incentive_schemas`
```sql
-- SELECT: ver si eres responsable de depto/área, o incentivos.view, o root
CREATE POLICY "schemas_select" ON incentive_schemas
FOR SELECT USING (
  -- Root
  is_root()
  -- O incentivos.view
  OR has_permission('incentivos.view')
  -- O responsable del depto
  OR EXISTS (
    SELECT 1 FROM org_departments d
    WHERE d.id = incentive_schemas.org_dept_id
    AND d.responsible_id = auth.uid()
  )
  -- O responsable del área
  OR EXISTS (
    SELECT 1 FROM org_areas a
    WHERE a.id = incentive_schemas.org_area_id
    AND a.responsible_id = auth.uid()
  )
);

-- INSERT: manage o root
CREATE POLICY "schemas_insert" ON incentive_schemas
FOR INSERT WITH CHECK (
  has_permission('incentivos.manage') OR is_root()
);
```

### `incentive_records`
```sql
-- SELECT: mismos permisos que schemas
CREATE POLICY "records_select" ON incentive_records
FOR SELECT USING (
  is_root()
  OR has_permission('incentivos.view')
  OR EXISTS (...) -- misma lógica que schemas
);
```

---

## Decisiones Técnicas Específicas

### 1. Separación de Sueldo Base y Bono Máximo
**Por qué**: Modelo anterior tenía solo `base_amount` y fórmula incorrecta `base × (1 + bonus_pct/100)`.

**Modelo Nuevo**:
- `base_amount` = sueldo base (informativo, no se usa en cálculo)
- `bonus_amount` = bono máximo al 100%
- `tiers.bonus_pct` = % del bono que se gana
- Fórmula: `bonus_amount × (tier_pct / 100)`

**Por qué es correcto**:
- Sueldo base es fijo, no debería multiplicarse por %
- Bono es lo que realmente varía según cumplimiento
- Más intuitivo para RRHH y empleados

### 2. Tipo de Período (monthly/annual/custom)
**Por qué**: No todos los incentivos son mensuales.

**Implicación**:
- `monthly`: cierra el último día de cada mes dentro de `valid_from`-`valid_to`
- `annual`: una sola evaluación al 31 de diciembre
- `custom`: evaluación al vencer `valid_to`

### 3. Entregas Tardías con Aprobación Especial
**Por qué**: A veces el empleado entrega tarde pero por causas justificadas.

**Implicación**:
- `late_approved_by` y `late_approved_at` en `objective_deliverables`
- Solo usuarios con `incentivos.approve` pueden aprobar
- El entregable cambia a `approved` pero queda registro de que fue tardío

### 4. Integración con Organigrama
**Por qué**: Departamentos pasaron de tabla `departments` a `org_departments`.

**Implicación**:
- `incentive_schemas.org_dept_id` reemplaza a `department_id`
- `incentive_schemas.org_area_id` para alcance más específico
- Responsables de depto/área pueden configurar esquemas

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay notificaciones**: Cuando se calculan incentivos, no hay alerta a empleados
2. **No hay histórico de cambios**: Si editas esquema, no hay audit log
3. **No hay previsualización**: No puedes ver cuánto ganará un empleado antes de ejecutar cálculo

### ✅ Bugs Corregidos
- **Fórmula incorrecta** (2026-04-17): Separación sueldo base / bono máximo
- **`revalidatePath` durante render** (2026-04-17): Eliminado (el redirect cubre la necesidad)
- **FK rota a `departments`** (2026-04-19): Migración a `org_departments`

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Notificaciones cuando se calculan incentivos
- [ ] Previsualización de incentivos (cuánto ganará cada empleado)
- [ ] Exportar a PDF (recibo de incentivo)

### Prioridad Media
- [ ] Histórico de cambios de esquemas (audit log)
- [ ] Comentarios en registros (justificación de bonus)
- [ ] Comparativa inter-períodos (tendencia de incentivos)

### Prioridad Baja
- [ ] Metas progresivas (tramos no solo por % sino por valor absoluto)
- [ ] Bonos por equipo (no solo individual)
- [ ] Deducciones (ausentismo, sanciones)

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `incentivos/page.tsx` | Lista de registros calculados |
| `incentivos/calcular/page.tsx` | Ejecutar cálculo de incentivos |
| `incentivos/configurar/page.tsx` | Configurar esquemas |
| `incentivos/incentive-actions.ts` | Server Actions |
| `components/incentivos/incentive-schema-form.tsx` | Formulario de esquema |
| `components/incentivos/incentive-schemas-list.tsx` | Lista de esquemas |
| `components/incentivos/late-deliverables-list.tsx` | Lista de entregas tardías |
| `components/objetivos/review-panel.tsx` | Panel con aprobación tardía |
| `objetivos/deliverable-actions.ts` | `approveLateSubmission()` |
