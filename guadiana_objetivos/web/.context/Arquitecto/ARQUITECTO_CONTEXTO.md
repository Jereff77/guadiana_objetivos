# Contexto del Arquitecto - Proyecto Guadiana Objetivos

**Última actualización**: 2026-05-03
**Estado del módulo activo**: M8 - Repositorio de Procesos — COMPLETADO (sesión 2)

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
- Los mensajes para CC van numerados consecutivamente (formato: "NNN - ..."), cada mensaje lleva su propio número sin importar si es seguimiento de la misma tarea
- Los mensajes para CC van en bloque de código
- CC debe iniciar su respuesta final con "NNN - Implementación completada" (el número de la instrucción), no al inicio del proceso sino al presentar su respuesta de cierre
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
- **M8: Repositorio de Procesos (COMPLETADO — sesión 2)**

## Módulo M8 - Repositorio de Procesos

### Numeración de instrucciones
La última instrucción enviada a CC fue la **085**. La próxima será **086**.

### Estado
✅ Fase 1: Schema BD + CRUD + Control de acceso
✅ Fase 2: Pipeline + Embeddings + Relaciones automáticas
✅ Fase 3: Vista Obsidian (Lista + Grafo + /documentos/[id])
✅ Fase 4: Chat RAG con Claude Haiku
✅ Sesión 2: Reintentar + Edición inline + Streaming

### Features completadas en Sesión 2

**Botón Reintentar**
- retryDocument() en documento-actions.ts
- Limpia proc_document_chunks y proc_document_relations con admin client
- Resetea processing_status a 'pending', processing_error a null
- Invoca Edge Function igual que en upload
- Visible en document-card.tsx solo cuando processing_status === 'error'

**Edición inline + Re-procesamiento**
- updateDocumentContent() en documento-actions.ts
- Reemplaza archivo en Storage con upsert: true sobre mismo storage_path
- Limpia chunks y relaciones con admin client, resetea a pending, invoca Edge Function
- /documentos/[id]/page.tsx convertido a Client Component
- document-content.tsx: prop isEditing → textarea con contenido raw
- Botón "Editar" visible solo cuando processing_status === 'completed' y tiene permisos
- document-card.tsx: clickeable con router.push(), stopPropagation en DropdownMenuTrigger
- Ítem "Ver" siempre visible (eliminada condición access_type !== 'private')

**Streaming de respuesta en chat**
- Route Handler en src/app/api/documentos/chat/route.ts — pipe directo SSE de Anthropic
- prepareMessageContext() y saveAssistantMessage() en chat-actions.ts
- chat-conversation.tsx: ReadableStream, estados streamContent e isStreaming
- Burbuja: tres puntos animados → markdown progresivo al llegar primer token
- saveAssistantMessage() es fire-and-forget al terminar stream

### Lecciones Críticas del M8 (acumuladas)

1. **RLS + has_permission en WITH CHECK = impredecible**. SECURITY DEFINER + política blocked.
2. **"new row violates RLS" es engañoso** — puede ser camelCase, Storage, o tipo incorrecto.
3. **Google gemini-embedding-001** es el modelo actual. text-embedding-004 deprecado.
4. **Deno ≠ Node**. Edge Functions: solo fetch() directo, sin SDKs.
5. **requirePermission() retorna void**. Nunca capturar su retorno.
6. **has_permission RPC** usa `permission_key`, no `permission_name`.
7. **@xyflow/react v12**: `(props.data as unknown) as T`.
8. **Limpiar caché .next** resuelve muchos errores de webpack en desarrollo.
9. **service_role para búsqueda vectorial**: adminSupabase solo para proc_match_chunks.
10. **proc_match_chunks** retorna document_title vía JOIN interno.
11. **Sistema prompt del chat**: explícito sobre qué NO hacer, no solo qué hacer.
12. **Sidebar isActive**: verificar match exacto en groupItems antes de activar por startsWith.
13. **Server Actions no pueden devolver streams** — usar Route Handler para streaming.
14. **upsert: true en Storage** permite reemplazar archivo en el mismo storage_path.
15. **router.push() en Card en lugar de Link envolvente** — evita anchors anidados con DropdownMenuItem.
16. **Numeración de instrucciones**: cada mensaje a CC lleva su propio número consecutivo, sin excepción.

### Pendientes Post-M8

1. Pulir estilos visuales del grafo
2. Optimizar layout del grafo con dagre para muchos nodos
3. Botón "Reintentar" para documentos en estado error ✅ HECHO
4. Streaming de respuesta en el chat ✅ HECHO
5. Re-procesar documento ya completado ✅ HECHO
6. Lazy rendering del grafo para 100+ nodos

## Historial de Instrucciones

| Rango | Acción | Estado |
|-------|--------|--------|
| 001-019 | Setup inicial, PRD M8, Fase 1 | ✅ |
| 020-036 | Fase 3 Obsidian + status | ✅ |
| 037-050 | Fase 2 pipeline + PRD Fase 4 + inicio | ✅ |
| 051-067 | Fase 4 Chat RAG + bugs | ✅ |
| 068-070 | Botón Reintentar | ✅ |
| 071-077 | Edición inline + Re-procesamiento + fix navegación tarjeta | ✅ |
| 078 | Limpieza caché .next | ✅ |
| 079-084 | Streaming chat | ✅ |
| 085 | Actualización M8_DOCUMENTOS_STATUS.md | ✅ |

## Próxima Sesión

El M8 está completado con todas las mejoras. Pregunta al usuario qué módulo o mejora quiere abordar.

Si hay un ARQUITECTO_CONTEXTO.md disponible, el usuario lo pegará al inicio y retomamos sin preguntas.

## Cómo Usar Este Archivo

Al inicio de sesión, el usuario me pega este archivo y me dice qué pasó. Con eso retomo el liderazgo sin explicaciones adicionales.

Al cerrar sesión: actualizar este archivo y el M8_DOCUMENTOS_STATUS.md antes de cerrar CC.