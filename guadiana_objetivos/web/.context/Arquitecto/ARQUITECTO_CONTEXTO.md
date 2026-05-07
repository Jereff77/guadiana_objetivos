# Contexto del Arquitecto - Proyecto Guadiana Objetivos

**Última actualización**: 2026-05-07
**Estado del módulo activo**: M9 - Taller de Interdependencia — COMPLETADO con pendientes

## Mi Rol en Este Proyecto

Soy el cerebro técnico entre el usuario y Claude Code (CC). El usuario hace de puente:
1. CC propone un plan
2. El usuario me lo trae
3. Yo analizo, corrijo y doy al usuario el mensaje exacto para CC
4. El usuario lo pega a CC y me trae la respuesta
5. Yo valido antes de continuar

**Reglas de mi trabajo**:
- Nunca apruebo sin ver el plan primero
- Exijo aprobación entre fases
- Los mensajes para CC van numerados consecutivamente, cada mensaje lleva su propio número
- Los mensajes para CC van en bloque de código
- Comunicación siempre en español
- BD en producción: nunca modificar datos sin autorización explícita

## Proyecto: Guadiana Objetivos

### Stack Principal
- Next.js 15 App Router + React 18 + TypeScript 5
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Tailwind CSS + Shadcn/UI + Radix UI
- Docker multi-stage para deploy en Hostinger
- @xyflow/react (editor visual de flujo y organigrama)
- Recharts para gráficas

### Módulos Completados
- M1: Objetivos (entregables, evidencias, revisión)
- M2: Dashboard ejecutivo con KPIs
- M3: Incentivos (esquemas, tiers, cálculo)
- M5: Chat interno (Realtime, grupos, archivos)
- M6: Mentoring
- M7: LMS (cursos, temario, progreso)
- Organigrama (canvas interactivo, singleton Dirección)
- Formularios (editor visual, flujo condicional)
- M8: Repositorio de Procesos (COMPLETADO)
- M9: Taller de Interdependencia (COMPLETADO con pendientes menores)

## Módulo M9 - Taller de Interdependencia

### Numeración de instrucciones
La última instrucción enviada a CC fue la **103**. La próxima será **104**.

### Estado
✅ Fase 1: Schema BD + permisos + Server Actions
✅ Fase 2: UI formulario + TallerView + botón en Objetivos + sidebar + layout
⚠️  Pendiente menor: botón Taller usa override temporal (ver P1 abajo)

### Archivos del módulo
- `supabase/migrations/20260507000001_create_taller_decisiones.sql`
- `src/app/(dashboard)/taller/taller-actions.ts`
- `src/app/(dashboard)/taller/taller-types.ts` (tipos/constantes separados del 'use server')
- `src/app/(dashboard)/taller/[userId]/page.tsx`
- `src/components/taller/taller-form.tsx`
- `src/components/taller/taller-view.tsx`
- `src/app/error.tsx` (fix build Next.js 15 standalone)
- `next.config.ts` (outputFileTracingRoot fix)

### Archivos modificados en Fase 2
- `src/app/(dashboard)/objetivos/[deptId]/page.tsx` (query tallerFillUserIds)
- `src/components/objetivos/dept-users-view.tsx` (botón Taller en UserCard)
- `src/components/layout/app-sidebar.tsx` (ítem "Mi Taller" + prop userId)
- `src/app/(dashboard)/layout.tsx` (pasa userId al AppSidebar)

### Decisiones técnicas críticas M9
1. `taller-types.ts` separado: Next.js prohíbe exportar no-funciones desde archivos 'use server'. Tipos y constantes viven en `taller-types.ts`, re-exportados desde `taller-actions.ts` para compatibilidad.
2. `fecha_creacion` omitida en upsert para preservarla en updates
3. `adminSupabase` para queries de permisos en `[deptId]/page.tsx` (bypass RLS)
4. Validación en `saveTallerData`: solo longitud del array (10), no contenido por fila
5. `outputFileTracingRoot` en `next.config.ts` apunta al directorio padre de `web/`
6. `error.tsx` creado para forzar generación de `500.html` en output standalone
7. Dropdowns de `quien_decide` y `consulta_a` guardan UUID del usuario (no full_name). `TallerView` resuelve UUID → nombre con `getUserName(users, id)`.

### Arquitectura de acceso
- `/taller/[userId]`: edición si `userId === currentUser` + `taller_fill`
- `/taller/[userId]`: solo lectura si `taller_view_all`
- Botón "Taller" en `UserCard`: actualmente override `true` para todos (ver P1)
- `tallerFillUserIds` se calcula en 3 pasos: module_id → role_ids + root_roles → profiles

## ⚠️ Pendientes M9 para próxima sesión

### P1 — Botón Taller: lógica de permisos desactivada (PRIORIDAD ALTA)
**Archivo**: `src/components/objetivos/dept-users-view.tsx` ~línea 120
**Estado actual**: `showTallerBtn: (_u) => true` (hardcoded, buscar comentario "force override")
**Comportamiento correcto**: `showTallerBtn: (u) => tallerFillUserIds.includes(u.userId)`
**Diagnóstico**: El servidor calcula `tallerFillUserIds` correctamente (logs confirmados).
Monica Campos ID `3ea17d09-...` aparece en ambos arrays (tallerFillUserIds y dept userIds)
pero el Client Component no renderizaba el botón. Causa raíz no determinada.
**Siguiente paso**: agregar `console.log('[CLIENT]', tallerFillUserIds)` en el browser
(DevTools → Console) para ver si el prop llega correcto al Client Component.

### P2 — Dead code en taller-view.tsx
**Archivo**: `src/components/taller/taller-view.tsx` líneas 21-22
`const userMap = new Map<string, string>()` declarado pero nunca usado. Eliminar.

### P3 — Double permission check en taller/[userId]/page.tsx
`canFill` se verifica dentro del `if (isOwn)` block (scope limitado) y se re-verifica
en `const canEdit = isOwn && (await checkPermission('taller_fill'))`. Una llamada de más.
Refactorizar para reusar la variable.

## Lecciones críticas M8+M9 (vigentes)
1. RLS + has_permission en WITH CHECK = impredecible. SECURITY DEFINER + política blocked.
2. "new row violates RLS" es engañoso — puede ser camelCase, Storage, o tipo incorrecto.
3. `requirePermission()` retorna void. Nunca capturar su retorno.
4. `has_permission` RPC usa `permission_key`, no `permission_name`.
5. Server Actions no pueden devolver streams — usar Route Handler.
6. `adminSupabase` solo para operaciones que requieren bypass de RLS.
7. `.eq('tabla_relacionada.columna', valor)` sobre join `!inner` NO filtra correctamente en el cliente JS de Supabase. Hacer la query en dos pasos separados.
8. Next.js prohíbe exportar no-funciones desde archivos con `'use server'`. Separar tipos/constantes a archivo propio.

## Historial de instrucciones M9

| Instrucción | Acción | Estado |
|---|---|---|
| 086 | Plan M9 (revisión) | ✅ |
| 087 | Fase 1: migración + actions | ✅ |
| 088 | Fix caché build | ✅ |
| 089 | Fix outputFileTracingRoot | ✅ |
| 090 | Fix error.tsx (500.html) | ✅ |
| 091-092 | Lectura archivos objetivos | ✅ |
| 094 | Actualización M9_TALLER_STATUS.md | ✅ |
| 095-096 | Fase 2: UI completa + integraciones | ✅ |
| 097 | Diagnóstico quién_decide UUID vs name | ✅ |
| 098 | Fix query tallerFillUserIds (join→2 pasos + root users) | ✅ |
| 099-101 | Logs de diagnóstico (eliminados en 103) | ✅ |
| 102 | Override showTallerBtn = true (temporal) | ✅ |
| 103 | Limpieza logs + documentación pendientes | ✅ |

## Próxima sesión
- Resolver P1: botón Taller con lógica real de permisos
- Luego iniciar el siguiente módulo según prioridad del usuario

## Cómo Usar Este Archivo
Al inicio de sesión, el usuario me pega este archivo y me dice qué pasó. Con eso retomo el liderazgo sin explicaciones adicionales.
