# Lista de Tareas — Sistema de Objetivos e Incentivos
## Llantas y Rines del Guadiana — Módulos M0, M1, M2, M3, M4, M6, M7

**Versión:** 2.0
**Fecha:** 2026-03-22

> M0 (Usuarios y Roles) es **prerequisito obligatorio** de todos los demás módulos.

---

## FASE 0 — Sistema de Usuarios y Roles Granular (M0)

### [T-001] Migración SQL — Tablas del sistema de roles
**Archivo:** `web/supabase/migrations/YYYYMMDD_create_roles_system.sql`
- Crear tabla `platform_modules` con todos los permisos definidos
- Crear tabla `roles` con seed del rol `root` (is_root = true)
- Crear tabla `role_permissions`
- Crear tabla `role_change_log`
- Insertar todos los registros de `platform_modules` (27 áreas)

### [T-002] Migración SQL — Actualizar tabla `profiles`
**Archivo:** `web/supabase/migrations/YYYYMMDD_update_profiles_roles.sql`
- Agregar columnas: `role_id UUID`, `whatsapp TEXT`, `phone TEXT`, `avatar_url TEXT`, `last_seen TIMESTAMPTZ`
- Validar formato WhatsApp: constraint CHECK con regex E.164 (`^\+[1-9]\d{7,14}$`)
- Índice en `role_id`

### [T-003] Migración SQL — Funciones SQL de permisos
**Archivo:** `web/supabase/migrations/YYYYMMDD_permission_functions.sql`
- Función `is_root()` — retorna boolean si usuario actual es root
- Función `has_permission(permission_key TEXT)` — combina is_root() + lookup en role_permissions

### [T-004] Migración SQL — RLS para tablas M0
**Archivo:** `web/supabase/migrations/YYYYMMDD_rls_roles_policies.sql`
- Políticas para `platform_modules`: lectura pública, escritura solo root
- Políticas para `roles` y `role_permissions`: basadas en `has_permission('roles.view')` y `has_permission('roles.manage')`
- Políticas para `profiles`: cada usuario lee/edita el suyo; `users.view` ve todos; `users.edit` edita todos
- Migrar políticas existentes de M5 a usar `has_permission()` en lugar de comparar `role` hardcodeado

### [T-005] Migración de datos — Roles actuales a nuevo sistema
**Archivo:** `web/supabase/migrations/YYYYMMDD_migrate_existing_roles.sql`
- Crear roles personalizados equivalentes a los hardcodeados:
  - `admin_global` → rol con todos los permisos excepto root
  - `jefe_sucursal` → rol con permisos de su área
  - `auditor`, `asesor`, `operario` → roles con permisos básicos
- Asignar `role_id` en `profiles` según el `role` TEXT actual
- Asignar permisos apropiados a cada nuevo rol

### [T-006] Helper de permisos en Next.js
**Archivo:** `web/src/lib/permissions.ts`
- `checkPermission(key: string): Promise<boolean>`
- `checkIsRoot(): Promise<boolean>`
- `requirePermission(key: string)` — redirige a `/sin-acceso` si falla
- `getUserPermissions(): Promise<string[]>` — lista de permisos del usuario actual

### [T-007] Server Actions — Gestión de roles
**Archivo:** `web/src/app/(dashboard)/roles/role-actions.ts`
- `createRole(data: { name, description })` — requiere `roles.manage`
- `updateRole(id, data)` — requiere `roles.manage`; no permite modificar el rol root
- `deleteRole(id)` — solo si no tiene usuarios asignados; requiere `roles.manage`
- `setRolePermissions(roleId, moduleKeys: string[])` — reemplaza permisos del rol
- `getRoleWithPermissions(id)` — retorna rol + sus permisos actuales

### [T-008] Server Actions — Gestión de usuarios
**Archivo:** `web/src/app/(dashboard)/usuarios/user-actions.ts`
- `updateUserProfile(userId, data: { full_name, phone, whatsapp, avatar_url })` — propio o con `users.edit`
- `activateUser(userId)` / `deactivateUser(userId)` — requiere `users.activate`
- `changeUserRole(userId, newRoleId)` — requiere `users.change_role`; no permite asignar root a menos que el actor sea root
- `inviteUser(email, roleId)` — requiere `users.edit`; usa Supabase Auth invitations
- `getAllUsers()` — requiere `users.view`

### [T-009] Componente — `PermissionsMatrix`
**Archivo:** `web/src/components/roles/permissions-matrix.tsx`
- Grid con módulos agrupados (Usuarios, Roles, Formularios, Objetivos, etc.)
- Toggle checkbox por cada área
- Estado visual: marcado = permiso activo
- Deshabilitado para el rol root (muestra todo como activo, no editable)

### [T-010] Componente — `RolesTable`
**Archivo:** `web/src/components/roles/roles-table.tsx`
- Tabla: nombre del rol, descripción, # de usuarios asignados, estado (activo/inactivo)
- Badge "ROOT" para el rol especial
- Acciones: editar, eliminar (deshabilitado si tiene usuarios)

### [T-011] Componente — `RoleForm`
**Archivo:** `web/src/components/roles/role-form.tsx`
- Campos: nombre, descripción
- Incluye `PermissionsMatrix` para configurar permisos
- Validación: nombre único

### [T-012] Página — `/roles`
**Archivo:** `web/src/app/(dashboard)/roles/page.tsx`
- Server Component; requiere `roles.view`
- Carga todos los roles y número de usuarios por rol
- Botón "Nuevo rol" (requiere `roles.manage`)
- Muestra `RolesTable`

### [T-013] Página — `/roles/nuevo` y `/roles/[id]`
**Archivos:** `web/src/app/(dashboard)/roles/nuevo/page.tsx` y `[id]/page.tsx`
- Requiere `roles.manage`
- Formulario completo con `RoleForm` + `PermissionsMatrix`
- Al guardar: llama `setRolePermissions`

### [T-014] Componente — `UsersTable`
**Archivo:** `web/src/components/usuarios/users-table.tsx`
- Tabla: nombre, email, rol (badge con color), estado (activo/inactivo), WhatsApp, último acceso
- Filtros: por rol, por estado
- Acciones por fila: editar perfil, activar/desactivar, cambiar rol

### [T-015] Componente — `UserProfileForm`
**Archivo:** `web/src/components/usuarios/user-profile-form.tsx`
- Campos: nombre completo, teléfono, WhatsApp (con validación E.164), avatar
- El campo WhatsApp incluye helper text: "Este número se usa para comunicación con la IA"
- Validación en cliente + servidor

### [T-016] Componente — `UserRoleSelector`
**Archivo:** `web/src/components/usuarios/user-role-selector.tsx`
- Dropdown con todos los roles activos
- El rol `root` solo aparece si el usuario actual es root
- Muestra advertencia al cambiar: "Este cambio modifica los accesos del usuario"

### [T-017] Página — `/usuarios`
**Archivo:** `web/src/app/(dashboard)/usuarios/page.tsx`
- Requiere `users.view`
- Lista todos los usuarios con `UsersTable`
- Botón "Invitar usuario" (requiere `users.edit`)

### [T-018] Página — `/usuarios/[id]`
**Archivo:** `web/src/app/(dashboard)/usuarios/[id]/page.tsx`
- Accesible para el propio usuario o con `users.edit`
- Formulario de perfil completo con `UserProfileForm`
- Sección de cambio de rol (visible con `users.change_role`)
- Sección de activar/desactivar (visible con `users.activate`)

### [T-019] Página — `/sin-acceso`
**Archivo:** `web/src/app/(dashboard)/sin-acceso/page.tsx`
- Página simple que indica que el usuario no tiene permisos
- Botón para volver al inicio

### [T-020] Actualizar sidebar para mostrar entradas según permisos
**Archivo:** `web/src/components/layout/app-sidebar.tsx`
- El Server Component del layout consulta permisos del usuario
- Muestra/oculta secciones según los permisos activos
- Agregar sección "Administración" con `/usuarios` y `/roles`

### [T-021] Actualizar M5 para usar `has_permission()`
**Archivos:** todas las Server Actions de M5 (`formularios/actions.ts`, `section-actions.ts`, `asignaciones/actions.ts`)
- Reemplazar verificaciones de `profiles.role = 'admin_global'` por `has_permission('formularios.create')`, etc.
- Actualizar RLS policies de tablas M5 para usar `has_permission()`

---

## FASE 1 — Departamentos y Objetivos (M1 core)

### [T-022] Migración SQL — Tablas de objetivos
**Archivo:** `web/supabase/migrations/YYYYMMDD_create_objectives_schema.sql`
- Tablas: `departments`, `objectives`, `objective_deliverables`, `objective_evidences`, `objective_reviews`, `objective_progress`
- RLS usando `has_permission('objetivos.view')`, `has_permission('objetivos.manage')`, `has_permission('objetivos.review')`
- Bucket Storage: `objective-evidences`

### [T-023] Server Actions — CRUD Departamentos
**Archivo:** `web/src/app/(dashboard)/objetivos/dept-actions.ts`
- `createDepartment(data)` — requiere `objetivos.manage`
- `updateDepartment(id, data)`
- `deleteDepartment(id)` — solo si no tiene objetivos activos
- `getDepartments()`

### [T-024] Server Actions — CRUD Objetivos
**Archivo:** `web/src/app/(dashboard)/objetivos/objective-actions.ts`
- `createObjective(deptId, data)` — requiere `objetivos.manage`
- `updateObjective(id, data)`
- `deleteObjective(id)`
- `cloneObjectives(fromMonth, fromYear, toMonth, toYear, deptId)`
- `closeObjectivesPeriod(month, year, deptId)`

### [T-025] Server Actions — Entregables y Evidencias
**Archivo:** `web/src/app/(dashboard)/objetivos/deliverable-actions.ts`
- `createDeliverable(objectiveId, data)` — requiere `objetivos.manage`
- `submitEvidence(deliverableId, evidenceData)` — cualquier usuario asignado
- `reviewDeliverable(deliverableId, verdict, comment)` — requiere `objetivos.review`
- `calculateObjectiveProgress(objectiveId)`

### [T-026] Componentes — Objetivos
- `src/components/objetivos/objective-card.tsx`
- `src/components/objetivos/deliverable-row.tsx`
- `src/components/objetivos/evidence-uploader.tsx`
- `src/components/objetivos/review-panel.tsx`

### [T-027] Páginas — Objetivos
- `web/src/app/(dashboard)/objetivos/page.tsx` — requiere `objetivos.view`
- `web/src/app/(dashboard)/objetivos/[deptId]/page.tsx`
- `web/src/app/(dashboard)/objetivos/configurar/page.tsx` — requiere `objetivos.manage`

---

## FASE 2 — Dashboard y KPIs (M2)

### [T-028] Server Actions — Datos de dashboard
**Archivo:** `web/src/app/(dashboard)/dashboard/dashboard-actions.ts`
- `getDashboardKpis(month, year)` — requiere `dashboard.view`
- `getDeptTrend(deptId, months)`
- `getDepartmentRanking(month, year)`
- `getActiveAlerts(userId)`

### [T-029] Componentes — Dashboard
- `src/components/dashboard/dept-kpi-card.tsx`
- `src/components/dashboard/ranking-table.tsx`
- `src/components/dashboard/alert-badge.tsx`
- Extender `src/components/resultados/kpi-charts.tsx` con `ObjectiveTrendChart` y `ComplianceBarChart`

### [T-030] Página — `/dashboard`
**Archivo:** `web/src/app/(dashboard)/dashboard/page.tsx`
- Requiere `dashboard.view`
- Grid de KPIs, gráficas de tendencia, ranking, panel de alertas

### [T-031] Exportación — Dashboard
**Archivo:** `web/src/app/api/objetivos/export/route.ts`
- Requiere `dashboard.export`
- Reutiliza patrón de `src/app/api/resultados/export/route.ts`

### [T-032] Lógica de alertas automáticas
**Archivo:** ampliar `objective-actions.ts`
- `checkAndCreateAlerts(month, year)` — evalúa condiciones y crea registros en `system_alerts`

---

## FASE 3 — Incentivos (M3)

### [T-033] Migración SQL — Tablas de incentivos
**Archivo:** `web/supabase/migrations/YYYYMMDD_create_incentives_schema.sql`
- Tablas: `incentive_schemas`, `incentive_records`
- RLS con `has_permission('incentivos.view')`, `has_permission('incentivos.manage')`, `has_permission('incentivos.approve')`

### [T-034] Server Actions — Incentivos
**Archivo:** `web/src/app/(dashboard)/incentivos/incentive-actions.ts`
- `createIncentiveSchema(data)` — requiere `incentivos.manage`
- `calculateIncentivesForPeriod(month, year)` — requiere `incentivos.manage`
- `approveIncentiveRecord(recordId, notes)` — requiere `incentivos.approve`
- `getMyIncentiveHistory(userId)` — cualquier usuario (su propio registro)

### [T-035] Componentes y páginas — Incentivos
- `src/components/incentivos/incentive-schema-form.tsx`
- `src/components/incentivos/incentive-record-row.tsx`
- `web/src/app/(dashboard)/incentivos/page.tsx` — requiere `incentivos.view`
- `web/src/app/(dashboard)/incentivos/configurar/page.tsx` — requiere `incentivos.manage`
- `web/src/app/api/incentivos/export/route.ts`

---

## FASE 4 — Servicio Python de IA (M4)

### [T-036] Migración SQL — Tablas IA
**Archivo:** `web/supabase/migrations/YYYYMMDD_create_ai_schema.sql`
- Tablas: `ai_analysis_results`, `ai_prompts`
- Insertar prompt por defecto
- RLS con `has_permission('ia.view')` y `has_permission('ia.configure')`

### [T-037] Estructura del servicio Python
**Directorio:** `ai-service/`
- Inicializar proyecto FastAPI
- `requirements.txt`: `fastapi`, `uvicorn`, `supabase`, `anthropic`, `httpx`, `pydantic`, `python-multipart`
- Middleware de autenticación API Key
- Módulo `whatsapp.py` para notificaciones (lee `profiles.whatsapp` via Supabase)

### [T-038] Router `/analyze` en Python
**Archivo:** `ai-service/routers/analyze.py`
- Recibe deliverable, evidencias y criterios
- Descarga archivos desde Storage, llama API de IA
- Guarda resultado en `ai_analysis_results`
- Opcionalmente notifica al usuario via WhatsApp

### [T-039] Router `/chat` en Python
**Archivo:** `ai-service/routers/chat.py`
- Chat contextualizado con contenido LMS
- Lee contenido de Supabase para contexto

### [T-040] Server Action — Disparar análisis IA
**Archivo:** ampliar `deliverable-actions.ts`
- `requestAiAnalysis(deliverableId)` — llama Python desde Server Action
- Requiere `objetivos.review`

### [T-041] Componentes y página — IA
- `src/components/ia/analysis-result-card.tsx`
- `src/components/ia/prompt-editor.tsx`
- `web/src/app/(dashboard)/ia-verificacion/page.tsx` — requiere `ia.view`

---

## FASE 5 — Mentoring (M6)

### [T-042] Migración SQL — Tablas mentoring
- Tablas: `mentoring_pairs`, `mentoring_sessions`
- RLS con `has_permission('mentoring.view')` y `has_permission('mentoring.manage')`

### [T-043] Server Actions y páginas — Mentoring
- `web/src/app/(dashboard)/mentoring/mentoring-actions.ts`
- `src/components/mentoring/pair-card.tsx`
- `src/components/mentoring/session-form.tsx`
- `web/src/app/(dashboard)/mentoring/page.tsx`
- `web/src/app/(dashboard)/mentoring/[pairId]/page.tsx`

---

## FASE 6 — LMS (M7)

### [T-044] Migración SQL — Tablas LMS
- Tablas: `lms_content`, `lms_quizzes`, `lms_paths`, `lms_progress`
- Bucket Storage: `lms-content`
- RLS con `has_permission('capacitacion.view')` y `has_permission('capacitacion.manage')`

### [T-045] Server Actions y páginas — LMS
- `web/src/app/(dashboard)/capacitacion/lms-actions.ts`
- `src/components/lms/content-card.tsx`, `quiz-component.tsx`, `path-progress-bar.tsx`, `ai-chat-panel.tsx`
- `web/src/app/(dashboard)/capacitacion/page.tsx`
- `web/src/app/(dashboard)/capacitacion/[contentId]/page.tsx`
- `web/src/app/(dashboard)/capacitacion/chat/page.tsx`

---

## Tareas Transversales

### [T-046] Regenerar tipos TypeScript
- Después de cada fase de migraciones: `supabase gen types typescript > src/types/database.types.ts`

### [T-047] Variables de entorno
- Documentar en `.env.example`: `PYTHON_AI_SERVICE_URL`, `PYTHON_AI_SERVICE_API_KEY`

### [T-048] Actualizar página `/inicio`
**Archivo:** `web/src/app/(dashboard)/inicio/page.tsx`
- Tarjetas de acceso rápido a módulos (visibles según permisos del usuario)
- Panel de alertas pendientes

---

## Orden de Implementación

```
FASE 0 (obligatoria primero):
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008
→ T-009 → T-010 → T-011 → T-012 → T-013 → T-014 → T-015 → T-016
→ T-017 → T-018 → T-019 → T-020 → T-021

FASE 1 (M1):
T-022 → T-023 → T-024 → T-025 → T-026 → T-027

FASE 2 (M2):
T-028 → T-029 → T-030 → T-031 → T-032

FASE 3 (M3) — paralelo con FASE 4:
T-033 → T-034 → T-035

FASE 4 (M4) — paralelo con FASE 3:
T-036 → T-037 → T-038 → T-039 → T-040 → T-041

FASE 5 (M6):
T-042 → T-043

FASE 6 (M7):
T-044 → T-045

Transversales (al final de cada fase):
T-046 → T-047 → T-048
```
