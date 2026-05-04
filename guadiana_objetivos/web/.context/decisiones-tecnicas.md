# Decisiones Técnicas - Guadiana Objetivos

**Última actualización**: 2026-05-02

## Decisiones Arquitectónicas Principales

### 1. Next.js 15 con App Router
**Decisión**: Usar Next.js 15 con App Router en lugar de Pages Router o frameworks alternativos.

**Por qué**:
- Server Components por defecto → mejor rendimiento y SEO
- Server Actions integradas → menos código boilerplate
- Streaming y suspense → mejor UX
- Ecosistema maduro con fuerte soporte de Vercel
- Compatibilidad perfecta con Supabase Auth

**Implicaciones**:
- Todos los layouts y páginas son Server Components por defecto
- Solo usar `'use client'` cuando necesite interactividad
- Server Actions reemplazan API routes tradicionales

**Qué NO cambiar**:
- ❌ No volver a Pages Router (sería un paso atrás)
- ❌ No agregar REST API adicional (Server Actions son suficientes)
- ❌ No usar frameworks de estado global complejos (Zustand solo para casos específicos)

---

### 2. Supabase como Backend TODO-EN-UNO
**Decisión**: Usar Supabase para BD, Auth, Storage y Realtime.

**Por qué**:
- PostgreSQL real → no es un "toy DB"
- Row Level Security (RLS) → seguridad a nivel de BD, imposible de bypass
- Auth integrado → menos código que implementar JWT manual
- Storage con RLS → mismo sistema de permisos que BD
- Realtime para features futuras (chat usa Realtime)
- Hosting gratuito generoso + plan enterprise accesible

**Implicaciones**:
- Todas las queries pasan por Supabase client
- RLS es la única fuente de verdad para permisos
- No hay API backend propia (Next.js → Supabase directo)

**Qué NO cambiar**:
- ❌ No construir API backend propia (perderías RLS)
- ❌ No usar Prisma/ORM (Supabase client es suficiente)
- ❌ No cambiar a Firebase (menos potente para queries complejas)

---

### 3. Sistema de Permisos Granular (Roles + RLS)
**Decisión**: Implementar sistema de roles personalizable en BD con funciones SQL que verifican permisos en tiempo real.

**Por qué**:
- Roles hardcodeados en código no son escalables
- Empresas cambian permisos frecuentemente
- Necesidad de auditoría de cambios de rol
- Soporte para "rol root" que bypasea todo
- Vista previa de roles para testing

**Implicaciones**:
- Tablas: `platform_modules`, `roles`, `role_permissions`, `role_change_log`
- Funciones SQL: `has_permission(key)`, `is_root()`
- Helpers TypeScript: `requirePermission()`, `checkPermission()`
- Cookie de preview: `guadiana_preview_role`

**Qué NO cambiar**:
- ❌ No mover lógica de permisos al frontend (inseguro)
- ❌ No usar middlewares Next.js para permisos (RLS es la fuente de verdad)
- ❌ No eliminar rol root (esencial para emergencias)

---

### 4. Server Actions sobre API Routes
**Decisión**: Usar Server Actions para toda la lógica de servidor en lugar de API REST tradicionales.

**Por qué**:
- Menos código: no necesitas `/api/xxx/route.ts`
- Type-safe: params y return types verificados en compile-time
- automáticamente protegen contra CSRF
- Perfecta integración con Server Components
- Revalidación de cache integrada con `revalidatePath()`

**Implicaciones**:
- Archivos `*-actions.ts` al lado de la página
- Marcados con `'use server'`
- Retornan `ActionResult<T>`: `{ data?: T; error?: string }`

**Qué NO cambiar**:
- ❌ No volver a API REST tradicionales (más boilerplate)
- ❌ No usar tRPC/GraphQL (overkill para este proyecto)

**Excepciones donde SÍ usamos API routes**:
- Export CSV (no es posible desde Server Actions fácilmente)
- Webhooks de terceros
- Health checks

---

### 5. Tailwind CSS + Shadcn/UI sobre Component Library
**Decisión**: Usar Tailwind CSS con componentes Shadcn/UI en lugar de una librería de componentes pre-construidos.

**Por qué**:
- Shadcn/UI = código que posees (no black box)
- Fácilmente customizable para branding corporativo
- Tailwind = cambios de estilo sin renombrar clases
- Radix UI como base → accesibilidad de fábrica
- No learning curve de componente propietario

**Implicaciones**:
- Colores corporativos en `tailwind.config.ts`
- Componentes en `src/components/ui/` (generados por CLI)
- Estilos con `cn()` helper (classnames + tailwind-merge)

**Qué NO cambiar**:
- ❌ No usar Material UI / Chakra UI (black box, hard to customize)
- ❌ No escribir CSS custom (mantén todo en Tailwind)

---

### 6. @xyflow/react para Editor Visual
**Decisión**: Usar @xyflow/react (antes ReactFlow) para editor visual de flujo condicional.

**Por qué**:
- Librería especializada en diagramas de flujo
- Nodos y aristas personalizables
- Drag-and-drop nativo
- Buen performance con decenas de nodos
- Comunidad activa

**Implicaciones**:
- Server Component no puede importar FlowEditor (SSR issue)
- Usar `dynamic(() => import(...), { ssr: false })`
- Nodos de preguntas con handles por respuesta

**Qué NO cambiar**:
- ❌ No construir editor visual desde cero (meses de desarrollo)

---

### 7. Docker Multi-Stage para Despliegue
**Decisión**: Usar Docker multi-stage build con output standalone para despliegue en Hostinger Node.js.

**Por qué**:
- Portabilidad: corre en cualquier lugar con Docker
- Tamaño de imagen optimizado (solo archivos necesarios)
- Standalone output de Next.js → bundle mínimo
- Fácil rollback con versiones de imagen
- Separación concerns: deps → build → run

**Implicaciones**:
- `node:20-alpine` como base
- Stage 1: instalar dependencies
- Stage 2: build con ARG para NEXT_PUBLIC_*
- Stage 3: runner con usuario non-root

**Qué NO cambiar**:
- ❌ No hacer deploy con `npm run build` directo (no reproducible)
- ❌ No usar Vercel/Netlify (cliente quiere hosting propio)

---

### 8. Recharts para Gráficas
**Decisión**: Usar Recharts para visualizaciones de datos.

**Por qué**:
- Integración perfecta con React
- Componentes declarativos
- Responsive por defecto
- No requiere learning curve de D3.js
- Suficiente para dashboards ejecutivos

**Implicaciones**:
- Chart components en 'use client' (Recharts no SSR)
- Separar dashboard-charts.tsx para evitar import en Server Components

**Qué NO cambiar**:
- ❌ No usar Chart.js / Highcharts (no React-first)

---

### 9. Sistema de Evidencias Múltiples por Entregable
**Decisión**: Permitir múltiples evidencias (archivo, URL, texto, checklist) en un solo entregable.

**Por qué**:
- Usuario necesita subir PDF + foto + explicación
- No es natural "mezclar" todo en un solo campo
- Flexibilidad para diferentes tipos de objetivos

**Implicaciones**:
- Tabla `objective_evidences` con relación 1:N
- Lista temporal de evidencias en cliente antes de submit
- Storage en bucket `objective-evidences`

**Qué NO cambiar**:
- ❌ No forzar "single evidence" (limitaría UX)

---

### 10. Chat con Realtime sobre WebSockets custom
**Decisión**: Usar Supabase Realtime para chat en lugar de implementar WebSockets propios.

**Por qué**:
- Supabase ya tiene Realtime con autenticación integrada
- No hay que manejar conexión/reconexión
- Canales de presencia automáticos
- Menos código que implementar WebSocket server

**Implicaciones**:
- Realtime habilitado en `chat_messages` y `chat_room_members`
- Subscribe a cambios en Client Component
- Optimistic updates en UI

**Qué NO cambiar**:
- ❌ No implementar WebSocket server propio (overkill)

---

## Decisiones de NO Implementar

### 1. No a Prisma ORM
**Por qué**: Supabase client es suficiente y ya está tipado. Prisma agregaría otra capa de complejidad sin beneficio real.

### 2. No a Redux/Zustand global
**Por qué**: Server Components + Server Actions reducen necesidad de estado global. Solo usar Zustand si hay estado compartido complejo (actualmente no lo hay).

### 3. No a Microservicios
**Por qué**: Proyecto no tiene escala para justificar overhead. Monolito Next.js + Supabase es suficiente.

### 4. No a GraphQL
**Por qué**: Overfetching/underfetching no es problema con Supabase queries. Server Actions son más simples.

### 5. No a Websockets custom
**Por qué**: Supabase Realtime es suficiente para chat y presence features.

---

## Deudas Técnicas Conocidas

### 1. Tipos de Supabase no generados
**Estado**: No se usan tipos generados de Supabase
**Por qué**: Migración manual de tipos es suficiente por ahora
**Riesgo**: Medium - typos en queries pueden causar errores runtime
**Plan**: Generar tipos con Supabase CLI cuando crezca el schema

### 2. Tests de E2E inexistentes
**Estado**: Solo hay tests unitarios de componentes
**Por qué**: Prioridad fue features sobre testing
**Riesgo**: Medium - bugs de integración pueden pasar
**Plan**: Agregar Playwright para flows críticos (login, objetivos, formularios)

### 3. No hay CI/CD automatizado
**Estado**: Deploy es manual via SSH + PM2
**Por qué**: Infraestructura del cliente no tiene GitHub Actions
**Riesgo**: Low - deploy es poco frecuente
**Plan**: Configurar CI cuando haya multiple developers

---

## Principios de Diseño

### 1. Security First
- RLS es la única fuente de verdad
- Nunca confiar en frontend para permisos
- Validar en backend SIEMPRE

### 2. Developer Experience
- TypeScript estricto
- ESLint para código limpio
- Hot reload en desarrollo
- Errores claros y accionables

### 3. Performance
- Server Components por defecto
- Static generation donde sea posible
- Optimización de imágenes
- Cache agresivo de assets estáticos

### 4. Maintainability
- Código modular y cohesivo
- Nombres descriptivos
- Comentarios solo para "por qué", no "qué"
- Separación concerns clara
