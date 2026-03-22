# Tasks: Corrección Sidebar — Módulo "Procesos" con Submenú por Hover

## Contexto

El sidebar actualmente muestra las opciones del módulo Procesos (Dashboard, Formularios, Asignaciones, Resultados) como ítems planos directamente visibles. Se requiere que "Procesos" sea un ítem padre, y al hacer hover sobre él se desplieguen las opciones como submenú.

**Archivo a modificar:** `web/src/components/layout/app-sidebar.tsx`

---

## Lista de Tareas

### [T-001] Agregar imports necesarios

**Archivo:** `web/src/components/layout/app-sidebar.tsx`

Agregar los siguientes imports:

- `useState`, `useEffect`, `useRef` desde `'react'`
- `FolderOpen`, `ChevronDown` desde `'lucide-react'` (junto a los iconos existentes)
- `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton` desde `'@/components/ui/sidebar'` (junto a los imports existentes)
- `Collapsible`, `CollapsibleContent` desde `'@/components/ui/collapsible'` (nuevo import)

**Criterio de aceptación:** El archivo compila sin errores de importación.

---

### [T-002] Implementar lógica de estado hover

**Archivo:** `web/src/components/layout/app-sidebar.tsx`

Dentro del componente `AppSidebar`, agregar:

```tsx
const isProcessActive = checklistItems.some(
  (item) => pathname === item.href || pathname.startsWith(item.href + '/')
)

const [isOpen, setIsOpen] = useState(isProcessActive)
const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

useEffect(() => {
  if (isProcessActive) setIsOpen(true)
}, [isProcessActive])

const handleMouseEnter = () => {
  if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  setIsOpen(true)
}

const handleMouseLeave = () => {
  closeTimerRef.current = setTimeout(() => setIsOpen(false), 150)
}
```

**Criterio de aceptación:**
- El submenú se abre al hacer hover en el ítem "Procesos"
- El submenú permanece abierto al mover el mouse del trigger al submenú
- Si hay una ruta activa del módulo, el submenú inicia abierto

---

### [T-003] Reemplazar estructura JSX del grupo "Procesos"

**Archivo:** `web/src/components/layout/app-sidebar.tsx`

Reemplazar el `SidebarGroup` actual que contiene los `checklistItems` planos por la nueva estructura con `Collapsible` y `SidebarMenuSub`:

```tsx
<SidebarGroup>
  <SidebarMenu>
    <SidebarMenuItem
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <SidebarMenuButton isActive={isProcessActive && !isOpen} className="w-full">
          <FolderOpen className="h-4 w-4" />
          <span>Procesos</span>
          <ChevronDown
            className={cn(
              'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </SidebarMenuButton>

        <CollapsibleContent>
          <SidebarMenuSub>
            {checklistItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <SidebarMenuSubItem key={item.href}>
                  <SidebarMenuSubButton asChild isActive={active}>
                    <Link
                      href={item.href}
                      className={cn('flex items-center gap-2', active && 'font-medium')}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  </SidebarMenu>
</SidebarGroup>
```

**Notas:**
- Eliminar `SidebarGroupLabel` del grupo (ya no se necesita como encabezado visible)
- El `SidebarMenuButton` NO usa `CollapsibleTrigger` (el control es por hover, no por click)
- `isActive={isProcessActive && !isOpen}` evita doble énfasis cuando el submenú está abierto

**Criterio de aceptación:**
- Se muestra "Procesos" con icono carpeta y chevron
- El hover despliega el submenú animado
- El ítem activo dentro del submenú se resalta correctamente

---

### [T-004] Verificación visual en el navegador

Verificar los siguientes escenarios:

| Escenario | Resultado esperado |
|-----------|-------------------|
| Abrir la app sin ruta activa del módulo | Ítem "Procesos" visible, submenú cerrado |
| Hover sobre "Procesos" | Submenú se despliega con animación |
| Mover mouse de trigger al submenú | Submenú NO se cierra |
| Sacar el mouse del área completa | Submenú se cierra tras ~150ms |
| Navegar a `/formularios` directamente | Submenú abierto por defecto, "Formularios" resaltado |
| Navegar entre ítems del submenú | El ítem activo cambia correctamente |
| Sacar el mouse cuando hay ítem activo | Submenú permanece abierto (useEffect mantiene isOpen=true) |

---

## Orden de ejecución

```
T-001 → T-002 → T-003 → T-004
```

## Archivos involucrados

| Archivo | Acción |
|---------|--------|
| `web/src/components/layout/app-sidebar.tsx` | Modificar |
| `web/src/components/ui/collapsible.tsx` | Solo lectura (ya existe) |
| `web/src/components/ui/sidebar.tsx` | Solo lectura (ya existe) |
