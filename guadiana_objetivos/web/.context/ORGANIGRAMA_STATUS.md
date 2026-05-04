# Módulo de Organigrama - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: Organigrama Departamental Interactivo
**Estado**: ✅ Completado

## Resumen Ejecutivo

Sistema de organigrama visual e interactivo con soporte para estructura departamental jerárquica, áreas funcionales dentro de departamentos y una figura de Dirección (singleton) por encima de todos. Canvas interactivo con drag-and-drop, zoom y gestión completa de miembros y puestos. Integrado con todos los módulos que dependen de la estructura organizacional (objetivos, incentivos, permisos).

---

## Características Implementadas

### ✅ Canvas Interactivo de Organigrama
**Ubicación**: `/organigrama`

**Funcionalidades**:
- Canvas con @xyflow/react (misma librería que editor de flujo)
- Nodos visuales:
  - **Dirección**: Nodo grande y prominente (★, mayúsculas, color propio)
  - **Departamentos**: Rectángulos con color, responsable, equipo
  - **Áreas**: Rectángulos pequeños dentro de depto o de Dirección
- Drag-and-drop:
  - Solo usuarios con `organigrama.manage` pueden mover nodos
  - Snap-to-grid (grid de 20px)
  - Posiciones persistidas en BD
- Zoom y pan (no implementado aún, canvas es estático)
- Conexiones visuales:
  - Dirección → Departamentos (arista hacia abajo)
  - Dirección → Áreas horizontales (aristas hacia lados)
  - Departamento → Áreas (arista hacia abajo)

**Permisos**:
- Ver: `organigrama.view`
- Mover/editar: `organigrama.manage`

**Archivos**:
- `src/app/(dashboard)/organigrama/page.tsx` - Server Component
- `src/components/organigrama/organigrama-canvas.tsx` - Canvas principal
- `src/components/organigrama/direction-node.tsx` - Nodo Dirección
- `src/components/organigrama/department-node.tsx` - Nodo Departamento
- `src/components/organigrama/area-node.tsx` - Nodo Área

---

### ✅ Dirección (Singleton)
**Ubicación**: Panel en `/organigrama`

**Funcionalidades**:
- **Única entidad Dirección** en todo el sistema
- Campos:
  - Nombre (ej: "Dirección General")
  - Color (8 presets + custom)
  - Responsable (buscador de usuarios)
  - Puesto (selector de puestos)
- Equipo directo:
  - Miembros asignados a Dirección
  - Cada miembro tiene un puesto
- Áreas horizontales:
  - Áreas que reportan directamente a Dirección (no a un depto)
  - Ej: "Recursos Humanos", "Finanzas", "Legal"
- Botón "Crear Dirección / Dirección" con color de la Dirección + icono ★

**Por qué Singleton**:
- La empresa tiene una sola Dirección General
- Evita confusiones con múltiples "direcciones"
- Nodo especial en canvas con estilos únicos

**Archivos**:
- `src/components/organigrama/direction-dialog.tsx` - Diálogo crear/editar
- `src/components/organigrama/organigrama-actions.ts` - Server Actions

---

### ✅ Departamentos
**Ubicación**: Canvas y panel en `/organigrama`

**Funcionalidades**:
- Crear departamentos con:
  - Nombre (ej: "Ventas", "Producción")
  - Color
  - Departamento padre (para jerarquía)
  - Responsable
  - Puesto del responsable
- Jerarquía:
  - Un depto puede tener padre (depto contenedor)
  - Permite estructuras anidadas (ej: "Producción" → "Línea 1", "Línea 2")
- Áreas funcionales:
  - Un depto puede tener múltiples áreas
  - Ej: Depto "Ventas" → Áreas "Norte", "Sur", "Este"
- Equipo:
  - Miembros asignados al depto
  - Cada miembro con puesto

**Archivos**:
- `src/components/organigrama/dept-node.tsx` - Nodo depto
- `src/components/organigrama/edit-dept-dialog.tsx` - Diálogo editar

---

### ✅ Áreas
**Ubicación**: Hijas de Dirección o Departamentos

**Tipos de Áreas**:
1. **Áreas de Dirección**:
   - Reportan directamente a Dirección
   - Posicionadas horizontalmente a los lados del nodo Dirección
   - Ej: "Recursos Humanos", "Finanzas"

2. **Áreas de Departamento**:
   - Reportan a un departamento
   - Posicionadas dentro del depto (abajo)
   - Ej: Depto "Ventas" → Área "Norte"

**Funcionalidades**:
- Nombre + color
- Responsable + puesto
- Miembros del equipo

**Archivos**:
- `src/components/organigrama/create-area-dialog.tsx` - Crear área
- `src/components/organigrama/area-node.tsx` - Nodo área

---

### ✅ Puestos (Positions)
**Ubicación**: Selector en diálogos

**Funcionalidades**:
- Catálogo de puestos predefinidos
- Tabla `org_positions` con `name TEXT UNIQUE`
- Ejemplos:
  - "Director General"
  - "Gerente de Ventas"
  - "Operario"
  - "Auditor"
  - "Asesor"
- Usados en:
  - Responsable de Dirección
  - Responsable de Departamento
  - Responsable de Área
  - Miembros de equipo

**Archivos**:
- `src/components/organigrama/position-select.tsx` - Selector de puestos

---

### ✅ Miembros (Members)
**Ubicación**: "Agregar al equipo" en nodos

**Funcionalidades**:
- Asignar usuarios a:
  - Dirección
  - Departamento
  - Área
- Cada miembro tiene:
  - Usuario (buscador)
  - Puesto (selector)
- Un usuario puede estar en múltiples lugares?
  - ⚠️ **REVISIÓN**: Actualmente sí, pero debería validarse

**Archivos**:
- `src/components/organigrama/assign-member-dialog.tsx` - Diálogo asignar

---

## Schema de Base de Datos

### Tablas Principales

#### `org_direction`
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
color_hex       TEXT NOT NULL
responsible_id  UUID REFERENCES profiles(id)
position_id     UUID REFERENCES org_positions(id)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ

-- Solo puede haber una fila
CREATE UNIQUE INDEX org_direction_singleton ON org_direction((1));
```

#### `org_departments`
```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
color_hex       TEXT NOT NULL
parent_dept_id  UUID REFERENCES org_departments(id)  -- Jerarquía
responsible_id  UUID REFERENCES profiles(id)
position_id     UUID REFERENCES org_positions(id)
x_position      INTEGER  -- Posición en canvas
y_position      INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `org_areas`
```sql
id              UUID PRIMARY KEY
department_id   UUID REFERENCES org_departments(id)  -- NULL si es de Dirección
direction_id    UUID REFERENCES org_direction(id)     -- NULL si es de Depto
name            TEXT NOT NULL
color_hex       TEXT NOT NULL
responsible_id  UUID REFERENCES profiles(id)
position_id     UUID REFERENCES org_positions(id)
x_position      INTEGER
y_position      INTEGER
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `org_positions`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
name        TEXT NOT NULL UNIQUE
```

#### `org_members`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES profiles(id)
department_id   UUID REFERENCES org_departments(id)  -- NULL si es de Dirección/Área
area_id         UUID REFERENCES org_areas(id)         -- NULL si es de Dirección/Depto
direction_id    UUID REFERENCES org_direction(id)     -- NULL si es de Depto/Área
position_id     UUID REFERENCES org_positions(id)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ

-- Check: solo uno de los tres puede ser no-null
CHECK (
  (department_id IS NOT NULL)::integer +
  (area_id IS NOT NULL)::integer +
  (direction_id IS NOT NULL)::integer = 1
)
```

---

## RLS Políticas

### `org_departments`, `org_areas`, `org_direction`
```sql
-- SELECT: todos los usuarios autenticados pueden ver
CREATE POLICY "org_view" ON org_departments
FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE: manage o root
CREATE POLICY "org_manage" ON org_departments
FOR ALL USING (
  has_permission('organigrama.manage') OR is_root()
);
```

### `org_members`
```sql
-- SELECT: todos pueden ver
CREATE POLICY "members_view" ON org_members
FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE/DELETE: manage o root
CREATE POLICY "members_manage" ON org_members
FOR ALL USING (
  has_permission('organigrama.manage') OR is_root()
);
```

### `org_positions`
```sql
-- SELECT: público
CREATE POLICY "positions_view" ON org_positions
FOR SELECT USING (true);

-- INSERT: manage o root
CREATE POLICY "positions_insert" ON org_positions
FOR INSERT WITH CHECK (
  has_permission('organigrama.manage') OR is_root()
);
```

---

## Decisiones Técnicas Específicas

### 1. Dirección como Singleton
**Por qué**: La empresa tiene una sola Dirección General.

**Implicación**:
- `CREATE UNIQUE INDEX org_direction_singleton ON org_direction((1))`
- Solo puede haber 1 fila en `org_direction`
- UI muestra botón "Crear Dirección" si no existe, o "Dirección" si existe

### 2. Canvas con @xyflow/react
**Por qué**: Ya usada en editor de flujo, equipo la conoce.

**Implicación**:
- Server Component no puede importar FlowEditor
- `dynamic(() => import(...), { ssr: false })`
- Canvas renderiza nodos según tipo

### 3. Snap-to-Grid
**Por qué**: Facilita alineación visual de nodos.

**Implicación**:
- Grid de 20px
- `onNodeDragStop` redondea posiciones a múltiplos de 20

### 4. Áreas pueden ser de Dirección o de Departamento
**Por qué**: Algunas áreas reportan a Dirección (ej: RRHH), otras a Depto (ej: "Ventas Norte").

**Implicación**:
- `org_areas.department_id` NULL si es de Dirección
- `org_areas.direction_id` NULL si es de Departamento
- Check constraint: solo uno puede ser no-null

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay zoom/pan**: Canvas es estático, no puedes hacer zoom
2. **No hay exportar imagen**: No puedes descargar organigrama como PNG
3. **Un usuario puede estar en múltiples lugares**: Debería validarse
4. **No hay histórico de movimientos**: Si mueves un nodo, no hay audit log

### ✅ Bugs Corregidos
- **RLS recursión infinita** (2026-04-19): Funciones SECURITY DEFINER
- **Columna `title` vs `name`** (2026-04-19): Corregido en todas las queries

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Validación: un usuario solo puede estar en un lugar
- [ ] Exportar organigrama a PNG/PDF
- [ ] Zoom y pan en canvas

### Prioridad Media
- [ ] Histórico de movimientos de nodos (audit log)
- [ ] Búsqueda de usuarios/áreas/deptos
- [ ] Filtros (mostrar solo deptos con miembros)

### Prioridad Baja
- [ ] Modo impresión (optimizado para papel)
- [ ] Compartir organigrama (link público)
- [ ] Incrustar organigrama en otros dashboards

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `organigrama/page.tsx` | Página principal |
| `organigrama/organigrama-canvas.tsx` - Canvas interactivo |
| `organigrama/direction-node.tsx` | Nodo Dirección |
| `organigrama/department-node.tsx` | Nodo Departamento |
| `organigrama/area-node.tsx` | Nodo Área |
| `organigrama/direction-dialog.tsx` | Crear/editar Dirección |
| `organigrama/edit-dept-dialog.tsx` | Editar departamento |
| `organigrama/create-area-dialog.tsx` | Crear área |
| `organigrama/assign-member-dialog.tsx` | Asignar miembro |
| `organigrama/position-select.tsx` | Selector de puestos |
| `organigrama/organigrama-actions.ts` | Server Actions |
