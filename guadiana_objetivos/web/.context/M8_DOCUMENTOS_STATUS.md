# M8 - Repositorio de Procesos - Estado del Desarrollo

**Última actualización**: 2026-05-03
**Última instrucción Arquitecto**: 085
**Fase actual**: MÓDULO COMPLETADO - Todas las fases implementadas y validadas
**Stack del módulo**: Next.js 15 + Supabase + pgvector + @xyflow/react + Edge Functions Deno + Google gemini-embedding-001 + Claude Haiku

## Propósito del Módulo

Repositorio centralizado de documentos empresariales (manuales, políticas, procedimientos) con:
- Subida y gestión con control de acceso granular por roles
- Procesamiento automático: extracción, sanitización, chunking, vectorización
- Visualización estilo Obsidian: lista + grafo interactivo de relaciones
- Chat con IA usando los documentos como única fuente de verdad

## Estado por Fase

### ✅ Fase 1 - Schema BD + Storage + CRUD + Control de Acceso
**Estado**: COMPLETADA

Implementado:
- ✅ 6 tablas con prefijo proc_
- ✅ Bucket privado process-documents con políticas RLS
- ✅ Función SECURITY DEFINER proc_create_document() para INSERTs
- ✅ Server Actions de CRUD
- ✅ Control de acceso public/private/roles
- ✅ Item de navegación en sidebar bajo "Comunicación"
- ✅ Diálogo de subida con validación
- ✅ Lista de documentos con filtros

Archivos creados:
- web/supabase/migrations/20260502000001_create_process_documents_schema.sql
- web/src/app/(dashboard)/documentos/page.tsx
- web/src/app/(dashboard)/documentos/documento-actions.ts
- web/src/components/documentos/upload-document-dialog.tsx
- web/src/components/documentos/documents-list.tsx
- web/src/components/documentos/document-card.tsx

Archivos modificados:
- web/src/components/layout/app-sidebar.tsx

### ✅ Fase 2 - Pipeline de Procesamiento
**Estado**: COMPLETADA

Implementado:
- ✅ Edge Function process-document desplegada en Deno runtime
- ✅ Extracción de texto UTF-8 con sanitización
- ✅ Detección de enlaces manuales [[...]]
- ✅ Chunking inteligente (500 tokens ± 50 overlap)
- ✅ Vectorización con Google gemini-embedding-001 (768 dimensiones)
- ✅ Detección de relaciones automáticas por similitud (umbral 0.75)
- ✅ Polling centralizado cada 5s en frontend
- ✅ Manejo de errores con cleanup de chunks parciales

Archivos creados:
- web/supabase/migrations/20260502000003_create_proc_match_chunks_function.sql
- web/supabase/functions/process-document/index.ts
- web/supabase/functions/process-document/deno.json
- web/supabase/functions/process-document/lib/extract-text.ts
- web/supabase/functions/process-document/lib/detect-links.ts
- web/supabase/functions/process-document/lib/chunker.ts
- web/supabase/functions/process-document/lib/embeddings.ts
- web/supabase/functions/process-document/lib/similarity.ts
- web/src/app/(dashboard)/documentos/process-actions.ts

Archivos modificados:
- web/src/app/(dashboard)/documentos/documento-actions.ts (invocación a Edge Function)
- web/src/components/documentos/documents-list.tsx (polling con router.refresh)

### ✅ Fase 3 - Vista Estilo Obsidian
**Estado**: COMPLETADA

Implementado:
- ✅ Tabs Lista/Grafo compartiendo filtros en /documentos
- ✅ Grafo interactivo con @xyflow/react v12
- ✅ Nodos personalizados con color por categoría, tamaño por word_count
- ✅ Aristas diferenciadas (manuales sólidas azul #194D95 vs automáticas punteadas grises)
- ✅ Grosor de aristas según similarity_score (<0.6: 1px, 0.6-0.8: 2px, >0.8: 3px)
- ✅ Panel lateral Sheet con detalles del documento al click
- ✅ Doble click en nodo navega a /documentos/[id]
- ✅ Filtros funcionando (búsqueda, categoría, acceso, tipo de relación)
- ✅ Layout automático del grafo (posicionamiento circular)
- ✅ Route /documentos/[id] para ver contenido completo
- ✅ Renderizado de markdown con react-markdown + remarkGfm
- ✅ Enlaces [[Título]] convertidos a búsqueda por título

Archivos creados:
- web/src/app/(dashboard)/documentos/[id]/page.tsx
- web/src/app/(dashboard)/documentos/[id]/document-content.tsx
- web/src/app/(dashboard)/documentos/graph-actions.ts
- web/src/components/documentos/documents-graph.tsx
- web/src/components/documentos/document-node.tsx
- web/src/components/documentos/document-detail-panel.tsx
- web/src/components/documentos/documents-tabs.tsx

Archivos modificados:
- web/src/app/(dashboard)/documentos/page.tsx
- web/src/app/(dashboard)/documentos/documento-actions.ts (agregado getDocumentById)
- web/src/components/documentos/documents-list.tsx (filtros como props)

### ✅ Fase 4 - Chat RAG con Claude Haiku
**Estado**: COMPLETADA

Implementado:
- ✅ Layout de dos paneles (/documentos/chat) con scroll interno correcto
- ✅ Panel izquierdo con lista de sesiones y botón "Nueva conversación"
- ✅ Panel derecho con pantalla de bienvenida y 3 preguntas sugeridas
- ✅ Input con auto-resize, Enter envía, Shift+Enter nueva línea
- ✅ Mensajes user (azul #194D95) y assistant (gris claro)
- ✅ Sesiones con memoria conversacional por usuario
- ✅ Búsqueda vectorial con proc_match_chunks (service_role para bypasear RLS)
- ✅ Claude Haiku responde con contexto real de documentos
- ✅ Badges de fuentes clickeables con títulos correctos
- ✅ react-markdown para renderizar respuestas del asistente
- ✅ Sistema prompt restrictivo (no inventa, no da consejos fuera de rol)
- ✅ Mensaje del usuario aparece inmediatamente sin esperar respuesta
- ✅ Creación y listado de sesiones funcionando
- ✅ Permiso documentos.chat asignado al rol root en BD
- ✅ Sub-item "Chat" en sidebar bajo "Documentos"
- ✅ Botón "Chat de documentos" en página principal /documentos
- ✅ Sidebar sin doble highlight en items de Documentos
- ✅ Build pasa sin errores

Archivos creados:
- web/src/app/(dashboard)/documentos/chat/page.tsx
- web/src/app/(dashboard)/documentos/chat/chat-actions.ts
- web/src/components/documentos/chat-session-list.tsx
- web/src/components/documentos/chat-conversation.tsx
- web/src/components/documentos/chat-message.tsx
- web/src/components/documentos/chat-input.tsx

Archivos modificados:
- web/src/app/(dashboard)/documentos/page.tsx (botón Chat)
- web/src/components/layout/app-sidebar.tsx (sub-item Chat + fix doble highlight)

## Arquitectura Actual

### Estructura de directorios

```
web/
├── src/
│   ├── app/(dashboard)/documentos/
│   │   ├── page.tsx                    # Página principal con tabs Lista/Grafo + botón Chat
│   │   ├── documento-actions.ts        # Server Actions CRUD + retryDocument + updateDocumentContent
│   │   ├── process-actions.ts          # Server Action invoca Edge Function
│   │   ├── graph-actions.ts            # Server Action getDocumentsGraph()
│   │   ├── [id]/
│   │   │   ├── page.tsx                # Ruta documento individual (Client Component con edición)
│   │   │   └── document-content.tsx    # Client Component renderiza/edita markdown
│   │   └── chat/
│   │       ├── page.tsx                # Página chat (layout dos paneles)
│   │       └── chat-actions.ts         # Server Actions + prepareMessageContext + saveAssistantMessage
│   ├── app/api/documentos/
│   │   └── chat/
│   │       └── route.ts               # Route Handler streaming SSE a Anthropic
│   └── components/documentos/
│       ├── documents-list.tsx          # Lista con polling
│       ├── document-card.tsx           # Tarjeta individual
│       ├── upload-document-dialog.tsx  # Diálogo de subida
│       ├── documents-tabs.tsx          # Wrapper tabs Lista/Grafo
│       ├── documents-graph.tsx         # Canvas principal del grafo
│       ├── document-node.tsx           # Nodo personalizado @xyflow
│       ├── document-detail-panel.tsx   # Panel lateral Sheet
│       ├── chat-session-list.tsx       # Lista de sesiones del chat
│       ├── chat-conversation.tsx       # Conversación activa
│       ├── chat-message.tsx            # Mensaje individual con fuentes
│       └── chat-input.tsx              # Input con auto-resize
└── supabase/
    ├── migrations/
    │   ├── 20260502000001_create_process_documents_schema.sql
    │   └── 20260502000003_create_proc_match_chunks_function.sql
    └── functions/process-document/
        ├── index.ts
        ├── deno.json
        └── lib/
            ├── extract-text.ts
            ├── detect-links.ts
            ├── chunker.ts
            ├── embeddings.ts
            └── similarity.ts
```

## Capa de datos (Supabase)

### Tablas

**proc_categories**
- id UUID PK, name TEXT UNIQUE, color_hex TEXT DEFAULT '#6366f1', icon TEXT, created_at TIMESTAMPTZ

**proc_documents**
- id UUID PK, title TEXT NOT NULL, description TEXT, storage_path TEXT NOT NULL
- file_type TEXT CHECK IN ('txt', 'md'), file_size INTEGER
- category_id UUID FK proc_categories, uploaded_by UUID FK profiles
- access_type TEXT CHECK IN ('public', 'private', 'roles'), allowed_roles UUID[]
- processing_status TEXT CHECK IN ('pending', 'processing', 'completed', 'error')
- processing_error TEXT, word_count INTEGER, tags TEXT[]
- created_at, updated_at TIMESTAMPTZ

**proc_document_chunks**
- id UUID PK, document_id UUID FK proc_documents (CASCADE)
- chunk_index INTEGER, content TEXT, embedding vector(768), token_count INTEGER, created_at TIMESTAMPTZ

**proc_document_relations**
- id UUID PK, source_doc_id UUID FK (CASCADE), target_doc_id UUID FK (CASCADE)
- relation_type TEXT CHECK IN ('manual', 'automatic'), similarity_score NUMERIC(5,4)
- created_at TIMESTAMPTZ, UNIQUE (source_doc_id, target_doc_id)

**proc_chat_sessions**
- id UUID PK, user_id UUID FK profiles (CASCADE), title TEXT
- created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ

**proc_chat_messages**
- id UUID PK, session_id UUID FK proc_chat_sessions (CASCADE)
- role TEXT CHECK IN ('user', 'assistant'), content TEXT
- sources JSONB DEFAULT '[]', created_at TIMESTAMPTZ

### Funciones RPC

**proc_create_document(p_title, p_description, p_storage_path, p_file_type, p_file_size, p_category_id, p_access_type TEXT, p_allowed_roles TEXT[], p_tags TEXT[])**
- Returns: proc_documents
- SECURITY DEFINER, SET search_path = public, auth
- Castea p_allowed_roles TEXT[] → UUID[] internamente
- Valida is_root() o has_permission('documentos.upload')
- ⚠️ INSERTs SOLO vía esta función. La política documents_insert_blocked bloquea INSERTs directos.

**proc_match_chunks(p_embedding vector(768), p_exclude_document_id UUID, p_match_count INTEGER DEFAULT 5, p_min_similarity FLOAT DEFAULT 0.5)**
- Returns: TABLE(chunk_id UUID, document_id UUID, document_title TEXT, content TEXT, similarity FLOAT)
- STABLE SECURITY DEFINER, usa operador <=> de pgvector (cosine distance)
- Hace JOIN con proc_documents para retornar document_title en la misma query

### Políticas RLS

**proc_documents**:
- documents_select: access_type='public' OR (private AND uploaded_by=auth.uid()) OR (roles AND role en allowed_roles) OR is_root inline
- documents_insert_blocked: WITH CHECK false (todos INSERTs via proc_create_document)
- documents_update/delete: uploaded_by=auth.uid() OR has_permission('documentos.manage') OR is_root inline

**proc_document_chunks**: SELECT si usuario puede acceder al documento padre

**proc_document_relations**: SELECT si usuario puede acceder al source_doc_id

**proc_chat_sessions/proc_chat_messages**: ALL solo el dueño (user_id = auth.uid())

### Storage

Bucket process-documents (privado):
- Tamaño máx: 10MB, Tipos: text/plain, text/markdown, text/x-markdown, application/octet-stream
- 4 políticas RLS para INSERT, SELECT, UPDATE, DELETE basadas en has_permission y is_root inline

### Permisos en platform_modules

- documentos.view - Ver repositorio de documentos
- documentos.upload - Subir documentos
- documentos.manage - Gestionar repositorio completo
- documentos.chat - Usar chat de documentos (asignado al rol root vía role_permissions)

## Decisiones Técnicas Tomadas

1. **INSERTs vía SECURITY DEFINER, no RLS directa**
   La política RLS con funciones complejas en WITH CHECK tuvo comportamiento errático. Cambiamos a documents_insert_blocked + proc_create_document() SECURITY DEFINER.
   NO REVERTIR.

2. **Funciones SECURITY DEFINER con SET search_path = public, auth**
   Sin search_path explícito hay problemas de resolución de schema en algunos contextos.
   Aplicar siempre en nuevas SECURITY DEFINER.

3. **Embeddings: Google gemini-embedding-001 (NO text-embedding-004)**
   text-embedding-004 deprecado en 2026. Usar gemini-embedding-001 con outputDimensionality: 768.
   NO cambiar sin discutir.

4. **Edge Functions en Deno, NO Node**
   Runtime nativo de Supabase Functions. NO usar SDKs de Node. Usar fetch() directo a API REST.

5. **Solo formatos .txt y .md**
   Decisión del cliente. No agregar PDF/DOCX sin discutir.

6. **Token counting: 4 chars = 1 token**
   No hay tiktoken en Deno. Aproximación válida para español.

7. **Polling centralizado cada 5s en documents-list, NO en cada card**
   1 request cada 5s vs N requests. Usa router.refresh().

8. **Posiciones del grafo NO se persisten en BD**
   Layout circular calculado en cliente al cargar.

9. **EdgeRuntime.waitUntil() ANTES del return**
   Si va después, la función retornó y waitUntil nunca se ejecuta.

10. **snake_case en interfaces de Server Actions**
    Consistencia con schema BD. access_type no accessType.

11. **Layout del grafo: algoritmo circular (cos/sin) en cliente**
    Simple y funcional. Optimizar con dagre en fase futura si se necesita.

12. **Filtros del grafo sobre filteredDocuments**
    Nodos filtrados se eliminan completamente. Aristas también filtradas.

13. **@xyflow/react v12: aserción de tipo para nodos**
    (props.data as unknown) as DocumentNodeData. NO usar NodeProps<T>.

14. **Chat RAG: fetch directo a Anthropic API (NO SDK)**
    Igual que Google embeddings, fetch directo con header x-api-key.
    Endpoint: https://api.anthropic.com/v1/messages
    Header: anthropic-version: 2023-06-01

15. **service_role para búsqueda vectorial en chat**
    La búsqueda de chunks usa cliente admin (createAdminClient con SUPABASE_SERVICE_ROLE_KEY) para bypasear RLS.
    Las demás operaciones (validar permisos, guardar mensajes, obtener historial) usan el cliente normal del usuario.
    NO usar service_role para operaciones que deben respetar permisos del usuario.

16. **proc_match_chunks retorna document_title vía JOIN**
    Más eficiente que hacer segunda query desde Node.js después de obtener los chunks.
    El JOIN con proc_documents está dentro de la función SQL SECURITY DEFINER.

## Bugs Corregidos

1. **Import next/headers en Client Component** → Permisos como props desde Server padre

2. **MIME type rechazado** → Validar por extensión del filename

3. **Doble extensión .md.md** → Sanitizar file.name sin concatenar extensión

4. **camelCase vs snake_case en upload** → Alinear frontend/backend (access_type)

5. **TEXT[] vs UUID[] en allowed_roles** → Casteo en proc_create_document

6. **Columna profiles.name inexistente** → Usar profiles.full_name

7. **Google API 404 text-embedding-004** → Usar gemini-embedding-001

8. **waitUntil() después de return** → waitUntil() ANTES del return

9. **Nodos del grafo invisibles** → Opacidad 30% solo cuando HAY selección activa Y nodo no seleccionado

10. **Filtros sin efecto en Grafo** → Map sobre filteredDocuments no initialDocuments

11. **SelectItem value="" error Radix** → value="all", tratar "all" como null

12. **24 errores TypeScript NodeProps<T>** → (props.data as unknown) as DocumentNodeData

13. **requirePermission() retorna void, no boolean**
    Causa: chat/page.tsx hacía `const hasPermission = await requirePermission(...)` y evaluaba `if (!hasPermission)` que siempre era true porque void es falsy.
    Solución: Solo `await requirePermission('documentos.chat')`. La función ya hace redirect internamente.

14. **Import duplicado en chat-conversation.tsx**
    Causa: useEffect, useState, useRef importados de 'next/navigation' en lugar de 'react'.
    Solución: `import { useEffect, useState, useRef } from 'react'`

15. **RPC has_permission con nombre de parámetro incorrecto en chat-actions.ts**
    Causa: CC usó `permission_name` como nombre del parámetro.
    Solución: El parámetro correcto es `permission_key`.
    `supabase.rpc('has_permission', { permission_key: 'documentos.chat' })`

16. **sendMessage lanzaba excepción no serializable**
    Causa: El objeto de retorno contenía valores con tipos no garantizados (possible non-string de Anthropic API).
    Solución: Forzar `String()` en `content` y en cada campo de `sources` antes de retornar.
    `content: String(assistantResponse || '')` y `sources: sourcesArray.map(s => ({ doc_id: String(s.doc_id || ''), ... }))`

17. **chunks obtenidos: 0 en búsqueda vectorial**
    Causa: Documentos con `access_type='private'` bloqueados por RLS al ejecutar `proc_match_chunks` con el cliente normal del usuario.
    Solución: Usar `createAdminClient` (service_role) exclusivamente para la llamada a `proc_match_chunks`. Todas las demás operaciones siguen usando el cliente del usuario.

18. **Mensaje del usuario no aparecía hasta recibir respuesta**
    Causa: La UI esperaba el resultado de `getChatMessages()` (round-trip a BD) para actualizar el estado de mensajes.
    Solución: Agregar el mensaje del usuario al estado local con `setMessages` inmediatamente antes de llamar `sendMessage`. Agregar la respuesta del asistente desde `result.data` sin llamar `getChatMessages()`.

19. **Badges de fuentes mostraban [undefined]**
    Causa: `proc_match_chunks` no retornaba `document_title` ni usaba `chunk_id` como alias — los campos `chunk.document_title` y `chunk.chunk_id` eran `undefined` al construir `sourcesMap`.
    Solución: Actualizar la RPC con JOIN a `proc_documents` y retornar `c.id AS chunk_id` y `d.title AS document_title`. Migración: `20260502000003_create_proc_match_chunks_function.sql`.

20. **Scroll afectaba todo el módulo en lugar de solo el área de mensajes**
    Causa: Contenedor externo de `chat-conversation.tsx` sin `overflow-hidden` — el flex child no podía contener el scroll.
    Solución: Agregar `overflow-hidden` al contenedor externo y `flex-shrink-0` al div del input.

21. **Sidebar mostraba "Repositorio" y "Chat" activos simultáneamente**
    Causa: `isActive` usaba `startsWith(href + '/')` sin verificar si había un match exacto en el mismo grupo. `/documentos/chat` activaba tanto `/documentos` (startsWith) como `/documentos/chat` (exact).
    Solución: Actualizar `isActive(href, groupItems?)` — si existe un match exacto en `groupItems`, los demás ítems no se activan por `startsWith`. Se pasa `group.items` en `NavGroupCollapsible`.

22. **Claude daba consejos fuera de rol ante presión emocional**
    Causa: Sistema prompt no era suficientemente restrictivo — no prohibía explícitamente dar consejos ni especificaba la respuesta exacta para preguntas fuera de contexto.
    Solución: Agregar reglas 5 y 6 al SYSTEM_PROMPT: respuesta exacta fija para preguntas sin relación con documentos; prohibición explícita de consejos personales, legales o emocionales.

23. **Tarjeta de documento no navegaba a /documentos/[id] para documentos privados**
    Causa: Ítem "Ver" en DropdownMenu tenía condición `access_type !== 'private'` que bloqueaba la opción para docs privados.
    Solución: Eliminar condición + hacer Card clickeable con `router.push()` + `stopPropagation` en DropdownMenuTrigger.

### ✅ Features agregadas (sesión 2026-05-03 — instrucciones 068-085)

**Botón Reintentar (instrucciones 068-070)**
- Nueva Server Action `retryDocument()` en `documento-actions.ts`
- Limpia `proc_document_chunks` y `proc_document_relations` con admin client (service_role)
- Resetea `processing_status` a `'pending'` y `processing_error` a `null`
- Invoca Edge Function `process-document` con service_role key
- Botón visible en `document-card.tsx` solo cuando `processing_status === 'error'`, dentro del bloque `bg-red-50`
- Permisos: `documentos.upload` OR `documentos.manage` OR `is_root()`

**Edición inline de contenido + Re-procesamiento (instrucciones 071-077)**
- Nueva Server Action `updateDocumentContent()` en `documento-actions.ts`
- Convierte string content a Blob con contentType según file_type
- Reemplaza archivo en Storage con `upload(storage_path, blob, { upsert: true })`
- Limpia chunks y relaciones con admin client, resetea a `pending`, invoca Edge Function
- `/documentos/[id]/page.tsx` convertido a Client Component con estados de edición
- `document-content.tsx` acepta props `isEditing` y `onContentChange` — renderiza `<textarea>` en modo edición
- Botón "Editar" visible solo cuando `processing_status === 'completed'` y usuario tiene permisos
- Botones "Guardar" (ejecuta updateDocumentContent, toast, recarga) y "Cancelar" (descarta cambios)
- `document-card.tsx`: tarjeta clickeable con `router.push()`, `stopPropagation` en DropdownMenuTrigger
- Ítem "Ver" en menú siempre visible (eliminada condición `access_type !== 'private'`)
- Permisos: `documentos.upload` OR `documentos.manage` OR `is_root()`

**Streaming de respuesta en chat (instrucciones 079-084)**
- Nueva Route Handler: `src/app/api/documentos/chat/route.ts` — pipe directo del SSE de Anthropic al cliente
- Valida autenticación con `createClient()` antes de proxy a Anthropic
- `chat-actions.ts`: nuevas funciones exportadas `prepareMessageContext()` y `saveAssistantMessage()`
  - `prepareMessageContext()`: vectoriza pregunta, busca chunks, construye `messagesForApi` con contexto, retorna fuentes deduplicadas
  - `saveAssistantMessage()`: guarda mensajes user + assistant en BD, actualiza título si es primer mensaje
- `chat-conversation.tsx`: streaming con `ReadableStream` desde `/api/documentos/chat`
  - Estados `streamContent` y `streamSources` actualizados en cada chunk SSE
  - Burbuja de streaming: tres puntos animados `animate-bounce` mientras espera primer token
  - Markdown progresivo renderizado con `ReactMarkdown` cuando llega contenido
  - `saveAssistantMessage()` es fire-and-forget después de completar el stream
- Ruta nueva en build: `ƒ /api/documentos/chat`

### Decisiones Técnicas Agregadas

17. **Streaming API route separada de Server Actions**
    La ruta `/api/documentos/chat` es un Route Handler HTTP (no Server Action) porque el streaming requiere acceso al `ReadableStream` de la respuesta de Anthropic. Las Server Actions no exponen el body en streaming al frontend. La preparación del contexto (`prepareMessageContext`) sigue siendo Server Action.

## Instrucciones de arranque para nueva sesión

1. Lee los archivos de .context/ en este orden:
   - README.md
   - arquitectura-general.md
   - decisiones-tecnicas.md
   - supabase-integracion.md
   - M8_DOCUMENTOS_STATUS.md (este archivo, lee TODO)

2. Confirma entendimiento con resumen de:
   - Estado actual (MÓDULO COMPLETADO — Fases 1, 2, 3 y 4 todas ✅)
   - Decisiones técnicas que NO debes revertir (especialmente 15 y 16 sobre service_role)
   - Bugs corregidos que NO debes reintroducir (bugs 1–23)

3. Espera instrucción explícita antes de tocar código.

## Reglas de oro

- NUNCA importes lib/permissions.ts en Client Components
- NUNCA uses camelCase en parámetros de Server Actions
- NUNCA hagas INSERT directo a proc_documents (siempre vía proc_create_document)
- NUNCA uses text-embedding-004 (deprecado)
- NUNCA uses SDK de Node en Edge Functions (Deno only)
- NUNCA uses permission_name como parámetro de has_permission (es permission_key)
- SIEMPRE pon EdgeRuntime.waitUntil() antes del return
- SIEMPRE usa await requirePermission() sin capturar el retorno
- SIEMPRE actualiza este archivo al cerrar sesión