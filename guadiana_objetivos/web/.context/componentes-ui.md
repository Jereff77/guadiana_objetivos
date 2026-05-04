# Componentes UI - Guadiana Objetivos

**Última actualización**: 2026-05-02

## Librería de Componentes

### Shadcn/UI (Base)
- **Fuente**: https://ui.shadcn.com/
- **Instalación**: CLI `npx shadcn-ui@latest add [component]`
- **Características**:
  - Componentes copiados al proyecto (no black box)
  - Basados en Radix UI (accesibilidad)
  - Estilizados con Tailwind CSS
  - Fácilmente customizables

### Componentes Instalados

#### Formularios
- `button` - Botones con variantes (default, destructive, outline, ghost, link)
- `input` - Inputs de texto
- `textarea` - Área de texto multiline
- `select` - Dropdown de selección
- `checkbox` - Checkbox individual
- `switch` - Toggle on/off
- `radio-group` - Radio buttons
- `label` - Etiquetas para formularios
- `form` - Wrapper con react-hook-form

#### Navegación
- `tabs` - Tabs con contenido
- `collapsible` - Contenido colapsable
- `breadcrumb` - Breadcrumbs de navegación

#### Feedback
- `alert` - Alertas de contexto
- `alert-dialog` - Confirmación de acción destructiva
- `toast` / `sonner` - Notificaciones toast
- `progress` - Barras de progreso

#### Superposición
- `dialog` - Modal con backdrop
- `sheet` - Panel lateral deslizable
- `dropdown-menu` - Menú contextual
- `popover` - Tooltip con contenido rico
- `tooltip` - Tooltip simple
- `hover-card` - Card al hover

#### Datos
- `table` - Tabla con estilos
- `card` - Contenedor card
- `separator` - Divisor horizontal/vertical

#### Visualización
- `avatar` - Avatar con imagen o iniciales
- `badge` - Badge con variantes
- `scroll-area` - Scroll custom

#### Miscelánea
- `command` - Palette de comandos (no usado actualmente)

---

## Componentes de Layout Principales

### `DashboardLayout`
**Ubicación**: `src/app/(dashboard)/layout.tsx`

**Propósito**: Layout envolvente para todas las rutas del dashboard.

**Características**:
- Server Component (async)
- Carga datos del usuario: nombre, email, avatar, permisos
- Renderiza `AppSidebar` (Client Component)
- Renderiza `PreviewBanner` si hay cookie de preview
- Envuelve contenido en `<main className="...">`

```typescript
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const permissions = await getUserPermissions()
  const isRoot = await checkIsRoot()

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        user={profile}
        permissions={permissions}
        isRoot={isRoot}
        companyName={companyName}
        logoUrl={logoUrl}
      />
      <main className="flex-1 overflow-auto">
        <PreviewBanner roleName={previewRoleName} />
        {children}
      </main>
    </div>
  )
}
```

---

### `AppSidebar`
**Ubicación**: `src/components/layout/app-sidebar.tsx`

**Propósito**: Sidebar navegable con grupos de items.

**Características**:
- Client Component ('use client')
- Grupos: Objetivos, Comunicación, Administración, Configuración
- Items filtrados por permisos del usuario
- Usuario mostrado al final con avatar, nombre y email
- Logo dinámico de empresa
- Highlight de item activo con color `#194D95`

**Grupos y Permisos**:

```typescript
const objetivosItems = [
  { href: '/dashboard', label: 'Dashboard', permission: 'dashboard.view' },
  { href: '/objetivos', label: 'Objetivos', permission: 'objetivos.view' },
  { href: '/organigrama', label: 'Organigrama', permission: 'organigrama.view' },
  { href: '/incentivos', label: 'Incentivos', permission: 'incentivos.view' },
]

const comunicacionItems = [
  { href: '/chat', label: 'Chat', permission: 'chat.view' },
]

const administracionItems = [
  { href: '/usuarios', label: 'Usuarios', permission: 'users.view' },
  { href: '/roles', label: 'Roles', permission: 'roles.view' },
]

const configuracionItems = [
  { href: '/configuracion/sistema', label: 'Sistema', permission: 'config.edit' },
]
```

---

## Patrones de Formularios

### Server Actions + Form Nativo
```typescript
// page.tsx (Server Component)
import { createObjective } from './objective-actions'

export default async function Page() {
  return (
    <form action={createObjective}>
      <input name="title" required />
      <button type="submit">Crear</button>
    </form>
  )
}
```

### Client Component con useState
```typescript
'use client'

export function CreateObjectiveForm() {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await createObjective({ title })

    if (result.error) {
      setError(result.error)
    } else {
      toast.success('Objetivo creado')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit">Crear</button>
    </form>
  )
}
```

### Form con react-hook-form
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional()
})

export function ObjectiveForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  async function onSubmit(data) {
    const result = await createObjective(data)
    if (result.error) toast.error(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      <button type="submit">Crear</button>
    </form>
  )
}
```

---

## Sistema de Notificaciones

### Sonner (Toast)
**Librería**: sonner 2.0.7

**Configuración**: `src/app/layout.tsx`
```typescript
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
```

**Uso**:
```typescript
import { toast } from 'sonner'

// Success
toast.success('Objetivo creado exitosamente')

// Error
toast.error('Error al crear objetivo', {
  description: error.message
})

// Info
toast.info('Procesando...')

// Promise
toast.promise(createObjective(data), {
  loading: 'Creando objetivo...',
  success: 'Objetivo creado',
  error: 'Error al crear objetivo'
})
```

---

## Design Tokens y Colores

### Colores Corporativos
**Ubicación**: `tailwind.config.ts`

```typescript
colors: {
  'brand-blue': '#004B8D',   // Azul corporativo
  'brand-orange': '#FF8F1C', // Naranja corporativo
}
```

**Uso**:
```tsx
<button className="bg-brand-blue text-white">
  Botón corporativo
</button>
```

### Variables CSS (Shadcn)
**Ubicación**: `src/app/globals.css`

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Font Family
**Ubicación**: `src/app/layout.tsx`

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

---

## Componentes Custom del Proyecto

### Objetivos
- `ObjectiveCard` - Tarjeta de objetivo con barra de progreso
- `DeliverableRow` - Fila de entregable con evidencias
- `EvidenceUploader` - Uploader de evidencias (URL/texto/archivo)
- `ReviewPanel` - Panel de revisión con aprobar/rechazar
- `DeptUsersView` - Grid de usuarios del depto

### Incentivos
- `IncentiveSchemaForm` - Formulario de plan de incentivo
- `IncentiveRecordRow` - Fila de registro de incentivo
- `TierEditor` - Editor de tiers (tramos)

### Formularios
- `SurveyCard` - Tarjeta de formulario
- `QuestionEditor` - Editor de pregunta
- `SectionPanel` - Panel de secciones con DnD
- `FlowEditor` - Editor visual de flujo (@xyflow/react)

### Chat
- `RoomList` - Lista de conversaciones
- `MessageView` - Vista de mensajes con Realtime
- `MessageInput` - Input con emoji picker
- `GroupCreateDialog` - Crear grupo

### Organigrama
- `OrganigramaCanvas` - Canvas interactivo
- `DirectionNode` - Nodo de Dirección
- `DepartmentNode` - Nodo de departamento
- `AreaNode` - Nodo de área

### LMS
- `CourseCard` - Tarjeta de curso
- `TopicEditor` - Editor de temario
- `ContentViewer` - Visor de contenido

---

## Patrones de Estilos

### Contenedor Principal
```tsx
<div className="container mx-auto px-4 py-8">
  {children}
</div>
```

### Card con Sombra
```tsx
<div className="bg-white rounded-lg shadow-md p-6">
  {content}
</div>
```

### Grid Responsivo
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Flex Center
```tsx
<div className="flex items-center justify-center">
  {content}
</div>
```

### Badge de Estado
```tsx
<Badge className={statusColor}>{statusLabel}</Badge>

// statusColor:
// pending: "bg-yellow-100 text-yellow-800"
// approved: "bg-green-100 text-green-800"
// rejected: "bg-red-100 text-red-800"
```

### Botón con Icono
```tsx
<Button>
  <Icon className="w-4 h-4 mr-2" />
  Label
</Button>
```

---

## Accesibilidad

### Radix UI Primitives
Todos los componentes shadcn/ui están basados en Radix UI, que incluye:
- Keyboard navigation
- ARIA labels
- Screen reader support
- Focus management

### Prácticas Accesibles
```tsx
// Formulario con labels asociados
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" name="email" type="email" required />
</div>

// Botones con aria-label cuando solo tienen icono
<Button aria-label="Cerrar">
  <X className="w-4 h-4" />
</Button>

// Links con texto descriptivo
<Link href="/objetivos" className="text-brand-blue hover:underline">
  Ver objetivos
</Link>
```

---

## Convenciones de Nomenclatura

### Archivos de Componentes
- PascalCase: `ObjectiveCard.tsx`
- Prefijo para tipo: `UserForm.tsx`, `AdminPanel.tsx`
- Sufijo para función: `CreateButton.tsx`, `DeleteDialog.tsx`

### Props Interfaces
```typescript
interface ObjectiveCardProps {
  objective: Objective
  canEdit?: boolean
  canDelete?: boolean
  onUpdate?: () => void
  onDelete?: () => void
}
```

### Server Actions
```typescript
// objective-actions.ts
export async function getObjective(id: string)
export async function createObjective(data: CreateObjectiveData)
export async function updateObjective(id: string, data: UpdateObjectiveData)
export async function deleteObjective(id: string)
```

### Estilos Condicionales
```typescript
// Tailwind + clsx + cn()
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)} />
```
