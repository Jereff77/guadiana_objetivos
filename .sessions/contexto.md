# Contexto del Proyecto - Guadiana Checklists Web y App Flutter Inventarios

## Información de Sesión
- **IA Utilizada**: GPT-5.1 (Trae)
- **Fecha**: 2026-03-21
- **Herramientas**: Trae IDE, MCP Supabase `supaGuadianaObj`
- **Agentes Especializados Utilizados**: Ninguno
- **Rol**: Orquestador IA (web + mobile)

## Resumen del Proyecto
Aplicación web Next.js 14 para gestión de checklists de Guadiana y una app móvil Flutter para inventarios/auditorías conectadas al mismo Supabase.

- **Web**: Next.js 14 + TypeScript + Tailwind CSS + Shadcn/UI + Supabase (auth + database). Reside en `guadiana_objetivos/web/`.
- **Mobile (Inventarios / Checklists)**: Flutter + Supabase, apoyada en tablas `users`, `app_profiles`, `inventory_sessions`, `conteo_inventario`, `inventario`, `user_warehouses`, `sync_logs`, vistas `okcar_*`.

## Estado Actual del Proyecto

- ✅ Scaffold del proyecto Next.js creado manualmente (Claude Sonnet 4.6) [directo]

---

## Historial de Trabajo por IA

### Claude Sonnet 4.6 - Sesión 2026-03-20

#### Rol: Orquestador IA
- **Solicitud del usuario**: Crear proyecto Next.js 14+ completo con TypeScript y Tailwind CSS manualmente (sin `create-next-app`) en el directorio `web/`.
- **Análisis realizado**: Tarea de scaffolding puro — creación de archivos de configuración y estructura de directorios. No requiere agentes especializados, se ejecuta directamente con las herramientas de escritura de archivos.
- **Decisión de agentes**: Trabajo directo. No se requirió ningún agente especializado ya que es configuración estática conocida.

#### Tareas Realizadas:
1. **Verificación del directorio padre** (Herramientas: Bash)
   - Confirmado que `guadiana_objetivos/web/` no existía pero el padre sí.

2. **Creación de estructura de directorios** (Herramientas: Bash mkdir)
   - `src/app/(auth)/login/`
   - `src/app/(dashboard)/dashboard/`
   - `src/components/ui/`
   - `src/lib/`

3. **Creación de archivos raíz** (Herramientas: Write)
   - `package.json` — dependencias Next.js 14.2.29, Supabase, Shadcn/UI utils
   - `tsconfig.json` — strict mode + path alias `@/*`
   - `next.config.ts` — configuración mínima
   - `tailwind.config.ts` — colores corporativos `brand-blue: #004B8D`, `brand-orange: #FF8F1C` + variables CSS Shadcn
   - `postcss.config.mjs`
   - `.env.local` — con URL Supabase real y placeholder para anon key
   - `components.json` — configuración Shadcn/UI
   - `.gitignore` — estándar Next.js

4. **Creación de archivos `src/`** (Herramientas: Write)
   - `src/app/globals.css` — variables CSS Shadcn light/dark + @tailwind directives
   - `src/app/layout.tsx` — root layout con Inter font y metadata Guadiana
   - `src/app/page.tsx` — redirect a `/dashboard`
   - `src/app/(auth)/login/page.tsx` — login placeholder con colores corporativos
   - `src/app/(dashboard)/layout.tsx` — sidebar azul corporativo + área de contenido
   - `src/app/(dashboard)/dashboard/page.tsx` — dashboard placeholder con cards
   - `src/lib/utils.ts` — función `cn()` Shadcn
   - `src/middleware.ts` — placeholder con TODO T-104
   - `src/components/ui/.gitkeep`

#### Archivos Modificados/Creados:
- `web/package.json`: Dependencias completas del proyecto
- `web/tsconfig.json`: Configuración TypeScript con paths
- `web/next.config.ts`: Configuración Next.js base
- `web/tailwind.config.ts`: Colores corporativos Guadiana + tema Shadcn
- `web/postcss.config.mjs`: Plugin Tailwind
- `web/.env.local`: Variables Supabase
- `web/components.json`: Config Shadcn/UI
- `web/.gitignore`: Exclusiones estándar
- `web/src/app/globals.css`: Variables CSS Shadcn + Tailwind
- `web/src/app/layout.tsx`: Root layout Inter + metadata
- `web/src/app/page.tsx`: Redirect a /dashboard
- `web/src/app/(auth)/login/page.tsx`: Login placeholder
- `web/src/app/(dashboard)/layout.tsx`: Sidebar + main layout
- `web/src/app/(dashboard)/dashboard/page.tsx`: Dashboard placeholder
- `web/src/lib/utils.ts`: cn() utility
- `web/src/middleware.ts`: Auth middleware placeholder
- `web/src/components/ui/.gitkeep`: Carpeta Shadcn components

#### Próximos pasos sugeridos:
- Ejecutar `npm install` (o `bun install`) en `web/`
- Agregar la ANON KEY real de Supabase en `.env.local`
- Implementar autenticación Supabase (T-104)
- Instalar componentes Shadcn con `npx shadcn-ui@latest add`

---

### Claude Sonnet 4.6 – Sesión 2026-03-20 (continuación)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Encontrar la tarea de mayor prioridad, implementarla, corregir issues del panel de problemas, ejecutar verificaciones de tipo, actualizar progress.txt y confirmar cambios. Trabajar una tarea a la vez hasta completar Fase 3.
- **Análisis realizado**: Se confirmó que Fase 1 y Fase 2 están 100% completadas. La tarea de mayor prioridad es **T-301** (Fase 3). El cambio de estado (publish/archive/restore/delete) ya existía; faltaba el **versionamiento**.
- **Decisión de agentes**: Trabajo directo. Tarea de desarrollo puro con archivos ya leídos y contexto completo en la sesión.

#### Estado del Proyecto (actualizado)
- ✅ Fase 1 completa (T-101 a T-106) (Claude Sonnet 4.6) [directo]
- ✅ Fase 2 completa (T-201 a T-207) (Claude Sonnet 4.6) [directo]
- ✅ T-301: Flujo de publicación + versionamiento (Claude Sonnet 4.6) [directo]
- 🔄 T-302: Módulo de Asignaciones — PENDIENTE

#### Tareas Realizadas:
1. **Diagnóstico de estado del proyecto** (Herramientas: Glob, Bash, MCP Supabase)
   - Confirmadas tablas: `form_surveys`, `form_sections`, `form_questions`, `form_question_options`, `form_assignments`, `resp_survey_runs`, `resp_answers`
   - Confirmado RLS habilitado en todas las tablas de formularios
   - Confirmado TypeScript sin errores, Panel de Problemas IDE limpio

2. **T-301: Versionamiento implementado** (Herramientas: Edit, Write)
   - `actions.ts`: Nueva acción `createNewVersion` — copia profunda de survey (secciones → preguntas → opciones) con `version + 1` y `status = 'draft'`, redirige al editor de la nueva versión
   - `survey-actions-menu.tsx`: Opción "Crear nueva versión" para formularios con `status === 'published'`
   - `editor-client.tsx`: Botón "Crear nueva versión" en la barra superior para formularios publicados
   - `progress.txt`: Creado con estado de todas las fases

3. **Verificaciones** (Herramientas: Bash tsc, mcp__ide__getDiagnostics)
   - `tsc --noEmit`: Sin errores
   - Panel de Problemas IDE: Sin warnings ni críticos

#### Archivos Modificados/Creados:
- `web/src/app/(dashboard)/formularios/actions.ts`: Acción `createNewVersion` agregada
- `web/src/components/formularios/survey-actions-menu.tsx`: Opción "Crear nueva versión" para publicados
- `web/src/app/(dashboard)/formularios/[id]/editar/editor-client.tsx`: Botón "Crear nueva versión" para publicados
- `guadiana_objetivos/progress.txt`: Creado — estado de todas las fases

#### Próxima tarea:
- **T-302**: Módulo de Asignaciones — asignar formularios a sucursales, roles o usuarios, usando tabla `form_assignments` ya existente en Supabase

---

### Claude Sonnet 4.6 – Sesión 2026-03-20 (T-302/T-303)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con la siguiente tarea de mayor prioridad.
- **Análisis realizado**: T-302 (Asignaciones) y T-303 (Vigencia/Frecuencia) se implementaron juntos ya que T-303 es parte del formulario de T-302. Tabla `form_assignments` ya existía en Supabase con todos los campos necesarios.
- **Decisión de agentes**: Trabajo directo.

#### Estado del Proyecto (actualizado)
- ✅ T-302: Módulo de Asignaciones (Claude Sonnet 4.6) [directo]
- ✅ T-303: Selector de vigencia y frecuencia (Claude Sonnet 4.6) [directo]
- 🔄 T-304: Vista previa del formulario — PENDIENTE

#### Tareas Realizadas:
1. **4 archivos nuevos** (Herramientas: Write)
   - `src/app/(dashboard)/asignaciones/actions.ts`: createAssignment, toggleAssignment, deleteAssignment
   - `src/app/(dashboard)/asignaciones/page.tsx`: página server con fetch paralelo (assignments + surveys + profiles)
   - `src/components/asignaciones/create-assignment-dialog.tsx`: dialog con toggle Por rol / Usuario, frecuencia y fechas de vigencia
   - `src/components/asignaciones/assignments-table.tsx`: tabla con Badge activa/inactiva, dropdown acciones (activar/desactivar/eliminar + confirm)

2. **Verificaciones** (Herramientas: Bash tsc, mcp__ide__getDiagnostics)
   - `tsc --noEmit`: Sin errores
   - Panel de Problemas IDE: Sin warnings ni críticos

#### Archivos Creados:
- `web/src/app/(dashboard)/asignaciones/actions.ts`
- `web/src/app/(dashboard)/asignaciones/page.tsx`
- `web/src/components/asignaciones/create-assignment-dialog.tsx`
- `web/src/components/asignaciones/assignments-table.tsx`

#### Próxima tarea:
- **T-304**: Vista previa del formulario simulando la App Móvil

---

### Claude Sonnet 4.6 – Sesión 2026-03-20 (T-304)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con siguiente tarea.
- **Análisis realizado**: T-304 última tarea de Fase 3. Implementada como página separada con phone frame CSS.
- **Decisión de agentes**: Trabajo directo.

#### Estado del Proyecto (actualizado)
- ✅ **Fase 1 completa** (T-101 a T-106)
- ✅ **Fase 2 completa** (T-201 a T-207)
- ✅ **Fase 3 completa** (T-301 a T-304)
- ❌ Fase 4 pendiente (T-401 a T-404)
- ❌ Fase 5 pendiente (T-501 a T-504)

#### Tareas Realizadas:
1. **T-304: Vista previa** (Herramientas: Write, Edit)
   - `src/app/(dashboard)/formularios/[id]/vista-previa/page.tsx`: server component, misma lógica de fetch que el editor
   - `src/app/(dashboard)/formularios/[id]/vista-previa/preview-client.tsx`: phone frame CSS (375px), status bar, app header, renderizado por tipo (Boolean/SingleChoice/MultipleChoice/Text/Number/Date), botón Enviar naranja, disclaimer
   - `editor-client.tsx`: botón "Vista previa" con ícono Eye en barra superior del editor

2. **Verificaciones** (Herramientas: Bash tsc, mcp__ide__getDiagnostics)
   - Sin errores TypeScript ni warnings IDE

#### Archivos Modificados/Creados:
- `web/src/app/(dashboard)/formularios/[id]/vista-previa/page.tsx`: nuevo
- `web/src/app/(dashboard)/formularios/[id]/vista-previa/preview-client.tsx`: nuevo
- `web/src/app/(dashboard)/formularios/[id]/editar/editor-client.tsx`: botón Vista previa agregado

#### Resultado:
**FASE 3 COMPLETA AL 100%** — T-301, T-302, T-303, T-304 implementadas y confirmadas.

---

### Claude Sonnet 4.6 – Sesión 2026-03-20 (T-401 a T-404)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con siguiente tarea de mayor prioridad hasta completar Fase 4.
- **Análisis realizado**: Fase 4 tenía T-401 a T-404 pendientes. Se implementaron todas en esta sesión.
- **Decisión de agentes**: Trabajo directo.

#### Estado del Proyecto (actualizado)
- ✅ **Fase 1 completa** (T-101 a T-106)
- ✅ **Fase 2 completa** (T-201 a T-207)
- ✅ **Fase 3 completa** (T-301 a T-304)
- ✅ **Fase 4 completa** (T-401 a T-404) — completada en esta sesión
- ❌ Fase 5 pendiente (T-501 a T-504)

#### Tareas Realizadas:
1. **T-401: Visor de Ejecuciones** (Herramientas: Write)
   - `/resultados/page.tsx`: filtros GET (estado, desde, hasta), tabla con badge de estado, link a detalle
   - `/components/resultados/runs-table.tsx`: componente tabla con union type para form_surveys

2. **T-402: Vista Detalle de Ejecución** (Herramientas: Write)
   - `/resultados/[id]/page.tsx`: multi-join (run → answers → questions → sections → options → profile)
   - Componente AnswerValue polimórfico, "Acción a seguir" en naranja cuando existe comment

3. **T-403: Exportación CSV** (Herramientas: Write, Edit)
   - `/api/resultados/export/route.ts`: GET handler, CSV UTF-8 + BOM, columnas completas
   - Botón "Exportar CSV" con ícono Download en la lista de resultados
   - Fix TypeScript: `runSurveyName(run: { form_surveys: unknown })` con cast explícito

4. **T-404: Gráficas KPIs** (Herramientas: Write, Bash)
   - `/resultados/estadisticas/page.tsx`: server component con agregaciones JS (no SQL)
   - `/components/resultados/kpi-charts.tsx`: componentes recharts 'use client' (FormCompletionChart, WeeklyTrendChart, BranchComplianceChart, KpiCard)
   - Color semáforo: azul ≥80%, naranja ≥50%, rojo <50%
   - Instalación de recharts via npm

5. **Recuperación de contraseña** (sesión anterior)
   - `/forgot-password/`: acción + página con estado sent
   - `/auth/reset-password/`: acción + página con toggle visibilidad
   - `/auth/callback/`: PKCE handler
   - Supabase URL y ANON_KEY reales configurados en `.env.local`

#### Errores Encontrados y Soluciones:
- **TS2339 form_surveys**: Supabase infiere FK join como array, pero en runtime puede ser objeto. Solución: union type + Array.isArray() guard
- **TS2322 recharts Tooltip formatter**: Parámetros tipados como `ValueType | undefined`, no `number`. Solución: quitar anotación de tipo explícita
- **Supabase URL incorrecta**: Usé `get_project_url` MCP para confirmar URL correcta (`mhdswebflviruafdlkvb.supabase.co`)

#### Archivos Creados/Modificados:
- `web/src/app/(dashboard)/resultados/page.tsx`
- `web/src/components/resultados/runs-table.tsx`
- `web/src/app/(dashboard)/resultados/[id]/page.tsx`
- `web/src/app/api/resultados/export/route.ts`
- `web/src/app/(dashboard)/resultados/estadisticas/page.tsx`
- `web/src/components/resultados/kpi-charts.tsx`
- `web/package.json` + `package-lock.json` (recharts)
- `guadiana_objetivos/progress.txt` (Fase 4 completada al 100%)

#### Resultado:
**FASE 4 COMPLETA AL 100%** — T-401, T-402, T-403, T-404 implementadas y confirmadas sin errores TypeScript.
Próxima fase: **Fase 5** (T-501 a T-504) — Pruebas, optimización, auditoría RLS y despliegue.

---

### Claude Sonnet 4.6 – Sesión 2026-03-20 (T-501 a T-504 – Fase 5 completa)

#### Rol: Orquestador IA
- **Solicitud del usuario**: Continuar con la siguiente tarea de mayor prioridad (Fase 5) hasta completar el PRD.
- **Análisis realizado**: Las 4 tareas de Fase 5 fueron implementadas secuencialmente. T-501 requería infraestructura de testing (Jest), T-502 era mejoras al build, T-503 requería consulta a Supabase via MCP para auditoría real, T-504 era documentación.
- **Decisión de agentes**: Trabajo directo en todas las tareas.

#### Estado del Proyecto (FINAL)
- ✅ **Fase 1 completa** (T-101 a T-106)
- ✅ **Fase 2 completa** (T-201 a T-207)
- ✅ **Fase 3 completa** (T-301 a T-304)
- ✅ **Fase 4 completa** (T-401 a T-404)
- ✅ **Fase 5 completa** (T-501 a T-504)
- 🎉 **MVP COMPLETO AL 100%**

#### Tareas Realizadas:

1. **T-501: Pruebas de integración** (Jest + Testing Library)
   - jest.config.ts, jest.setup.ts, @types/jest en tsconfig
   - 4 suites / 37 tests / 0 fallos
   - Archivos: src/lib/__tests__/utils.test.ts, supabase-client.test.ts, src/__tests__/csv-helpers.test.ts, src/components/resultados/__tests__/runs-table.test.tsx

2. **T-502: Optimización rendimiento y SEO**
   - next.config.ts: output standalone, security headers HTTP, caché assets estáticos, avif/webp
   - Metadata SEO en root layout (title template, robots noindex, viewport themeColor #004B8D)
   - generateMetadata estática en 5 páginas, dinámica en /formularios/[id]/editar y /resultados/[id]
   - Fix ESLint: <a> → <Link> en resultados/page.tsx
   - Build producción: 0 errores, 0 warnings, 14 rutas

3. **T-503: Auditoría RLS**
   - Bug encontrado y corregido: app_profiles sin política SELECT para admin_global
   - Migración aplicada: rls_fix_app_profiles_admin_select (2 nuevas políticas)
   - Reporte generado: Specs/rls-audit-report.md

4. **T-504: Despliegue y capacitación**
   - Specs/deployment-guide.md: proceso Hostinger Node.js + PM2, script deploy.sh
   - Guía de capacitación para módulos Formularios, Asignaciones y Resultados

#### Archivos Creados/Modificados:
- `web/jest.config.ts`, `web/jest.setup.ts`
- `web/src/lib/__tests__/utils.test.ts`, `supabase-client.test.ts`
- `web/src/__tests__/csv-helpers.test.ts`
- `web/src/components/resultados/__tests__/runs-table.test.tsx`
- `web/next.config.ts` (standalone + headers + imágenes)
- `web/src/app/layout.tsx` (metadata SEO completa)
- 7 páginas del dashboard (metadata estática/dinámica)
- `Specs/rls-audit-report.md`
- `Specs/deployment-guide.md`
- `Specs/web-development-tasks.md` (todas las tareas marcadas ✓)
- `Specs/progreso.txt` (Fase 5 completa)
- `progress.txt` (Fase 5 ✅ 100%)

#### Resultado:
**MVP COMPLETO AL 100%** — Las 5 fases y las 24 tareas del PRD están implementadas, probadas y documentadas.

---

### Claude Sonnet 4.6 - Sesión 2026-03-22

#### Rol: Orquestador IA
- **Solicitud del usuario**: Corregir el sidebar — el módulo "Procesos" debe mostrarse como ítem padre y al hacer hover desplegarse con las opciones (Dashboard, Formularios, Asignaciones, Resultados).
- **Análisis realizado**: El sidebar usaba ítems planos bajo un `SidebarGroupLabel`. Se rediseñó para usar `Collapsible` + `SidebarMenuSub` con control de hover mediante `useRef` y `setTimeout`.
- **Decisión de agentes**: Trabajo directo. Cambio localizado en un solo componente UI.

#### Tareas Realizadas:
1. **Análisis del sidebar existente** (Herramientas: Read, Glob)
   - Identificados los componentes `sidebar.tsx` (shadcn) y `app-sidebar.tsx` (implementación)
   - Confirmada existencia de `collapsible.tsx` y componentes `SidebarMenuSub*`

2. **Generación de especificación** (Herramientas: Write)
   - Creado `.specs/sidebar-procesos-hover/tasks.md` con 4 tareas detalladas
   - Creado `.specs/sidebar-procesos-hover/progreso.txt`

3. **Implementación [T-001 a T-003]** (Herramientas: Write)
   - Nuevos imports: `useState`, `useEffect`, `useRef`, `FolderOpen`, `ChevronDown`, `Collapsible`, `CollapsibleContent`, `SidebarMenuSub*`
   - Lógica hover con delay 150ms para evitar cierre accidental al mover mouse entre trigger y submenú
   - `useEffect` sincroniza estado cuando la ruta activa pertenece al módulo
   - JSX reemplazado con estructura `Collapsible` + `SidebarMenuSub`

4. **Verificación [T-004]** (Herramientas: Bash)
   - TypeScript: 0 errores (`tsc --noEmit`)
   - ESLint: 0 warnings ni errores (`next lint`)

#### Archivos Modificados/Creados:
- `guadiana_objetivos/web/src/components/layout/app-sidebar.tsx`: Rediseño completo del módulo Procesos
- `guadiana_objetivos/.specs/sidebar-procesos-hover/tasks.md`: Especificación de tareas
- `guadiana_objetivos/.specs/sidebar-procesos-hover/progreso.txt`: Registro de progreso

#### Estado:
✅ Sidebar corregido — módulo Procesos con submenú hover (Claude Sonnet 4.6) [directo]
