# Módulo de Chat - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: M5 - Sistema de Chat Interno
**Estado**: ✅ Completado

## Resumen Ejecutivo

Sistema de chat interno estilo WhatsApp con soporte para conversaciones directas 1:1 y grupos. Usa Supabase Realtime para mensajería en tiempo real, soporta archivos adjuntos con preview, edición/eliminación de mensajes (ventana 20 min), emoji picker personalizado y permiso de privacidad para ocultarse del directorio.

---

## Características Implementadas

### ✅ Conversaciones Directas 1:1
**Ubicación**: `/chat`

**Funcionalidades**:
- Click en contacto → crea room automáticamente
- Rooms directas se detectan con `getOrCreateDirectRoom()`
- Nombre de room = nombre del otro usuario
- Avatar = avatar del otro usuario

**Permisos**:
- Ver chat: `chat.view`

**Archivos**:
- `src/app/(dashboard)/chat/page.tsx` - Página principal
- `src/app/(dashboard)/chat/chat-actions.ts` - Server Actions

---

### ✅ Grupos
**Ubicación**: Diálogo en `/chat`

**Funcionalidades**:
- Crear grupos con nombre y miembros
- Admins de grupo pueden:
  - Agregar/quitar miembros
  - Promover miembros a admin
  - Cambiar nombre del grupo
- Salir del grupo
- Icono de grupo (Users) en lista

**Permisos**:
- Cualquier usuario con `chat.view` puede crear grupos

**Archivos**:
- `src/components/chat/group-create-dialog.tsx` - Crear grupo
- `src/components/chat/group-manage-dialog.tsx` - Gestionar grupo

---

### ✅ Mensajería en Tiempo Real
**Ubicación**: `MessageView` en `/chat`

**Funcionalidades**:
- Supabase Realtime subscription a `chat_messages`
- Optimistic updates en UI (mensaje aparece inmediatamente)
- Nuevo mensaje aparece en toast si room no está abierta
- Typing indicators: no implementados (pendiente)

**Realtime Channels**:
```typescript
supabase
  .channel(`chat:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    // Agregar mensaje a estado
  })
  .subscribe()
```

---

### ✅ Archivos Adjuntos
**Ubicación**: Input en `MessageInput`

**Funcionalidades**:
- Subir hasta 10MB por archivo
- Imágenes con preview (thumbnail)
- Documentos con icono y nombre de archivo
- Descarga via signed URL

**Storage**:
- Bucket: `chat-files`
- RLS: Solo miembros del room

**Tipos Soportados**:
- Imágenes: PNG, JPG, JPEG, GIF, WEBP
- Documentos: PDF, DOC, DOCX, XLS, XLSX

**Archivos**:
- `src/app/(dashboard)/chat/chat-actions.ts` - `uploadFile()`

---

### ✅ Emoji Picker Personalizado
**Ubicación**: `MessageInput`

**Funcionalidades**:
- 60 emojis hardcoded (sin librería externa)
- Categorías: Smileys, Gestos, Actividades, Objetos, Símbolos
- Panel emergente con grid 8 columnas
- Inserta emoji en textarea

**Por qué hardcoded**:
- No agregar dependencia pesada (emoji-mart es 200KB+)
- 60 emojis suficientes para uso corporativo
- Control total sobre UX

---

### ✅ Edición y Eliminación de Mensajes
**Ubicación**: Menú contextual en mensaje

**Funcionalidades**:
- Ventana de 20 minutos para editar/eliminar
- Editar: click en menú → textarea con texto → guardar
- Eliminar: confirmación → `updateMessage({ deleted_at: now() })`
- Solo autor del mensaje puede editar/eliminar
- Admins de grupo pueden eliminar cualquier mensaje

**Lógica**:
```typescript
const canEdit = msg.sender_id === currentUserId || isAdmin
const isEditable = differenceInMinutes(new Date(), new Date(msg.created_at)) < 20
```

---

### ✅ Directorio de Contactos
**Ubicación**: Panel izquierdo en `/chat`

**Funcionalidades**:
- Sección "Conversaciones": rooms activas, orden por actividad reciente
- Sección "Contactos": usuarios sin conversación, orden alfabético
- Búsqueda única filtra ambas secciones
- Click en contacto:
  - Spinner en avatar
  - Crea room automáticamente
  - Contacto se mueve a "Conversaciones"

**Permisos de Privacidad**:
- Usuarios con `chat.hidden` NO aparecen en "Contactos"
- EXCEPCIÓN: Si ya existe conversación directa, sí aparecen
- Toggle de visibilidad en header del chat (ojo/ojo-tachado)

---

### ✅ Permisos de Privacidad
**Ubicación**: Header del chat

**Funcionalidades**:
- Columna `chat_hidden BOOLEAN` en `profiles`
- Permiso `chat.hidden` - "Privacidad en chat"
- Toggle para ocultarse/mostrarse
- Estado ámbar (oculto) / normal (visible)
- Solo visible si tiene permiso `chat.hidden`

**Server Actions**:
```typescript
export async function toggleChatHidden(hidden: boolean) {
  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({ chat_hidden: hidden })
    .eq('id', user.id)
}
```

---

## Schema de Base de Datos

### Tablas Principales

#### `chat_rooms`
```sql
id          UUID PRIMARY KEY
name        TEXT
is_group    BOOLEAN
created_by  UUID REFERENCES profiles(id)
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### `chat_room_members`
```sql
id          UUID PRIMARY KEY
room_id     UUID REFERENCES chat_rooms(id)
user_id     UUID REFERENCES profiles(id)
is_admin    BOOLEAN
joined_at   TIMESTAMPTZ
UNIQUE (room_id, user_id)
```

#### `chat_messages`
```sql
id          UUID PRIMARY KEY
room_id     UUID REFERENCES chat_rooms(id)
sender_id   UUID REFERENCES profiles(id)
content     TEXT
file_path   TEXT  -- Supabase Storage
file_name   TEXT
file_type   TEXT
created_at  TIMESTAMPTZ
edited_at   TIMESTAMPTZ
deleted_at  TIMESTAMPTZ  -- Soft delete
```

### Funciones SQL

#### `get_or_create_direct_room(user1_id, user2_id)`
Retorna room directa entre dos usuarios, o la crea si no existe.

```sql
CREATE OR REPLACE FUNCTION get_or_create_direct_room(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  room_id UUID;
BEGIN
  -- Buscar room existente
  SELECT id INTO room_id
  FROM chat_rooms r
  JOIN chat_room_members m1 ON m1.room_id = r.id
  JOIN chat_room_members m2 ON m2.room_id = r.id
  WHERE r.is_group = false
  AND m1.user_id = user1_id
  AND m2.user_id = user2_id
  LIMIT 1;

  -- Si no existe, crear
  IF room_id IS NULL THEN
    INSERT INTO chat_rooms (is_group)
    VALUES (false)
    RETURNING id INTO room_id;

    INSERT INTO chat_room_members (room_id, user_id)
    VALUES (room_id, user1_id), (room_id, user2_id);
  END IF;

  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `is_room_member(room_id)`
Retorna `true` si el usuario actual es miembro del room.

---

## Realtime Configuration

### Habilitar Realtime en Tablas
```sql
-- Habilitar Realtime en chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Habilitar Realtime en chat_room_members
ALTER PUBLICATION supabase_realtime ADD TABLE chat_room_members;
```

### Subscribe a Cambios
```typescript
const channel = supabase
  .channel(`chat:${roomId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    const newMsg = payload.new as ChatMessage
    setMessages(prev => [...prev, newMsg])
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'chat_messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    const updated = payload.new as ChatMessage
    setMessages(prev => prev.map(m => m.id === updated.id ? updated : m))
  })
  .subscribe()
```

---

## RLS Políticas

### `chat_rooms`
```sql
-- SELECT: solo si eres miembro
CREATE POLICY "rooms_member_only" ON chat_rooms
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE room_id = chat_rooms.id
    AND user_id = auth.uid()
  )
);

-- INSERT: cualquiera con chat.view
CREATE POLICY "rooms_insert" ON chat_rooms
FOR INSERT WITH CHECK (has_permission('chat.view'));
```

### `chat_messages`
```sql
-- SELECT: solo si eres miembro del room
CREATE POLICY "messages_member_only" ON chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE room_id = chat_messages.room_id
    AND user_id = auth.uid()
  )
);

-- INSERT: miembros del room
CREATE POLICY "messages_insert" ON chat_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_room_members
    WHERE room_id = chat_messages.room_id
    AND user_id = auth.uid()
  )
);

-- UPDATE: autor del mensaje o admin
CREATE POLICY "messages_update" ON chat_messages
FOR UPDATE USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM chat_room_members rm
    JOIN chat_rooms r ON r.id = rm.room_id
    WHERE rm.room_id = chat_messages.room_id
    AND rm.user_id = auth.uid()
    AND rm.is_admin = true
    AND r.is_group = true
  )
);

-- DELETE: igual que UPDATE
CREATE POLICY "messages_delete" ON chat_messages
FOR DELETE USING (
  sender_id = auth.uid()
  OR EXISTS (...) -- misma lógica que UPDATE
);
```

### `chat-room_members`
```sql
-- Realtime: solo recibir cambios de tus membresías
CREATE POLICY "members_realtime_self" ON chat_room_members
FOR SELECT USING (user_id = auth.uid());
```

---

## Decisiones Técnicas Específicas

### 1. Supabase Realtime sobre WebSockets custom
**Por qué**: Supabase ya tiene infraestructura Realtime con autenticación integrada.

**Implicación**:
- No hay que manejar conexión/reconexión
- Canales de presencia automáticos
- Menos código que implementar WebSocket server propio

### 2. Soft Delete de Mensajes
**Por qué**: Mejor UX que eliminar físicamente (puede confundir en threads).

**Implicación**:
- `deleted_at TIMESTAMPTZ` en lugar de DELETE
- Frontend filtra mensajes con `deleted_at IS NULL`
- Se puede implementar "Undelete" si se necesita

### 3. Emoji Picker Hardcoded
**Por qué**: No agregar dependencia pesada (emoji-mart es 200KB+).

**Implicación**:
- 60 emojis hardcoded en array
- Panel emergente con grid 8 columnas
- Control total sobre UX

### 4. Privacidad con chat.hidden
**Por qué**: Directores/usuarios especiales necesitan poder ocultarse del directorio.

**Implicación**:
- Columna `chat_hidden` en `profiles`
- Permiso `chat.hidden` para ver toggle
- Usuarios ocultos NO aparecen en "Contactos" salvo que ya exista conversación

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay typing indicators**: No se ve "X está escribiendo..."
2. **No hay read receipts**: No se ve "X leyó el mensaje" (check azul)
3. **No hay búsqueda de mensajes**: No puedes buscar texto en historial
4. **No hay reacciones**: No puedes reaccionar con emoji a mensaje
5. **No hay reply/quote**: No puedes responder a un mensaje específico

### ✅ Bugs Corregidos
- **Función `get_or_create_direct_room` no aplicada**: Ejecutada vía MCP en Supabase
- **React hydration error**: Resuelto con `suppressHydrationWarning` en `<body>`

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Typing indicators (Usuarios están escribiendo...)
- [ ] Read receipts (Vistos)
- [ ] Búsqueda de mensajes (Ctrl+F)

### Prioridad Media
- [ ] Reacciones a mensajes (emoji)
- [ ] Reply/quote de mensaje
- [ ] Forward de mensajes a otra conversación
- [ ] Mensajes de voz (audio recording)

### Prioridad Baja
- [ ] Encuestas en grupos
- [ ] Mensajes programados
- [ ] Broadcast (enviar a múltiples grupos)

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `chat/page.tsx` | Página principal de chat |
| `chat/chat-page-client.tsx` - Layout dos columnas con Realtime |
| `chat/chat-actions.ts` | Server Actions (rooms, mensajes, archivos) |
| `components/chat/room-list.tsx` | Panel izquierdo (conversaciones + contactos) |
| `components/chat/message-view.tsx` | Vista de mensajes con Realtime |
| `components/chat/message-input.tsx` | Input con emoji picker + archivos |
| `components/chat/group-create-dialog.tsx` | Crear grupo |
| `components/chat/group-manage-dialog.tsx` | Gestionar grupo |
