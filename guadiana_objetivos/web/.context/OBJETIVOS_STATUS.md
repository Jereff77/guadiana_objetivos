# Módulo de Objetivos - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: M1 - Sistema de Objetivos
**Estado**: ✅ Completado

## Resumen Ejecutivo

El módulo de objetivos permite gestionar objetivos departamentales por período mensual, asignar entregables a usuarios, subir evidencias múltiples (archivos, URLs, texto) y revisar aprobaciones. Está completamente integrado con el organigrama departamental.

---

## Características Implementadas

### ✅ Gestión de Departamentos
**Ubicación**: `/objetivos` y `/objetivos/configurar`

**Funcionalidades**:
- Crear, editar, eliminar departamentos
- Asignar responsable (manager)
- Departamentos pueden tener padre (jerarquía)
- Integrado con organigrama (`org_departments`)

**Permisos**:
- Ver: `objetivos.view`
- Gestionar: `objetivos.manage` O `departamentos.manage`

**Archivos**:
- `src/app/(dashboard)/objetivos/page.tsx` - Lista de departamentos
- `src/app/(dashboard)/objetivos/configurar/page.tsx` - CRUD de departamentos
- `src/components/objetivos/departments-grid.tsx` - Grid de tarjetas
- `src/app/(dashboard)/objetivos/dept-actions.ts` - Server Actions

---

### ✅ Objetivos por Período
**Ubicación**: `/objetivos/[deptId]`

**Funcionalidades**:
- Crear objetivos con título, descripción, peso (%)
- Asignar a un usuario específico (assignee_id)
- Selector de mes/año para filtrar objetivos
- Tipos de evidencia: documento, foto, texto, checklist
- Checklists se integran con módulo de formularios

**Permisos**:
- Ver: `objetivos.view`
- Gestionar: `objetivos.manage`

**Archivos**:
- `src/app/(dashboard)/objetivos/[deptId]/page.tsx` - Vista de depto
- `src/app/(dashboard)/objetivos/objective-actions.ts` - Server Actions

**Data Model**:
```typescript
interface Objective {
  id: string
  department_id: string
  title: string
  description?: string
  month: number  // 1-12
  year: number   // 2026
  weight: number // 25.00
  target_value?: number
  evidence_type: 'document' | 'photo' | 'text' | 'checklist'
  checklist_id?: string
  status: 'active' | 'closed' | 'cancelled'
  assignee_id?: string
}
```

---

### ✅ Entregables con Evidencias Múltiples
**Ubicación**: Panel de usuario en `/objetivos/[deptId]`

**Funcionalidades**:
- Crear entregables dentro de un objetivo
- Asignar fecha límite (due_date)
- Asignar a usuario (assignee_id)
- **Múltiples evidencias por entregable**:
  - Archivo subido a Supabase Storage (PDF, imagen, Word, Excel)
  - URL externa (ej: Google Drive, YouTube)
  - Texto libre
  - Ejecución de checklist (form_surveys)
- Estados: pending → submitted → approved/rejected

**Permisos**:
- Ver: `objetivos.view` O es mi assignee
- Submitir: auth.uid() == assignee
- Revisar: `objetivos.review`

**Archivos**:
- `src/components/objetivos/deliverable-row.tsx` - Fila de entregable
- `src/components/objetivos/evidence-uploader.tsx` - Uploader de evidencias
- `src/app/(dashboard)/objetivos/deliverable-actions.ts` - Server Actions

**Storage**:
- Bucket: `objective-evidences`
- RLS: Solo usuarios con `objetivos.view` o el submitter

---

### ✅ Sistema de Revisión
**Ubicación**: `ReviewPanel` en fila de entregable

**Funcionalidades**:
- Revisores pueden ver evidencias sin submitir
- Aprobar o rechazar con comentario obligatorio
- Soporte para entregas tardías (approved tardío con permiso especial)
- Notificación al usuario al aprobar/rechazar

**Permisos**:
- Revisar: `objetivos.review` O `objetivos.manage`

**Archivos**:
- `src/components/objetivos/review-panel.tsx` - Panel de revisión

**Flujo**:
1. Usuario sube evidencias → estado `submitted`
2. Revisor abre panel → ve todas las evidencias
3. Revisor hace click en Aprobar/Rechazar
4. Escribe comentario → estado cambia a `approved`/`rejected`

---

### ✅ Vista Centrada en Usuarios
**Ubicación**: `/objetivos/[deptId]` (rediseño 2026-04-19)

**Funcionalidades**:
- Grid de tarjetas con cada miembro del depto
- Click en tarjeta → Sheet lateral con:
  - Objetivos del usuario
  - Entregables con estados
  - Sección de incentivo (si tiene plan asignado)
- Crear objetivo inline sin navegar
- Asignar plan de incentivo inline
- Miembros regulares solo ven su propia tarjeta
- Responsables ven todo el equipo

**Permisos**:
- Ver mi tarjeta: auth.uid() == user.id
- Ver otras tarjetas: `objetivos.manage`
- Abrir panel: `objetivos.manage` O `objetivos.review` O es mi usuario

**Archivos**:
- `src/components/objetivos/dept-users-view.tsx` - Grid de usuarios
- `src/components/objetivos/user-objectives-panel.tsx` - Sheet lateral
- `src/components/objetivos/create-objective-for-user-form.tsx` - Formulario inline
- `src/components/objetivos/user-incentive-section.tsx` - Sección incentivo

---

### ✅ Dashboard Ejecutivo
**Ubicación**: `/dashboard`

**Funcionalidades**:
- Selector de mes/año
- 4 KPIs globales:
  - Total objetivos
  - % cumplimiento global
  - Objetivos vencidos
  - Alertas activas
- Gráfica de cumplimiento por depto (bar chart)
- Grid de tarjetas por depto con métricas
- Ranking de deptos (top 3 con medallas)
- Panel de alertas con dismiss
- Botón Exportar CSV (condicional a `dashboard.export`)

**Permisos**:
- Ver: `dashboard.view`
- Exportar: `dashboard.export`

**Archivos**:
- `src/app/(dashboard)/dashboard/page.tsx` - Página dashboard
- `src/components/dashboard/dept-kpi-card.tsx` - Tarjeta KPI
- `src/components/dashboard/ranking-table.tsx` - Tabla ranking
- `src/components/dashboard/dashboard-charts.tsx` - Gráficas

---

### ✅ Sistema de Alertas
**Ubicación**: `/dashboard` (panel alertas)

**Tipos de alerta**:
1. `low_completion` - Objetivo < 70% (critical si < 50%)
2. `deadline_approaching` - Entregable vence en ≤2 días sin evidencia
3. `period_closed` - Período cerrado con cumplimiento < 80%

**Funcionalidades**:
- Generadas automáticamente por `checkAndCreateAlerts()`
- Filtradas por usuario o rol
- Dismissible con un click
- Stored en `system_alerts` con RLS

**Permisos**:
- Ver: `dashboard.view` O es target_user
- Dismiss: target_user O `dashboard.view`

---

## Schema de Base de Datos

### Tablas Principales

#### `objectives`
```sql
id              UUID PRIMARY KEY
department_id   UUID REFERENCES departments(id)
title           TEXT
description     TEXT
month           SMALLINT
year            SMALLINT
weight          NUMERIC(5,2)
target_value    NUMERIC(10,2)
evidence_type   TEXT
checklist_id    UUID REFERENCES form_surveys(id)
status          TEXT
created_by      UUID REFERENCES profiles(id)
assignee_id     UUID REFERENCES profiles(id)  -- NUEVO
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
UNIQUE (assignee_id, department_id, month, year, title)
```

#### `objective_deliverables`
```sql
id                UUID PRIMARY KEY
objective_id      UUID REFERENCES objectives(id)
title             TEXT
description       TEXT
due_date          DATE
assignee_id       UUID REFERENCES profiles(id)
status            TEXT
submitted_at      TIMESTAMPTZ
late_approved_by  UUID REFERENCES profiles(id)  -- NUEVO
late_approved_at  TIMESTAMPTZ                  -- NUEVO
```

#### `objective_evidences`
```sql
id               UUID PRIMARY KEY
deliverable_id   UUID REFERENCES objective_deliverables(id)
submitted_by     UUID REFERENCES profiles(id)
storage_path     TEXT  -- Supabase Storage
evidence_url     TEXT  -- URL externa
text_content     TEXT
run_id           UUID REFERENCES resp_survey_runs(id)
submitted_at     TIMESTAMPTZ
notes            TEXT
```

#### `objective_reviews`
```sql
id              UUID PRIMARY KEY
deliverable_id  UUID REFERENCES objective_deliverables(id)
reviewer_id     UUID REFERENCES profiles(id)
verdict         TEXT (approved|rejected)
comment         TEXT
reviewed_at     TIMESTAMPTZ
```

#### `objective_progress`
```sql
id               UUID PRIMARY KEY
objective_id     UUID REFERENCES objectives(id)
department_id    UUID REFERENCES departments(id)
month            SMALLINT
year             SMALLINT
completion_pct   NUMERIC(5,2)
calculated_at    TIMESTAMPTZ
UNIQUE (objective_id, month, year)
```

#### `system_alerts`
```sql
id              UUID PRIMARY KEY
type            TEXT (low_completion|deadline_approaching|period_closed)
entity_type     TEXT (objective|deliverable|department)
entity_id       UUID
message         TEXT
severity        TEXT (info|warning|critical)
is_read         BOOLEAN
target_role_id  UUID REFERENCES roles(id)
target_user     UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ
```

---

## RLS Políticas

### `objectives`
```sql
-- SELECT: ver si tiene permiso objetivos.view o es assignee
CREATE POLICY "obj_view" ON objectives
FOR SELECT USING (
  has_permission('objetivos.view')
  OR assignee_id = auth.uid()
  OR is_root()
);

-- INSERT: manage o root
CREATE POLICY "obj_insert" ON objectives
FOR INSERT WITH CHECK (
  has_permission('objetivos.manage') OR is_root()
);

-- UPDATE/DELETE: manage o root
CREATE POLICY "obj_manage" ON objectives
FOR ALL USING (
  has_permission('objetivos.manage') OR is_root()
);
```

### `objective_deliverables`
```sql
-- SELECT: view o es assignee
CREATE POLICY "deliv_view" ON objective_deliverables
FOR SELECT USING (
  has_permission('objetivos.view')
  OR assignee_id = auth.uid()
  OR is_root()
);

-- INSERT: manage o root
CREATE POLICY "deliv_insert" ON objective_deliverables
FOR INSERT WITH CHECK (
  has_permission('objetivos.manage') OR is_root()
);
```

### `objective_evidences`
```sql
-- SELECT: view o es submitter
CREATE POLICY "evid_view" ON objective_evidences
FOR SELECT USING (
  has_permission('objetivos.view')
  OR submitted_by = auth.uid()
  OR is_root()
);

-- INSERT: cualquier usuario autenticado
CREATE POLICY "evid_submit" ON objective_evidences
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### `objective_reviews`
```sql
-- SELECT: view o es reviewer
CREATE POLICY "review_view" ON objective_reviews
FOR SELECT USING (
  has_permission('objetivos.view')
  OR reviewer_id = auth.uid()
  OR is_root()
);

-- INSERT: review o root
CREATE POLICY "review_create" ON objective_reviews
FOR INSERT WITH CHECK (
  has_permission('objetivos.review') OR is_root()
);
```

---

## Decisiones Técnicas Específicas

### 1. Múltiples Evidencias por Entregable
**Por qué**: Usuario necesita subir PDF + foto + explicación en un solo entregable.

**Implicación**:
- Relación 1:N de `objective_deliverables` → `objective_evidences`
- UI: lista temporal en cliente antes de submit
- Storage: múltiples archivos en bucket `objective-evidences`

### 2. Vista Centrada en Usuarios (2026-04-19)
**Por qué**: Flujo más natural para responsables que necesitan ver estado de su equipo.

**Implicación**:
- `/objetivos/[deptId]` muestra grid de tarjetas de usuarios
- Click en tarjeta → Sheet lateral con objetivos + incentivos
- `selectedUserId` derivado de prop `users` para auto-refresh

### 3. Entregas Tardías con Aprobación Especial
**Por qué**: A veces se entrega tarde pero debe aprobarse con autorización.

**Implicación**:
- `late_approved_by` y `late_approved_at` en `objective_deliverables`
- Solo usuarios con `incentivos.approve` pueden aprobar tardío
- Badge "Entregado con retraso" en panel de revisión

### 4. Integración con Organigrama
**Por qué**: Departamentos pasaron de tabla `departments` a `org_departments`.

**Implicación**:
- Migración `integrate_objectives_organigrama` aplicada
- `objectives.department_id` ahora referencia `org_departments`
- Drop de tabla antigua `departments`

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay notificaciones push**: Las alertas solo se ven en el dashboard
2. **No hay histórico de cambios**: Si editas un objetivo, no hay audit log
3. **No hay versionado de objetivos**: Si cambias peso, no se guarda histórico

### ✅ Bugs Corregidos (Últimas Sesiones)
- **RLS recursión infinita** (2026-04-19): Funciones SECURITY DEFINER para romper recursión
- **Columna title vs name** (2026-04-19): Corregido en `dept-actions.ts`
- **Migración incentives a org_departments** (2026-04-19): FK rota corregida

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Notificaciones push cuando se asigna objetivo
- [ ] Histórico de cambios de objetivos (audit log)
- [ ] KPIs de objetivos en dashboard (gráficas de tendencias)

### Prioridad Media
- [ ] Comentabilidad en objetivos (usuarios pueden comentar)
- [ ] Adjuntar archivos a objetivos (no solo a entregables)
- [ ] Exportar objetivo a PDF

### Prioridad Baja
- [ ] Templates de objetivos predefinidos
- [ ] Cascada de objetivos (objetivo de depto → subdivide en miembros)
- [ ] Comparativa inter-períodos

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `objetivos/page.tsx` | Lista de departamentos |
| `objetivos/[deptId]/page.tsx` | Vista de depto con grid de usuarios |
| `objetivos/dept-actions.ts` | Server Actions de departamentos |
| `objetivos/objective-actions.ts` | Server Actions de objetivos |
| `objetivos/deliverable-actions.ts` | Server Actions de entregables y evidencias |
| `objetivos/configurar/page.tsx` | Configuración de objetivos |
| `dashboard/page.tsx` | Dashboard ejecutivo |
| `dashboard/dashboard-actions.ts` | Server Actions de KPIs |
| `components/objetivos/dept-users-view.tsx` | Grid de tarjetas de usuarios |
| `components/objetivos/user-objectives-panel.tsx` | Sheet lateral de usuario |
| `components/objetivos/evidence-uploader.tsx` | Uploader de evidencias múltiples |
| `components/objetivos/review-panel.tsx` | Panel de revisión con aprobar/rechazar |
