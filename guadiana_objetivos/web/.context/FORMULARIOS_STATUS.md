# Módulo de Formularios - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: Constructor de Formularios con Flujo Condicional
**Estado**: ✅ Completado

## Resumen Ejecutivo

Constructor visual de formularios/checklists con editor de flujo condicional tipo nodo. Permite crear formularios con secciones, preguntas de múltiples tipos, condiciones de salto (si respuesta = X → ir a sección Y), asignar a sucursales/roles/usuarios y ejecutar desde app móvil.

---

## Características Implementadas

### ✅ CRUD de Formularios
**Ubicación**: `/formularios`

**Funcionalidades**:
- Crear formularios con nombre y descripción
- Estados: draft → published → archived
- Versionado automático (crear nueva versión desde published)
- Duplicar formularios
- Eliminar (soft delete con archived)

**Permisos**:
- Ver: `formularios.view`
- Crear: `formularios.create`
- Editar: `formularios.edit`
- Eliminar: `formularios.delete`

**Archivos**:
- `src/app/(dashboard)/formularios/page.tsx` - Lista de formularios
- `src/app/(dashboard)/formularios/actions.ts` - Server Actions

---

### ✅ Editor Visual de Secciones y Preguntas
**Ubicación**: `/formularios/[id]/editar`

**Funcionalidades**:
- Secciones con título y orden (DnD para reordenar)
- Preguntas por sección con:
  - Tipo: boolean, single_choice, multiple_choice, text, number, date
  - Required/optional
  - Orden (DnD)
- Opciones para single/multiple choice (DnD)
- Panel de propiedades al hacer click en pregunta/sección
- Preview en tiempo real en phone frame

**Librerías**:
- `@dnd-kit/core` + `@dnd-kit/sortable` - Drag and drop
- `@radix-ui/*` - Componentes UI

**Archivos**:
- `src/app/(dashboard)/formularios/[id]/editar/page.tsx` - Server Component
- `src/app/(dashboard)/formularios/[id]/editar/editor-client.tsx` - Client Component
- `src/components/editor/sections-panel.tsx` - Panel de secciones DnD
- `src/components/editor/properties-panel.tsx` - Panel de propiedades

---

### ✅ Editor Visual de Flujo Condicional v2
**Ubicación**: Tab "Flujo" en `/formularios/[id]/editar`

**Funcionalidades**:
- Canvas interactivo con @xyflow/react
- Nodos por pregunta (no por sección)
- Handles de conexión:
  - Azul (input): entrada de pregunta anterior
  - Verde (question-out): salto incondicional a siguiente
  - Naranjas (option-*): condición por opción de respuesta
- Nodo FIN permanente (oscuro con CheckCircle2)
- Aristas:
  - Punteadas verdes: flujo por defecto (Q→Q)
  - Sólidas azules: condiciones (opción→Q/área/FIN)
- Panel de configuración al hacer click en arista
- Soporte para:
  - `jump_to_question`: saltar a pregunta específica
  - `jump_to_section`: saltar a sección específica
  - `jump_to_end`: terminar formulario

**Permisos**:
- Editar: `formularios.edit`

**Archivos**:
- `src/components/editor/flow/flow-editor.tsx` - Canvas principal
- `src/components/editor/flow/question-node.tsx` - Nodo de pregunta
- `src/components/editor/flow/end-node.tsx` - Nodo FIN
- `src/components/editor/flow/condition-edge.tsx` - Arista personalizada
- `src/components/editor/flow/edge-config-panel.tsx` - Panel de configuración
- `src/app/(dashboard)/formularios/[id]/editar/section-actions.ts` - Server Actions

**Data Model**:
```typescript
interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id?: string
  target_section_id?: string
  target_question_id?: string
  action: 'jump_to_section' | 'jump_to_question' | 'jump_to_end'
}
```

---

### ✅ Vista Previa con Navegación Condicional
**Ubicación**: `/formularios/[id]/vista-previa`

**Funcionalidades**:
- Phone frame CSS (375px ancho, 504px alto)
- Simula app móvil
- Navegación condicional:
  - Evalúa condiciones en tiempo real
  - Salta a sección/pregunta/FIN según respuesta
  - Auto-avance en boolean/single_choice (260ms delay)
- Botones:
  - ← Regresar (stack de historial)
  - Siguiente/Finalizar (según contexto)
  - Resumen (overlay con lista de respuestas)
- Soporte para todos los tipos de pregunta

**Archivos**:
- `src/app/(dashboard)/formularios/[id]/vista-previa/page.tsx` - Server Component
- `src/app/(dashboard)/formularios/[id]/vista-previa/preview-client.tsx` - Client Component

**Función `getNextId()`**:
```typescript
function getNextId(
  currentQuestionId: string,
  answers: Record<string, unknown>,
  conditions: Condition[]
): string | null {
  // 1. Buscar conditions de pregunta actual con valor que coincide
  // 2. Si hay match, retornar target_question_id o target_section_id
  // 3. Si no, buscar arista incondicional (question-out)
  // 4. Si no, siguiente en orden
  // 5. Si no hay siguiente, null (FIN)
}
```

---

### ✅ Asignación de Formularios
**Ubicación**: `/asignaciones`

**Funcionalidades**:
- Asignar formularios a:
  - Sucursales (branches)
  - Roles (ej: Operario, Auditor)
  - Usuarios específicos
- Frecuencia: única, diaria, semanal, mensual
- Vigencia: fechas desde/hasta
- Activar/desactivar asignaciones
- Tabla con badge activa/inactiva

**Permisos**:
- Ver: `asignaciones.view`
- Gestionar: `asignaciones.manage`

**Archivos**:
- `src/app/(dashboard)/asignaciones/page.tsx` - Lista de asignaciones
- `src/app/(dashboard)/asignaciones/actions.ts` - Server Actions
- `src/components/asignaciones/create-assignment-dialog.tsx` - Diálogo crear
- `src/components/asignaciones/assignments-table.tsx` - Tabla

---

### ✅ Ejecución y Resultados
**Ubicación**: `/resultados` y `/resultados/[id]`

**Funcionalidades**:
- Visor de ejecuciones:
  - Filtros por estado, fecha desde/hasta
  - Tabla con badge de estado
  - Link a detalle
- Vista detalle:
  - Multi-join run → answers → questions → sections → options
  - Componente `AnswerValue` polimórfico por tipo
  - "Acción a seguir" en naranja si hay comment
- Exportar CSV:
  - UTF-8 + BOM
  - Columnas: Período, Sucursal, Formulario, Pregunta, Respuesta
- Gráficas KPI:
  - FormCompletionChart (completitud por formulario)
  - WeeklyTrendChart (tendencia semanal)
  - BranchComplianceChart (cumplimiento por sucursal)

**Permisos**:
- Ver: `resultados.view`
- Exportar: `resultados.export`

**Archivos**:
- `src/app/(dashboard)/resultados/page.tsx` - Lista de ejecuciones
- `src/app/(dashboard)/resultados/[id]/page.tsx` - Detalle de ejecución
- `src/app/api/resultados/export/route.ts` - API CSV
- `src/components/resultados/kpi-charts.tsx` - Gráficas

---

## Schema de Base de Datos

### Tablas Principales

#### `form_surveys`
```sql
id          UUID PRIMARY KEY
name        TEXT
description TEXT
status      TEXT (draft|published|archived)
version     INTEGER
created_by  UUID REFERENCES profiles(id)
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### `form_sections`
```sql
id          UUID PRIMARY KEY
survey_id   UUID REFERENCES form_surveys(id)
title       TEXT
order       SMALLINT
```

#### `form_questions`
```sql
id          UUID PRIMARY KEY
section_id  UUID REFERENCES form_sections(id)
title       TEXT
type        TEXT (boolean|single_choice|multiple_choice|text|number|date)
required    BOOLEAN
order       SMALLINT
```

#### `form_question_options`
```sql
id          UUID PRIMARY KEY
question_id UUID REFERENCES form_questions(id)
label       TEXT
value       TEXT
order       SMALLINT
```

#### `form_conditions`
```sql
id                  UUID PRIMARY KEY
survey_id           UUID REFERENCES form_surveys(id)
source_question_id  UUID REFERENCES form_questions(id)
source_option_id    UUID REFERENCES form_question_options(id)
target_section_id   UUID REFERENCES form_sections(id)
target_question_id  UUID REFERENCES form_questions(id)
action              TEXT (jump_to_section|jump_to_question|jump_to_end)
```

#### `form_assignments`
```sql
id          UUID PRIMARY KEY
survey_id   UUID REFERENCES form_surveys(id)
branch_id   UUID
role_id     UUID REFERENCES roles(id)
user_id     UUID REFERENCES profiles(id)
frequency   TEXT
valid_from  DATE
valid_to    DATE
is_active   BOOLEAN
```

#### `resp_survey_runs`
```sql
id           UUID PRIMARY KEY
survey_id    UUID REFERENCES form_surveys(id)
submitted_by UUID REFERENCES profiles(id)
branch_id    UUID
status       TEXT (in_progress|completed)
submitted_at TIMESTAMPTZ
```

#### `resp_answers`
```sql
id          UUID PRIMARY KEY
run_id      UUID REFERENCES resp_survey_runs(id)
question_id UUID REFERENCES form_questions(id)
option_id   UUID REFERENCES form_question_options(id)
text_value  TEXT
number_value NUMERIC(10,2)
date_value  DATE
```

---

## Decisiones Técnicas Específicas

### 1. @xyflow/react para Editor Visual
**Por qué**: Librería especializada en diagramas de flujo con buen performance.

**Implicación**:
- Server Component no puede importar FlowEditor (SSR issue)
- Usar `dynamic(() => import(...), { ssr: false })`
- Nodos y aristas completamente personalizables

### 2. Nodos por Pregunta (v2)
**Por qué**: v1 tenía nodos por sección, pero flujo condicional es a nivel de pregunta.

**Implicación**:
- Canvas más grande (decenas de nodos)
- Handles específicos por opción de respuesta
- Nodo FIN permanente para todas las ramas

### 3. Auto-avance en Vista Previa
**Por qué**: UX más fluida en móvil, no requiere click en "Siguiente" para cada pregunta.

**Implicación**:
- `setTimeout(260ms)` para feedback visual antes de navegar
- Stack de historial para botón "Regresar"
- Solo en boolean y single_choice

### 4. Separación Estructura vs Flujo
**Por qué**: Un formulario puede cambiar estructura (preguntas) sin romper flujo.

**Implicación**:
- Tab "Estructura": secciones y preguntas
- Tab "Flujo": nodos y condiciones
- Guardado independiente

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay límite de profundidad**: Un formulario puede tener loops infinitos (no se valida)
2. **No hay validación de condiciones contradictorias**: Puedes crear dos condiciones que chocan
3. **No hay plantillas**: Todos los formularios se crean desde cero

### ✅ Bugs Corregidos
- **SSR crash FlowEditor** (v1): Resuelto con `dynamic(..., { ssr: false })`
- **Canvas solo mitad inferior** (v1): Resuelto con `absolute inset-0` en TabsContent
- **Hidratación DnD-kit** (v1): Resuelto con `suppressHydrationWarning`

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Validación de condiciones (detectar loops infinitos)
- [ ] Plantillas de formularios predefinidos
- [ ] Copiar secciones entre formularios

### Prioridad Media
- [ ] Límite de profundidad de nesting
- [ ] Exportar/importar formularios (JSON)
- [ ] Comentarios en preguntas (context help)

### Prioridad Baja
- [ ] Temas custom de formularios (branding por cliente)
- [ ] Lógica de visibilidad de preguntas (no solo salto)
- [ ] Cálculos en tiempo real (ej: sumar respuestas)

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `formularios/page.tsx` | Lista de formularios |
| `formularios/[id]/editar/page.tsx` | Editor Server Component |
| `formularios/[id]/editar/editor-client.tsx` | Editor Client Component |
| `formularios/[id]/vista-previa/page.tsx` | Vista previa |
| `formularios/actions.ts` | Server Actions de CRUD |
| `formularios/section-actions.ts` | Server Actions de secciones/condiciones |
| `components/editor/flow/flow-editor.tsx` | Canvas de flujo |
| `components/editor/sections-panel.tsx` | Panel de secciones DnD |
| `resultados/page.tsx` | Visor de ejecuciones |
| `resultados/[id]/page.tsx` | Detalle de ejecución |
| `asignaciones/page.tsx` | Lista de asignaciones |
