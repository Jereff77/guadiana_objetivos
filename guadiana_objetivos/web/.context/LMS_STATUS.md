# Módulo LMS - Estado del Desarrollo

**Última actualización**: 2026-05-02
**Módulo**: M7 - Sistema de Gestión de Aprendizaje (LMS)
**Estado**: ✅ Completado (Cursos con Temario)

## Resumen Ejecutivo

Sistema de gestión de aprendizaje (LMS) con soporte para cursos estructurados en temario, múltiples tipos de contenido (videos, PDFs, texto, formularios/checklists), progreso de usuario por tema completado y creación inline de contenido. Los cursos se integran con el módulo de formularios para incluir evaluaciones.

---

## Características Implementadas

### ✅ Cursos con Temario Estructurado
**Ubicación**: `/capacitacion`

**Funcionalidades**:
- Crear cursos con:
  - Título y descripción
  - Categoría (ej: "Seguridad", "Calidad", "Ventas")
  - Imagen de portada (opcional)
- Temario reordenable:
  - Drag-and-drop para reordenar temas
  - Tipos de contenido:
    - **Video**: URL de YouTube/Vimeo
    - **PDF**: Subida a Supabase Storage
    - **Texto**: Editor de texto enriquecido
    - **Formulario/Encuesta**: Selección de `form_surveys`
- Estados: borrador → publicado
- Progreso de usuario:
  - Tracking por tema completado
  - Barra de progreso global del curso

**Permisos**:
- Ver: `capacitacion.view`
- Gestionar: `capacitacion.manage`

**Archivos**:
- `src/app/(dashboard)/capacitacion/page.tsx` - Catálogo de cursos
- `src/components/lms/course-card.tsx` - Tarjeta de curso
- `src/app/(dashboard)/capacitacion/course-actions.ts` - Server Actions

---

### ✅ Tipos de Contenido

#### Video
**Campos**:
- Título del tema
- URL de video (YouTube o Vimeo)
- Descripción (opcional)

**Visualización**:
- Iframe embed del video
- Soporta YouTube y Vimeo

**Archivos**:
- `src/components/lms/content-form.tsx` - Formulario con tab Video

---

#### PDF
**Campos**:
- Título del tema
- Archivo PDF (subida)
- Descripción (opcional)

**Visualización**:
- PDF viewer con iframe
- Signed URL generada server-side (bucket privado)

**Storage**:
- Bucket: `lms-content`
- RLS: Solo usuarios con `capacitacion.view`

**Archivos**:
- `src/app/(dashboard)/capacitacion/[contentId]/page.tsx` - Genera signed URL
- `src/app/(dashboard)/capacitacion/[contentId]/content-viewer.tsx` - Viewer PDF

---

#### Texto
**Campos**:
- Título del tema
- Cuerpo del texto (markdown o HTML)
- Descripción (opcional)

**Visualización**:
- Contenido renderizado como HTML
- Estilizado con Tailwind

**Archivos**:
- `src/components/lms/content-form.tsx` - Textarea simple

---

#### Formulario/Encuesta
**Campos**:
- Título del tema
- Selección de formulario (`form_surveys`)
- Descripción (opcional)

**Visualización**:
- Embed de `SurveyTopicViewer`
- Usuario puede ejecutar checklist y ver resultados

**Archivos**:
- `src/components/lms/survey-topic-viewer.tsx` - Visor de formularios

---

### ✅ Temario Reordenable
**Ubicación**: Editor de curso en `/capacitacion`

**Funcionalidades**:
- Lista de temas con DnD
- Drag handle para reordenar
- Orden persistido en BD
- Panel de edición inline:
  - Editar título, descripción
  - Eliminar tema
  - Cambiar tipo de contenido

**Librerías**:
- `@dnd-kit/core` + `@dnd-kit/sortable`

**Archivos**:
- `src/components/lms/topic-editor.tsx` - Editor de temario

---

### ✅ Progreso de Usuario
**Ubicación**: Vista de curso `/capacitacion/[courseId]`

**Funcionalidades**:
- Tracking por tema completado
- Click en "Marcar como completado"
- Barra de progreso global (% de temas completados)
- Badge de estado en cada tema:
  - Pendiente (gris)
  - En progreso (azul)
  - Completado (verde)

**Data Model**:
```typescript
interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  topic_id: string
  completed_at: TIMESTAMPTZ
}

// Cálculo de progreso:
const completedTopics = progress.filter(p => p.completed_at).length
const totalTopics = topics.length
const progressPct = (completedTopics / totalTopics) * 100
```

**Archivos**:
- `src/app/(dashboard)/capacitacion/[courseId]/page.tsx` - Vista de curso
- `src/components/lms/topic-list.tsx` - Lista de temas con progreso

---

### ✅ Creación Inline de Contenido
**Ubicación**: `ContentForm` en editor de curso

**Funcionalidades**:
- Crear contenido directamente en el flujo de edición
- No requiere navegar a otra pantalla
- Tabs por tipo de contenido:
  - Video: Input URL
  - PDF: File input
  - Texto: Textarea
  - Formulario: Selector de `form_surveys`
- Guardado inmediato en BD

**Archivos**:
- `src/components/lms/content-form.tsx` - Formulario inline

---

## Schema de Base de Datos

### Tablas Principales

#### `lms_courses`
```sql
id              UUID PRIMARY KEY
title           TEXT
description     TEXT
category        TEXT
image_url       TEXT
is_published    BOOLEAN
created_by      UUID REFERENCES profiles(id)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### `lms_course_topics`
```sql
id          UUID PRIMARY KEY
course_id   UUID REFERENCES lms_courses(id) ON DELETE CASCADE
title       TEXT
type        TEXT (video|pdf|text|survey)
content_id  UUID  -- Referencia a tabla de contenido
order       SMALLINT
created_at  TIMESTAMPTZ
```

#### `lms_content` (Contenido genérico)
```sql
id          UUID PRIMARY KEY
video_url   TEXT  -- Para tipo video
storage_path TEXT  -- Para tipo PDF (Supabase Storage)
text_body   TEXT  -- Para tipo texto
survey_id   UUID REFERENCES form_surveys(id)  -- Para tipo survey
created_at  TIMESTAMPTZ
```

#### `lms_course_progress`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES profiles(id)
course_id    UUID REFERENCES lms_courses(id)
topic_id     UUID REFERENCES lms_course_topics(id)
completed_at TIMESTAMPTZ
UNIQUE (user_id, course_id, topic_id)
```

---

## RLS Políticas

### `lms_courses`, `lms_course_topics`
```sql
-- SELECT: todos los usuarios autenticados pueden ver cursos publicados
CREATE POLICY "courses_view_published" ON lms_courses
FOR SELECT USING (
  is_published = true AND auth.uid() IS NOT NULL
);

-- SELECT: capacitacion.manage ve todos (incluye borradores)
CREATE POLICY "courses_view_all" ON lms_courses
FOR SELECT USING (
  has_permission('capacitacion.manage') OR is_root()
);

-- INSERT/UPDATE/DELETE: manage o root
CREATE POLICY "courses_manage" ON lms_courses
FOR ALL USING (
  has_permission('capacitacion.manage') OR is_root()
);
```

### `lms_course_progress`
```sql
-- SELECT: solo el propio usuario
CREATE POLICY "progress_view_own" ON lms_course_progress
FOR SELECT USING (user_id = auth.uid());

-- INSERT: cualquier usuario autenticado
CREATE POLICY "progress_insert" ON lms_course_progress
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: solo el propio usuario
CREATE POLICY "progress_update_own" ON lms_course_progress
FOR UPDATE USING (user_id = auth.uid());
```

---

## Storage Configuration

### Bucket `lms-content`
**Tipo**: Privado

**RLS Policies**:
```sql
-- SELECT: usuarios con capacitacion.view
CREATE POLICY "lms_content_view" ON storage objects
FOR SELECT USING (
  has_permission('capacitacion.view') OR is_root()
);

-- INSERT: usuarios con capacitacion.manage
CREATE POLICY "lms_content_insert" ON storage objects
FOR INSERT WITH CHECK (
  has_permission('capacitacion.manage') OR is_root()
);
```

---

## Decisiones Técnicas Específicas

### 1. Cursos con Temario sobre Contenido Plano
**Por qué**: Permite reutilizar contenido entre cursos y tiene mejor estructura.

**Implicación**:
- `lms_courses` → `lms_course_topics` → `lms_content`
- Un tema puede apuntar a video, PDF, texto o formulario
- Más flexible que "todo en una tabla"

### 2. Signed URLs para PDFs
**Por qué**: Bucket `lms-content` es privado por seguridad.

**Implicación**:
- Server Action genera signed URL con `createSignedUrl(path, 3600)`
- URL válida por 1 hora
- Frontend usa signed URL en `<iframe>`

### 3. Integración con Formularios
**Por qué**: Las evaluaciones son parte del aprendizaje.

**Implicación**:
- Temas tipo `survey` apuntan a `form_surveys`
- `SurveyTopicViewer` embed de formulario
- Progreso se marca al completar formulario

### 4. Creación Inline de Contenido
**Por qué**: Mejor UX que navegar a crear y volver.

**Implicación**:
- `ContentForm` en mismo panel de edición
- Guardado inmediato en BD
- No requiere recargar página

---

## Bugs Conocidos y Limitaciones

### ⚠️ Limitaciones
1. **No hay certificados**: Al completar curso, no hay descarga de certificado
2. **No hay evaluaciones finales**: No hay "examen" al final del curso
3. **No hay foros/discusiones**: No hay interacción entre alumnos
4. **No hay notas/comentarios**: El usuario no puede tomar notas en los temas

### ✅ Bugs Corregidos
- **PDF no cargaba** (2026-03-22): Signed URL ahora se genera server-side
- **`startContent` crash** (2026-03-23): Movido a server en `[contentId]/page.tsx`

---

## Próximas Mejoras

### Prioridad Alta
- [ ] Certificados al completar curso (PDF generado)
- [ ] Evaluación final (examen con nota mínima)
- [ ] Foros por curso (discusión entre alumnos)

### Prioridad Media
- [ ] Notas del usuario (por tema)
- [ ] Descarga offline (contenido en cache)
- [ ] Recomendaciones (cursos similares)

### Prioridad Baja
- [ ] Gamificación (puntos, insignias)
- [ ] Mentores asignados por curso
- [ ] Sesiones en vivo (integración con video conferencia)

---

## Archivos Clave

| Archivo | Propósito |
|---|---|
| `capacitacion/page.tsx` | Catálogo de cursos |
| `capacitacion/[courseId]/page.tsx` | Vista de curso |
| `capacitacion/[courseId]/[topicId]/page.tsx` | Vista de tema |
| `capacitacion/course-actions.ts` | Server Actions de cursos |
| `capacitacion/lms-actions.ts` | Server Actions de contenido |
| `components/lms/course-card.tsx` | Tarjeta de curso |
| `components/lms/topic-editor.tsx` | Editor de temario |
| `components/lms/content-form.tsx` | Formulario inline de contenido |
| `components/lms/topic-list.tsx` | Lista de temas con progreso |
| `components/lms/content-viewer.tsx` | Visor de contenido (PDF, video, texto) |
| `components/lms/survey-topic-viewer.tsx` | Visor de formularios |
