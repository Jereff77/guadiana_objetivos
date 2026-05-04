# Arquitectura General - Guadiana Objetivos

**Última actualización**: 2026-05-02

## Stack Tecnológico Completo

### Frontend
- **Next.js 15.5.14**: App Router, Server Components, Server Actions
- **React 18**: Client Components para interactividad
- **TypeScript 5**: Modo estricto, path aliases `@/*`
- **Tailwind CSS 3.4.1**: Estilos con configuración personalizada
- **Shadcn/UI**: Componentes pre-construidos (Dialog, Select, Tabs, etc.)
- **Radix UI**: Primitivas accesibles (Dropdown Menu, Avatar, Progress, etc.)
- **Lucide React**: Íconos
- **Recharts 3.8.0**: Gráficas
- **@xyflow/react 12.10.1**: Editor visual de flujo (formularios)
- **Sonner 2.0.7**: Notificaciones toast
- **date-fns 4.1.0**: Manejo de fechas

### Backend
- **Supabase**: PostgreSQL + Auth + Storage + Realtime
- **Server Actions**: Lógica de servidor en Next.js 15
- **Row Level Security (RLS)**: Seguridad granular por tabla

### Testing
- **Jest 30.3.0**: Framework de testing
- **Testing Library**: Testing de componentes React
- **ts-jest**: Preprocesador TypeScript

### Infraestructura
- **Docker**: Multi-stage build (node:20-alpine)
- **PM2**: Process manager (despliegue en Hostinger)
- **Git**: Control de versiones

## Estructura de Directorios

```
web/
├── src/
│   ├── app/                              # App Router (Server Components por defecto)
│   │   ├── (auth)/                       # Grupo de rutas públicas
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Página de login
│   │   │   └── forgot-password/
│   │   │       └── page.tsx             # Recuperación de contraseña
│   │   ├── (dashboard)/                  # Grupo de rutas protegidas (middleware)
│   │   │   ├── layout.tsx               # Layout principal (sidebar + header)
│   │   │   ├── page.tsx                 # Redirect a /inicio
│   │   │   ├── inicio/                  # Página de inicio post-login
│   │   │   ├── objetivos/               # Módulo M1 - Objetivos
│   │   │   │   ├── page.tsx            # Lista de departamentos
│   │   │   │   ├── [deptId]/           # Objetivos por departamento
│   │   │   │   └── configurar/         # Configuración de objetivos
│   │   │   ├── dashboard/              # Módulo M2 - Dashboard ejecutivo
│   │   │   ├── incentivos/             # Módulo M3 - Incentivos
│   │   │   ├── ia/                     # Módulo M4 - IA (auditoría, herramientas, políticas)
│   │   │   ├── mentoring/              # Módulo M6 - Mentoring
│   │   │   ├── capacitacion/           # Módulo M7 - LMS
│   │   │   ├── organigrama/            # Organigrama departamental
│   │   │   ├── chat/                   # Sistema de chat interno
│   │   │   ├── formularios/            # Constructor de formularios
│   │   │   ├── resultados/             # Resultados de formularios
│   │   │   ├── asignaciones/           # Asignación de formularios
│   │   │   ├── usuarios/               # Gestión de usuarios
│   │   │   ├── roles/                  # Gestión de roles
│   │   │   ├── configuracion/          # Configuración del sistema
│   │   │   └── sin-acceso/             # Página de acceso denegado
│   │   ├── api/                         # API Routes
│   │   │   ├── health/                 # Health check
│   │   │   ├── objetivos/              # Export CSV objetivos
│   │   │   └── resultados/             # Export CSV resultados
│   │   ├── auth/                        # Rutas de callback de Supabase
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Redirect a /inicio
│   │   └── globals.css                  # Estilos globales + variables CSS
│   ├── components/                      # Componentes React
│   │   ├── ui/                          # Componentes shadcn/ui (gen CLI)
│   │   ├── layout/                      # Layout (sidebar, header)
│   │   ├── objetivos/                   # Componentes de objetivos
│   │   ├── incentivos/                  # Componentes de incentivos
│   │   ├── formularios/                 # Componentes de formularios
│   │   ├── editor/                      # Editor visual de flujo
│   │   ├── chat/                        # Componentes de chat
│   │   ├── usuarios/                    # Componentes de usuarios
│   │   ├── roles/                       # Componentes de roles
│   │   ├── organizacion/                # Componentes de organigrama
│   │   ├── lms/                         # Componentes de LMS
│   │   └── configuracion/               # Componentes de configuración
│   ├── lib/                            # Utilidades y clientes
│   │   ├── supabase/
│   │   │   ├── server.ts               # Cliente Supabase (server)
│   │   │   ├── client.ts               # Cliente Supabase (browser)
│   │   │   └── admin.ts                # Cliente Supabase (service_role)
│   │   ├── permissions.ts               # Funciones de permisos
│   │   └── utils.ts                     # Helper cn() (classnames)
│   └── middleware.ts                    # Middleware de autenticación
├── supabase/
│   ├── migrations/                      # Migraciones de BD (ordenadas por timestamp)
│   │   ├── 20260320000001_*.sql        # Schema de checklists
│   │   ├── 20260322000010_*.sql        # Sistema de roles (M0)
│   │   ├── 20260322000020_*.sql        # Objetivos (M1)
│   │   ├── 20260322000030_*.sql        # Incentivos (M3)
│   │   ├── 20260322000040_*.sql        # IA (M4)
│   │   ├── 20260322000050_*.sql        # Mentoring (M6)
│   │   ├── 20260322000060_*.sql        # LMS (M7)
│   │   └── ...                         # Más migraciones
│   └── functions/                       # Edge Functions (no usadas actualmente)
├── Dockerfile                           # Multi-stage build para producción
├── next.config.ts                       # Configuración Next.js
├── tailwind.config.ts                   # Configuración Tailwind + colores
├── tsconfig.json                        # Configuración TypeScript
├── jest.config.ts                       # Configuración Jest
└── package.json                         # Dependencias
```

## Rutas y Páginas Principales

### Rutas Públicas (sin autenticación)
- `/login` - Inicio de sesión
- `/forgot-password` - Recuperación de contraseña
- `/auth/callback` - Callback de Supabase (PKCE)
- `/api/health` - Health check

### Rutas Protegidas (requieren autenticación)
- `/inicio` - Página de inicio post-login
- `/objetivos` - Lista de departamentos con objetivos
- `/objetivos/[deptId]` - Objetivos por departamento
- `/objetivos/configurar` - Configuración de objetivos
- `/dashboard` - Dashboard ejecutivo con KPIs
- `/incentivos` - Sistema de incentivos
- `/incentivos/configurar` - Configuración de planes de incentivo
- `/organigrama` - Organigrama departamental interactivo
- `/chat` - Sistema de chat interno
- `/formularios` - Lista de formularios
- `/formularios/[id]/editar` - Editor visual de formularios
- `/formularios/[id]/vista-previa` - Vista previa de formularios
- `/resultados` - Resultados de formularios
- `/resultados/[id]` - Detalle de ejecución
- `/resultados/estadisticas` - Gráficas KPI
- `/asignaciones` - Asignación de formularios
- `/usuarios` - Gestión de usuarios
- `/usuarios/[id]` - Edición de usuario
- `/roles` - Gestión de roles
- `/roles/nuevo` - Crear rol
- `/roles/[id]` - Edición de rol
- `/configuracion/sistema` - Configuración del sistema
- `/capacitacion` - Catálogo LMS
- `/capacitacion/[courseId]` - Curso LMS
- `/ia/auditoria` - Auditoría IA
- `/ia/habilidades` - Habilidades IA
- `/mentoring` - Programa de mentoring

## Protección de Rutas

### Middleware (`src/middleware.ts`)
- **Rutas públicas**: `/login`, `/forgot-password`, `/auth`, `/api/health`
- **Rutas privadas**: Todas las demás requieren autenticación
- **Redirect no autenticados**: → `/login?redirectTo=...`
- **Redirect autenticados en /login**: → `/inicio`

### Protección por Permisos
- Usar `requirePermission('permiso.key')` en Server Components
- Usar `checkPermission('permiso.key')` para condicionales
- Roles `root` bypasean todos los permisos

## Patrones de Arquitectura Clave

### 1. Server Components + Server Actions
```
page.tsx (Server Component)
  ├── fetch data (Supabase)
  ├── requiere permisos
  └── renderiza Client Component
      └── llama Server Actions (use server)
```

### 2. Client Components para Interactividad
- Formularios con estado local
- Tablas con filtros y ordenamiento
- Diálogos y modales
- Drag-and-drop (editor visual, organigrama)

### 3. Server Actions Pattern
```typescript
// file-actions.ts
'use server'

export async function actionName(params: Type): Promise<ActionResult<ReturnType>> {
  const supabase = await createClient()
  // validaciones
  // operacion Supabase
  // revalidatePath
  // redirect / return
}
```

### 4. Permisos Granulares
- Tabla `platform_modules`: 27 permisos predefinidos
- Tabla `roles`: Roles personalizables
- Tabla `role_permissions`: Permisos por rol
- Funciones SQL: `has_permission(key)`, `is_root()`
- Helpers: `requirePermission()`, `checkPermission()`

### 5. Layout con Sidebar
- `app/(dashboard)/layout.tsx`: Layout principal
- `app-sidebar.tsx`: Sidebar navegable con grupos
- Grupos: Objetivos, Comunicación, Administración, Configuración
- Items filtrados por permisos del usuario

### 6. Notificaciones Toast
- Librería: Sonner
- Uso: `toast.success()`, `toast.error()`
- Posición: bottom-right

### 7. Manejo de Errores
- Server Actions retornan `{ error?: string }`
- Client Components muestran error en toast
- Server Components redirigen a `/sin-acceso` si falta permiso

## Configuración de Next.js

### output: 'standalone'
- Para despliegue en contenedores
- Reduce tamaño del bundle
- Incluye solo archivos necesarios

### Headers de Seguridad
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: sin cámaras/micrófono/geo

### Cache de Assets
- `/_next/static/*`: 1 año en producción (hash en nombre)
- `/api/*`: sin caché (datos dinámicos)

### Optimización de Imágenes
- Formatos: AVIF, WebP
- Minimum cache TTL: 60s

## Convenciones de Código

### TypeScript
- Modo estricto
- Interfaces para props
- Types de Supabase generados (opcional)

### Nomenclatura
- Archivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Server Actions: `camelCase`
- Tablas BD: `snake_case`
- Constantes: `UPPER_SNAKE_CASE`

### Estructura de Archivos
- Página: `page.tsx` (Server Component)
- Layout: `layout.tsx`
- Server Actions: `*-actions.ts`
- Client Component: `*-client.tsx`
- Componente UI: `<component>.tsx`
