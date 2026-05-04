# Documentación del Proyecto - Guadiana Objetivos

**Fecha de generación**: 2026-05-02
**Estado del proyecto**: Activo desarrollo
**Rama principal**: `main`

## Índice de Documentación

### Arquitectura y Decisiones Técnicas
- [arquitectura-general.md](arquitectura-general.md) - Stack tecnológico, estructura de directorios, rutas y patrones clave
- [decisiones-tecnicas.md](decisiones-tecnicas.md) - Decisiones arquitectónicas con su razonamiento

### Integraciones
- [supabase-integracion.md](supabase-integracion.md) - Proyecto Supabase, tablas, RLS, funciones SQL
- [autenticacion-estado.md](autenticacion-estado.md) - Flujo de autenticación, permisos granulares, middleware

### Frontend
- [componentes-ui.md](componentes-ui.md) - Librería de componentes, patrones de formularios, design tokens

### Despliegue
- [despliegue-docker.md](despliegue-docker.md) - Configuración Docker, variables de entorno, deploy

### Estado de Módulos
- [OBJETIVOS_STATUS.md](OBJETIVOS_STATUS.md) - Sistema de objetivos y entregables
- [FORMULARIOS_STATUS.md](FORMULARIOS_STATUS.md) - Constructor de formularios con flujo condicional
- [CHAT_STATUS.md](CHAT_STATUS.md) - Sistema de chat interno
- [INCENTIVOS_STATUS.md](INCENTIVOS_STATUS.md) - Sistema de incentivos y bonos
- [ORGANIGRAMA_STATUS.md](ORGANIGRAMA_STATUS.md) - Módulo de organigrama departamental
- [LMS_STATUS.md](LMS_STATUS.md) - Sistema de gestión de aprendizaje (LMS)

## Estructura del Proyecto

```
guadiana_objetivos/
├── web/                        # Aplicación Next.js 15
│   ├── src/
│   │   ├── app/               # App Router (Next.js 15)
│   │   ├── components/        # Componentes React
│   │   ├── lib/              # Utilidades y clientes
│   │   └── middleware.ts     # Middleware de autenticación
│   ├── supabase/
│   │   ├── migrations/       # Migraciones de BD
│   │   └── functions/        # Funciones Edge (no usadas actualmente)
│   ├── Dockerfile            # Configuración Docker multi-stage
│   ├── next.config.ts        # Configuración Next.js
│   └── package.json          # Dependencias
└── inventarios/              # App Flutter (proyecto separado)
```

## Stack Tecnológico Principal

- **Frontend**: Next.js 15.5.14, React 18, TypeScript 5
- **Estilos**: Tailwind CSS 3.4.1, Shadcn/UI, Radix UI
- **Backend**: Supabase PostgreSQL, Server Actions
- **Auth**: Supabase Auth + RLS granular
- **Charts**: Recharts 3.8.0
- **Canvas**: @xyflow/react 12.10.1 (editor visual)
- **Testing**: Jest 30.3.0, Testing Library

## Convenciones del Proyecto

### Server Actions
- Archivos `*-actions.ts` en la ruta de la página
- Siempre con `'use server'`
- Retornan `ActionResult<T>`: `{ data?: T; error?: string }`

### Componentes
- Server Components para páginas (async, default export)
- Client Components para interactividad (directiva `'use client'`)
- Props tipadas con interfaces

### Permisos
- Usar `requirePermission()` en Server Components
- Usar `checkPermission()` para condicionales
- Permisos definidos en tabla `platform_modules`

### Supabase Storage
- Bucket `objective-evidences` para evidencias
- Bucket `lms-content` para contenido LMS
- Signed URLs con `createSignedUrl(path, 3600)` para descarga

## Próximos Pasos

Esta documentación se mantiene actualizada con el proyecto. Antes de continuar con cualquier desarrollo, revisa los archivos de estado de cada módulo para entender qué está implementado y qué pendiente.
