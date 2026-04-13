# Requisitos: Sidebar con Menús Padre Colapsables

## Contexto

El sidebar actual muestra las 6 secciones de navegación (Objetivos, Procesos, Desarrollo Humano,
Comunicación, IA, Configuración) como etiquetas decorativas estáticas con sus ítems siempre visibles.

Se requiere convertirlas en **menús padre interactivos** con comportamiento accordion: apertura en
hover y persistencia al seleccionar un submenú.

## Estado actual

- Secciones son `<p>` decorativas (uppercase, muted), **no interactivas**
- Todos los submenús siempre visibles, sin colapsar
- Componente: `src/components/layout/app-sidebar.tsx` → función interna `NavGroup`

---

## Diagrama de comportamiento

```
[Sidebar cargado]               [Hover en "Objetivos"]          [Click en submenú]
┌────────────────────┐          ┌────────────────────────────┐   ┌────────────────────────────┐
│ [Logo]             │          │ [Logo]                     │   │ [Logo]                     │
│                    │          │                            │   │                            │
│ ▶ Objetivos        │──hover──▶│ ▼ Objetivos                │   │ ▼ Objetivos  [abierto]     │
│ ▶ Procesos         │          │    • Dashboard             │   │    • Dashboard             │
│ ▶ Desarrollo H.    │          │    • Objetivos             │   │  ► • Objetivos  [activo]   │
│ ▶ Comunicación     │          │    • Incentivos            │   │    • Incentivos            │
│ ▶ IA               │          │ ▶ Procesos                 │   │ ▶ Procesos                 │
│ ▶ Configuración    │          │ ▶ Desarrollo H.            │   │ ▶ Desarrollo H.            │
└────────────────────┘          └────────────────────────────┘   └────────────────────────────┘
```

---

## Requisitos Funcionales

### [REQ-001] Menú padre como elemento interactivo

- Cada sección se representa como un **botón clickeable** (no etiqueta decorativa)
- Muestra un **icono** representativo a su izquierda
- Muestra un **chevron** (▶/▼) a su derecha indicando estado expandido/colapsado
- Cuando algún submenú hijo está activo, el menú padre se muestra con estilo activo (color de acento)

**Iconos propuestos para menús padre:**

| Sección           | Icono (lucide-react)  |
|-------------------|-----------------------|
| Objetivos         | `Target`              |
| Procesos          | `Workflow`            |
| Desarrollo Humano | `GraduationCap`       |
| Comunicación      | `MessageCircle`       |
| IA                | `BrainCircuit`        |
| Configuración     | `Settings`            |

---

### [REQ-002] Apertura por hover

- Al hacer **hover** sobre el menú padre, sus submenús se expanden automáticamente
- La expansión tiene animación suave (150ms)
- Al salir el mouse del área (padre + submenús), el grupo se colapsa **si no tiene un submenú pinned**

---

### [REQ-003] Persistencia al hacer clic en submenú

- Al hacer **clic en un submenú**, el menú padre queda "pinned" (permanece abierto)
- El submenú seleccionado se marca como activo: fondo `#194D95`, texto blanco
- Solo **un menú padre** puede estar pinned simultáneamente (comportamiento accordion)
- El clic en el propio menú padre alterna su estado pinned/unpinned

---

### [REQ-004] Estado inicial automático

- Al cargar la página, el sistema detecta la ruta activa
- La sección que contiene esa ruta se abre automáticamente (pinned)
- El submenú correspondiente aparece marcado como activo

---

### [REQ-005] Filtrado por permisos (sin cambios)

- Los menús padre solo se renderizan si tienen **al menos 1 submenú visible** tras filtrar por permisos
- Los submenús sin permiso del usuario siguen ocultos
- Root users ven todo (`isRoot = true` → `has()` retorna siempre `true`)

---

### [REQ-006] Badge en submenús y menú padre

- Los badges existentes (ej: mensajes no leídos en Chat) se mantienen en los submenús
- Cuando el grupo está **colapsado**, el badge total se muestra en el propio menú padre
- Estilo del badge según `active`: blanco sobre azul (activo) o rojo sobre blanco (inactivo)

---

## Requisitos No Funcionales

### [NFR-001] Animación fluida

- Usar `max-height` con `transition-all duration-150 ease-in-out` para el colapso/expansión
- Rotación del chevron: `rotate-90` con `transition-transform duration-150`

### [NFR-002] Sin dependencias adicionales

- Solo usar `useState`, `useEffect` de React (ya importados en el proyecto)
- No agregar librerías externas

### [NFR-003] Compatibilidad responsive

- El mismo comportamiento hover/click en desktop y en el sheet mobile
- No regresiones en el sidebar actual

---

## Diseño Técnico

### Nueva interface de grupo

```typescript
interface NavGroupDef {
  label: string
  icon: React.ElementType       // Icono del menú padre
  items: NavItem[]
}
```

### Estado en AppSidebar

```typescript
// Grupo "pinned" (persiste tras click en submenú)
const [openGroup, setOpenGroup] = useState<string | null>(null)

// Se inicializa en useEffect detectando la ruta activa:
// Si pathname pertenece a un grupo, setOpenGroup(grupo.label)
```

### Componente NavGroupCollapsible

```typescript
function NavGroupCollapsible({
  group,
  isActive,
  openGroup,
  setOpenGroup,
}: {
  group: NavGroupDef
  isActive: (href: string) => boolean
  openGroup: string | null
  setOpenGroup: (g: string | null) => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const hasActiveChild = group.items.some(i => isActive(i.href))
  const expanded = isHovered || openGroup === group.label
  const Icon = group.icon

  // Pinned auto al montar si tiene hijo activo
  useEffect(() => {
    if (hasActiveChild) setOpenGroup(group.label)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="px-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cabecera del grupo */}
      <button
        onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          hasActiveChild
            ? 'text-white font-medium'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
        )}
        style={hasActiveChild ? { backgroundColor: '#194D95' } : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left truncate">{group.label}</span>
        {/* Badge agregado si colapsado */}
        <ChevronRight className={cn(
          'h-3.5 w-3.5 shrink-0 transition-transform duration-150',
          expanded && 'rotate-90'
        )} />
      </button>

      {/* Submenús con animación */}
      <div className={cn(
        'overflow-hidden transition-all duration-150 ease-in-out',
        expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <ul className="mt-0.5 space-y-0.5 pl-2">
          {group.items.map(item => { /* ...mismo render que hoy... */ })}
        </ul>
      </div>
    </div>
  )
}
```

---

## Archivo a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/layout/app-sidebar.tsx` | Reemplazar `NavGroup` por `NavGroupCollapsible`; agregar estado `openGroup`; definir `NavGroupDef[]` con iconos |

---

## Criterios de aceptación / Verificación

1. **Carga en `/objetivos`** → sección "Objetivos" abierta automáticamente, ítem "Objetivos" marcado en azul
2. **Hover en "Procesos"** → se expanden Formularios, Asignaciones, Resultados con animación
3. **Clic en "Formularios"** → "Procesos" queda abierto y "Formularios" marcado activo
4. **Mouse sale de "Procesos"** (sin clic previo) → "Procesos" se colapsa
5. **Clic en otro grupo** → el grupo anterior se cierra (accordion)
6. **Chat con mensajes** → badge visible en submenú al expandir, y en menú padre cuando colapsado
7. **Usuario sin `ia.configure`** → solo ve submenús con permiso `ia.view` dentro de "IA"
