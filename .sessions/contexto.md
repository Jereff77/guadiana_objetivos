# Contexto del Proyecto - Guadiana Checklists Web

## Información de Sesión
- **IA Utilizada**: Claude Sonnet 4.6
- **Fecha**: 2026-03-20
- **Herramientas**: Claude Code CLI
- **Agentes Especializados Utilizados**: Ninguno
- **Rol**: Orquestador IA

## Resumen del Proyecto
Aplicación web Next.js 14 para gestión de checklists de Guadiana. Stack: Next.js 14 + TypeScript + Tailwind CSS v3 + Shadcn/UI + Supabase (auth + database). Desplegado en Hostinger Node.js con output standalone. El proyecto web reside en `guadiana_objetivos/web/`.

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
