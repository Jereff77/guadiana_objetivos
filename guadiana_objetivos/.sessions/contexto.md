# Contexto del Proyecto - Plataforma Web Guadiana Checklists

## Información de Sesión
- **IA Utilizada**: Claude Sonnet 4.6
- **Fecha**: 2026-03-20
- **Herramientas**: Claude Code CLI
- **Agentes Especializados Utilizados**: nextjs-developer, backend-supabase-developer
- **Rol**: Orquestador IA

## Resumen del Proyecto
Plataforma web (Next.js 15) + App móvil Flutter para gestionar checklists y encuestas de auditoría interna en Llantas y Rines del Guadiana. Backend sobre Supabase (PostgreSQL, Auth, Storage). El web permite a administradores diseñar formularios, asignar tareas y ver resultados. La app móvil permite a asesores/operarios responder checklists.

**Supabase Project URL**: https://zpqjzjqwlofzvxeeczcq.supabase.co
**Monorepo root**: `guadiana_objetivos/`
**Web app path**: `guadiana_objetivos/web/`

## Estado Actual del Proyecto
| Tarea | Estado |
|-------|--------|
| T-101 Init Next.js | ✅ Completado (Claude Sonnet 4.6) [Agente: nextjs-developer] |
| T-102 Config Supabase | ✅ Completado (Claude Sonnet 4.6) [Agente: nextjs-developer] |
| T-103 Design System | ✅ Completado (Claude Sonnet 4.6) [Agente: nextjs-developer] |
| T-104 Auth + Middleware | ✅ Completado (Claude Sonnet 4.6) [Agente: nextjs-developer] |
| T-105 DB Schema | ✅ Completado (Claude Sonnet 4.6) [Agente: directo + MCP Supabase] |
| T-106 RLS Policies | ✅ Completado (Claude Sonnet 4.6) [Agente: directo + MCP Supabase] |

---

## Historial de Trabajo por IA

### Claude Sonnet 4.6 - Sesión 2026-03-20 (Primera)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Ejecutar la tarea de mayor prioridad del PRD web (web-development-tasks.md), verificar BD en Supabase, resolver issues, actualizar progreso y confirmar cambios.
- **Análisis realizado**: La BD de Supabase tiene tablas del sistema PDD existente (llantas), pero NO tiene las tablas `form_*` ni `resp_*` requeridas para checklists. El proyecto web (Next.js) no existía — solo había carpeta `Specs/`.
- **Decisión de agentes**: Usar agente `nextjs-developer` para T-101 (inicialización del proyecto Next.js 15 con TypeScript, Tailwind CSS y Shadcn/UI).

#### Tareas Realizadas:
1. **T-101: Inicializar proyecto Next.js 15+** (Herramientas: Bash, Write, nextjs-developer agent)
   - Proyecto creado en `guadiana_objetivos/web/`
   - Next.js actualizado a 15.5.14 (vulnerabilidad en 14.2.29 solucionada)
   - 0 vulnerabilidades npm
   - ESLint configurado con 0 warnings / 0 errores
   - Build de producción exitoso (6 rutas estáticas generadas)
   - TypeScript sin errores (strict mode)
   - Colores corporativos: brand-blue #004B8D, brand-orange #FF8F1C
   - Shadcn/UI configurado (components.json, utils.ts, variables CSS)
   - Estructura App Router: /, /login, /dashboard, middleware placeholder

#### Agentes Especializados Utilizados:
- **nextjs-developer**: Creó toda la estructura del proyecto Next.js (package.json, tsconfig, tailwind.config, componentes base, layout, pages)

#### Errores Encontrados y Soluciones:
- **Problema**: Next.js 14.2.29 tenía 4 vulnerabilidades de seguridad críticas
  - **Solución**: Actualizado a Next.js 15.5.14 (0 vulnerabilidades)
- **Problema**: Warning ESLint `_request` defined but never used en middleware.ts
  - **Solución**: Agregado comentario `eslint-disable-next-line` específico para el placeholder
- **Problema**: `npm run lint` requería input interactivo (no había .eslintrc)
  - **Solución**: Creado `.eslintrc.json` manualmente con extends `next/core-web-vitals`

#### Archivos Modificados/Creados:
- `guadiana_objetivos/web/package.json`: Proyecto Next.js 15.5.14
- `guadiana_objetivos/web/tsconfig.json`: TypeScript strict, path alias @/*
- `guadiana_objetivos/web/next.config.ts`: Config mínima Next.js
- `guadiana_objetivos/web/tailwind.config.ts`: Colores corporativos + variables Shadcn
- `guadiana_objetivos/web/postcss.config.mjs`: PostCSS con Tailwind
- `guadiana_objetivos/web/.env.local`: URL Supabase real, placeholder anon key
- `guadiana_objetivos/web/.gitignore`: Estándar Next.js
- `guadiana_objetivos/web/components.json`: Configuración Shadcn/UI
- `guadiana_objetivos/web/.eslintrc.json`: ESLint con next/core-web-vitals
- `guadiana_objetivos/web/src/app/layout.tsx`: Root layout con fuente Inter
- `guadiana_objetivos/web/src/app/page.tsx`: Redirect a /dashboard
- `guadiana_objetivos/web/src/app/globals.css`: Variables CSS Shadcn light/dark
- `guadiana_objetivos/web/src/app/(auth)/login/page.tsx`: Página login placeholder
- `guadiana_objetivos/web/src/app/(dashboard)/layout.tsx`: Layout dashboard con sidebar
- `guadiana_objetivos/web/src/app/(dashboard)/dashboard/page.tsx`: Dashboard placeholder
- `guadiana_objetivos/web/src/lib/utils.ts`: Función cn() para Shadcn
- `guadiana_objetivos/web/src/middleware.ts`: Middleware placeholder (T-104)
- `guadiana_objetivos/Specs/progreso.txt`: Actualizado con T-101 completado

---

### Claude Sonnet 4.6 - Sesión 2026-03-20 (Segunda)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Ejecutar tarea de mayor prioridad (T-105 DB Schema), usar MCP Supabase, resolver issues, actualizar progreso, confirmar cambios.
- **Análisis realizado**: T-101 a T-104 ya completados (confirmado por git log). BD Supabase no tenía tablas form_* ni resp_*. Migración SQL y tipos TypeScript ya preparados localmente.
- **Decisión de agentes**: Trabajo directo con MCP supaGuadianaObj — no se necesitó agente especializado.

#### Tareas Realizadas:
1. **T-105: Crear esquema de base de datos en Supabase** (Herramientas: MCP Supabase, Bash, Edit)
   - Verificado: BD solo tenía tablas okcar_ e inventario del sistema anterior
   - Migración `create_checklists_schema` aplicada vía MCP apply_migration
   - 7 tablas creadas: profiles, form_surveys, form_sections, form_questions, form_question_options, form_assignments, resp_survey_runs, resp_answers
   - Triggers: handle_new_user() (auto-perfil) + update_updated_at()
   - database.types.ts regenerado con generate_typescript_types (88KB, tipos completos)
   - TypeScript: 0 errores | ESLint: 0 warnings ✓

#### Agentes Especializados Utilizados:
- **Ninguno**: Tarea ejecutada directamente con herramientas MCP Supabase + CLI

#### Errores Encontrados y Soluciones:
- **Ninguno**: La migración aplicó sin errores.

#### Archivos Modificados/Creados:
- `guadiana_objetivos/web/supabase/migrations/20260320000001_create_checklists_schema.sql`: Migración SQL completa
- `guadiana_objetivos/web/src/types/database.types.ts`: Tipos regenerados desde Supabase (88KB)
- `guadiana_objetivos/Specs/progreso.txt`: T-105 marcado como completado

---

### Claude Sonnet 4.6 - Sesión 2026-03-20 (Tercera)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con siguiente tarea prioritaria (T-106 RLS).
- **Análisis realizado**: T-105 ya completado. T-106 es la última tarea de Fase 1.
- **Decisión de agentes**: Trabajo directo con MCP supaGuadianaObj.

#### Tareas Realizadas:
1. **T-106: Implementar políticas RLS** (Herramientas: MCP Supabase, Write)
   - Helpers SECURITY DEFINER: current_user_role() y current_user_branch()
   - RLS habilitado en 8 tablas, 30 políticas aplicadas
   - admin_global: acceso total a todos los datos
   - jefe_sucursal: solo datos de su branch_id
   - auditor: lectura total de formularios y respuestas
   - asesor/operario: solo sus propias ejecuciones y respuestas
   - Migración guardada localmente: 20260320000002_rls_checklists_policies.sql
   - TypeScript: 0 errores ✓ | **Fase 1: COMPLETADA** ✅

#### Archivos Modificados/Creados:
- `guadiana_objetivos/web/supabase/migrations/20260320000002_rls_checklists_policies.sql`: Migración RLS completa
- `guadiana_objetivos/Specs/progreso.txt`: Fase 1 marcada como completada

---

### Claude Sonnet 4.6 - Sesión 2026-03-20 (Cuarta)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar desde Fase 1 completa, ejecutar toda la Fase 2 hasta completar.
- **Análisis realizado**: T-201 a T-207 pendientes. Se trabajó una tarea a la vez, con pruebas completas tras cada una.
- **Decisión de agentes**: Trabajo directo — no se necesitaron agentes especializados.

#### Tareas Realizadas:
1. **T-201: Dashboard de formularios** — Página /formularios con tabs, tabla responsive, Server Actions CRUD, CreateSurveyDialog, SurveyActionsMenu con AlertDialog. date-fns instalado.
2. **T-202/T-203/T-204: Editor de formularios + Secciones + Preguntas** — Layout dos paneles, 7 tipos de pregunta, SectionsPanel árbol colapsable, PropertiesPanel con sub-paneles por tipo, Server Actions CRUD completo para secciones/preguntas/opciones. scroll-area + textarea (Shadcn).
3. **T-205: Drag & Drop** — @dnd-kit instalado, SortableSection + SortableQuestion, actualización optimista + persist en Supabase con reorderSections/reorderQuestions.
4. **T-206: Auto-save** — useEditorSaveStatus hook, debounce 800ms en los 3 paneles de propiedades, SaveIndicator en top bar, validación server-side antes de publicar (1 sección + 1 pregunta mínimo).
5. **T-207: KPIs / Puntajes** — OptionRow con score editable inline, opciones Sí(1)/No(0) auto-creadas para boolean, updateOption Server Action, puntaje máximo en tiempo real.

#### Estado Final Fase 2: ✅ COMPLETADA (7/7 tareas)

#### Archivos Clave Creados/Modificados:
- `web/src/app/(dashboard)/formularios/` — Dashboard y editor completo
- `web/src/components/formularios/` — Dialog crear, tabla, menú acciones
- `web/src/components/editor/` — Editor dos paneles con DnD y auto-save
- `web/src/hooks/use-auto-save.ts` — Hook de guardado global
- `web/package.json` — date-fns, @dnd-kit/*

---

### Claude Sonnet 4.6 - Sesión 2026-03-20 (Quinta)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar desde Fase 2 completa, ejecutar Fases 3, 4 y 5.
- **Decisión de agentes**: Trabajo directo — nextjs-developer + backend-supabase-developer según necesidad.

#### Tareas Realizadas:
1. **T-301: Flujo de publicación y versionamiento** — publish/archive/restore/delete en Server Actions. `createNewVersion` copia estructura completa (secciones→preguntas→opciones) con version+1. Botón "Crear nueva versión" en editor y listado.
2. **T-302/T-303: Módulo de Asignaciones + Vigencia/Frecuencia** — Página /asignaciones con tabla filtrable. Dialog con selector de formulario publicado, tipo (rol/usuario), frecuencia (Una vez/Diario/Semanal/Mensual), fecha inicio/fin. Server Actions: createAssignment, toggleAssignment, deleteAssignment.
3. **T-304: Vista previa simulando App Móvil** — Página /formularios/[id]/vista-previa con phone frame CSS (iPhone 375px). Renderiza todos los tipos de pregunta interactivos.
4. **T-401: Visor de Ejecuciones** — Página /resultados con filtros GET (estado, fecha desde/hasta). Tabla con respondente desde app_profiles.
5. **T-402: Detalle de Ejecución** — Respuestas agrupadas por sección. AnswerValue polimórfico. "Acción a seguir" resaltada en naranja.
6. **T-403: Exportación CSV** — API route GET /api/resultados/export. CSV UTF-8+BOM, escape RFC 4180. Botón "Exportar CSV".
7. **T-404: Estadísticas KPI** — Página /resultados/estadisticas con recharts. 4 KPI cards + BarChart + LineChart + BarChart horizontal por sucursal con semáforo de color.
8. **T-501: Pruebas de integración** — Jest 30 + @testing-library/react 16. 4 suites / 37 tests / 0 fallos.
9. **T-502: Optimización rendimiento y SEO** — next.config.ts standalone+compress+security headers. Metadata SEO en todas las páginas. Build: 14 rutas, 0 errores.
10. **T-503: Auditoría RLS** — 8 tablas verificadas vía MCP. Bug corregido: app_profiles sin política admin → migración rls_fix_app_profiles_admin_select aplicada.
11. **T-504: Despliegue y capacitación** — Guías completas en Specs/deployment-guide.md.

#### Estado Final MVP: ✅ TODAS LAS FASES COMPLETADAS (5/5)

#### Archivos Clave:
- `web/src/app/(dashboard)/asignaciones/` — Módulo completo de asignaciones
- `web/src/app/(dashboard)/resultados/` — Visor, detalle, estadísticas
- `web/src/app/api/resultados/export/` — API exportación CSV
- `web/supabase/migrations/` — Migración RLS fix app_profiles
- `Specs/deployment-guide.md`, `Specs/rls-audit-report.md`

---

### Claude Sonnet 4.6 - Sesión 2026-03-21

#### Rol: Orquestador IA
- **Solicitud del usuario**: (1) Verificar fix del bug "crear formulario" con Playwright. (2) Cambiar sidebar para que colapse a solo iconos en lugar de ocultarse. (3) Al reportar problemas visuales con el colapso, se decidió quitar el colapso por completo — el sidebar queda fijo.
- **Decisión de agentes**: Trabajo directo con Playwright MCP.

#### Tareas Realizadas:
1. **Fix sidebar collapsible** — Cambiado `collapsible="icon"` → `collapsible="none"` en `app-sidebar.tsx`. Sidebar fijo, sin posibilidad de colapsar.
2. **Quitar SidebarTrigger** — Eliminado el botón "Toggle Sidebar" del `header.tsx` (import + JSX eliminados). Header queda más limpio.

#### Problema encontrado y descartado:
- Se intentó implementar modo icono (`collapsible="icon"`) pero el HMR de Windows (chokidar) no detectaba cambios en el archivo, por lo que el dev server seguía compilando código antiguo. Se requería reiniciar el servidor en cada cambio.
- **Decisión del usuario**: Quitar la funcionalidad de colapso por completo — no es prioritaria.

#### Archivos Modificados:
- `web/src/components/layout/app-sidebar.tsx`: `collapsible="none"` (sidebar siempre visible)
- `web/src/components/layout/header.tsx`: Eliminado SidebarTrigger e import

#### Estado Actual:
| Tarea | Estado |
|-------|--------|
| Fases 1-5 MVP | ✅ Completadas (Claude Sonnet 4.6) |
| Sidebar fijo sin toggle | ✅ Completado (Claude Sonnet 4.6) - 2026-03-21 |

### Claude Sonnet 4.6 - Sesión 2026-03-22 (FASE 3)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con la siguiente tarea del sistema de objetivos hasta completar FASE 3.
- **Análisis realizado**: Fases 0, 1 y 2 completadas en sesiones previas. La siguiente era FASE 3 — Sistema de Incentivos (M3): T-033, T-034, T-035.
- **Decisión de agentes**: Trabajo directo — tareas de migración SQL, Server Actions y UI/páginas bien delimitadas.

#### Tareas Realizadas:
1. **T-033: Migración SQL** — Tablas `incentive_schemas` e `incentive_records` aplicadas a Supabase vía MCP. RLS con políticas `incentivos.view/manage/approve`. Triggers `updated_at`. Archivo local: `20260322000030_create_incentives_schema.sql`.
2. **T-034: Server Actions** — `incentive-actions.ts` con: getIncentiveSchemas, createIncentiveSchema, updateIncentiveSchema, deleteIncentiveSchema, calculateIncentivesForPeriod, approveIncentiveRecord, markIncentiveRecordAsPaid, getMyIncentiveHistory, getAllIncentiveRecords, getIncentiveSummary.
3. **T-035: Componentes y páginas** — IncentiveSchemaForm, IncentiveRecordRow, IncentiveSchemasList; páginas /incentivos, /incentivos/configurar, /incentivos/calcular; API /api/incentivos/export (CSV); sidebar actualizado con entrada Incentivos bajo permiso `incentivos.view`.

#### Archivos Modificados/Creados:
- `web/supabase/migrations/20260322000030_create_incentives_schema.sql`: Migración M3
- `web/src/app/(dashboard)/incentivos/incentive-actions.ts`: Server Actions
- `web/src/app/(dashboard)/incentivos/page.tsx`: Página principal
- `web/src/app/(dashboard)/incentivos/configurar/page.tsx`: Configurar esquemas
- `web/src/app/(dashboard)/incentivos/calcular/page.tsx`: Disparar cálculo
- `web/src/app/api/incentivos/export/route.ts`: Exportación CSV
- `web/src/components/incentivos/incentive-schema-form.tsx`: Formulario de esquemas
- `web/src/components/incentivos/incentive-record-row.tsx`: Fila de registro
- `web/src/components/incentivos/incentive-schemas-list.tsx`: Lista de esquemas
- `web/src/components/layout/app-sidebar.tsx`: +Incentivos en sidebar

#### Estado Actual:
| Fase | Estado |
|------|--------|
| FASE 0 — Roles y Usuarios (M0) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 1 — Objetivos (M1) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 2 — Dashboard y KPIs (M2) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 3 — Incentivos (M3) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 4 — Servicio Python de IA (M4) | ⏳ Pendiente |
| FASE 5 — Mentoring (M6) | ⏳ Pendiente |
| FASE 6 — LMS (M7) | ⏳ Pendiente |

### Claude Sonnet 4.6 - Sesión 2026-03-22 (FASE 4)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con la siguiente tarea del sistema de objetivos hasta completar FASE 4.
- **Análisis realizado**: FASE 3 completada. Siguiente era FASE 4 — Servicio Python de IA (M4): T-036 a T-041 + T-047.
- **Decisión de agentes**: Trabajo directo — SQL, Python FastAPI y componentes Next.js bien delimitados.

#### Tareas Realizadas:
1. **T-036**: Migración SQL `ai_prompts` + `ai_analysis_results` con RLS granular y prompt de verificación seeded.
2. **T-037**: Estructura FastAPI completa en `ai-service/`: main.py (middleware API Key, CORS), config.py (pydantic-settings), models.py (AnalyzeRequest/Response, ChatRequest/Response), requirements.txt.
3. **T-038**: Router `/analyze`: descarga evidencias de Storage, extrae texto PDF (pypdf), envía imágenes en base64 a Claude, guarda resultado en `ai_analysis_results`, notifica WhatsApp opcional.
4. **T-039**: Router `/chat`: chat contextualizado con contenido LMS, usa prompt configurado en Supabase.
5. **T-040**: `requestAiAnalysis()` en `deliverable-actions.ts` — llama servicio Python desde Server Action con permiso `objetivos.review`.
6. **T-041**: Página `/ia-verificacion` (log + KPIs + prompts), `AnalysisResultCard`, `PromptEditor`. Sidebar actualizado con sección IA.
7. **T-047**: `.env.example` documentado en Next.js y ai-service.

#### Archivos Creados/Modificados:
- `ai-service/`: main.py, config.py, models.py, requirements.txt, .env.example
- `ai-service/routers/`: analyze.py, chat.py
- `ai-service/services/`: supabase_client.py, storage.py, ai_client.py, whatsapp.py
- `web/supabase/migrations/20260322000040_create_ai_schema.sql`
- `web/src/app/(dashboard)/ia-verificacion/`: ia-actions.ts, page.tsx
- `web/src/components/ia/`: analysis-result-card.tsx, prompt-editor.tsx
- `web/src/app/(dashboard)/objetivos/deliverable-actions.ts`: +requestAiAnalysis
- `web/src/components/layout/app-sidebar.tsx`: +sección IA
- `web/.env.example`, `web/.env.local`: +PYTHON_AI_SERVICE_URL/KEY

#### Estado Actual:
| Fase | Estado |
|------|--------|
| FASE 0 — Roles y Usuarios (M0) | ✅ COMPLETA |
| FASE 1 — Objetivos (M1) | ✅ COMPLETA |
| FASE 2 — Dashboard y KPIs (M2) | ✅ COMPLETA |
| FASE 3 — Incentivos (M3) | ✅ COMPLETA |
| FASE 4 — Servicio Python de IA (M4) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 5 — Mentoring (M6) | ✅ COMPLETA (Claude Sonnet 4.6) - 2026-03-22 |
| FASE 6 — LMS (M7) | ⏳ Pendiente |

---

### Claude Sonnet 4.6 — Sesión 2026-03-22 (continuación — FASE 5)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar hasta FASE 5 completa
- **Decisión de agentes**: Trabajo directo (fix puntual de 1 función no usada)

#### Tareas Realizadas:
1. **T-043 fix — Eliminar `RatingStars` no usada** (Tools: Read, Edit)
   - Archivo: `web/src/app/(dashboard)/mentoring/[pairId]/page.tsx`
   - Removida función `RatingStars` (lines 18-26) nunca referenciada en JSX
2. **TypeScript check** — `npx tsc --noEmit` → 0 errores
3. **Next.js build** — exitoso, rutas `/mentoring` y `/mentoring/[pairId]` compiladas
4. **Actualización progreso.txt** — T-042 y T-043 ✅, FASE 5 COMPLETA

#### Archivos Modificados:
- `web/src/app/(dashboard)/mentoring/[pairId]/page.tsx`: eliminada `RatingStars` no usada
- `.specs/sistema-objetivos/progreso.txt`: FASE 5 registrada como completa
