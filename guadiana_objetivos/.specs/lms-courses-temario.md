# Spec: Reestructura LMS Capacitación — Sistema de Cursos con Temario

**Fecha**: 2026-03-23
**Estado**: Aprobado — pendiente implementación
**Rama**: decisiones

---

## Contexto y motivación

El catálogo de capacitación actual es una lista plana de contenidos individuales (PDFs, videos, textos, quizzes). Se desea estructurarlo como **cursos** (ej. "Capacitación de Excel") que contienen un **temario** ordenado. Cada elemento del temario puede ser:

- Video (referencia a `lms_content` tipo `video`)
- Documento / PDF (referencia a `lms_content` tipo `pdf`)
- Texto (referencia a `lms_content` tipo `text`)
- Evaluación (referencia a un `form_survey` publicado del módulo Formularios)

Los contenidos individuales (`lms_content`) siguen siendo la unidad atómica reutilizable. Los cursos los organizan con un temario ordenado y registran el progreso por tema por usuario.

---

## Modelo de datos

### Tabla `lms_courses`

```sql
CREATE TABLE lms_courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  cover_url     TEXT,                        -- imagen de portada (opcional)
  is_published  BOOLEAN NOT NULL DEFAULT false,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tabla `lms_course_topics` (temario)

```sql
CREATE TABLE lms_course_topics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id    UUID NOT NULL REFERENCES lms_courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  topic_type   TEXT NOT NULL CHECK (topic_type IN ('content', 'survey')),
  content_id   UUID REFERENCES lms_content(id) ON DELETE SET NULL,   -- video/pdf/texto
  survey_id    UUID REFERENCES form_surveys(id) ON DELETE SET NULL,   -- evaluación
  is_required  BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT topic_has_source CHECK (
    (topic_type = 'content' AND content_id IS NOT NULL) OR
    (topic_type = 'survey'  AND survey_id  IS NOT NULL)
  )
);
```

### Tabla `lms_course_progress` (progreso por tema)

```sql
CREATE TABLE lms_course_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id)          ON DELETE CASCADE,
  course_id      UUID NOT NULL REFERENCES lms_courses(id)       ON DELETE CASCADE,
  topic_id       UUID NOT NULL REFERENCES lms_course_topics(id) ON DELETE CASCADE,
  started_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  quiz_score     NUMERIC(5,2),            -- si topic_type='content' con quiz
  survey_run_id  UUID REFERENCES resp_survey_runs(id) ON DELETE SET NULL, -- si tipo survey
  UNIQUE (user_id, topic_id)
);
```

### RLS Policies

| Tabla | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `lms_courses` | `capacitacion.view` (solo publicados) o `capacitacion.manage`/root (todos) | `capacitacion.manage` o root |
| `lms_course_topics` | Heredado del curso visible | `capacitacion.manage` o root |
| `lms_course_progress` | Propio usuario o manage/root | Propio usuario (INSERT/UPDATE) |

---

## Permisos

Se reutilizan los permisos existentes del módulo Capacitación — no se necesitan nuevas entradas en `platform_modules`:

| Permiso | Alcance en cursos |
|---|---|
| `capacitacion.view` | Ver catálogo de cursos publicados, acceder a temas |
| `capacitacion.manage` | CRUD completo de cursos y temas del temario |
| `capacitacion.edit` | Editar título/descripción de cursos y temas |
| `capacitacion.delete` | Eliminar cursos y temas |

---

## Archivos a crear

| Archivo | Tipo | Descripción |
|---|---|---|
| `supabase/migrations/20260323000010_create_lms_courses_schema.sql` | SQL | Tablas + RLS |
| `src/app/(dashboard)/capacitacion/course-actions.ts` | Server Actions | CRUD cursos, temas y progreso |
| `src/app/(dashboard)/capacitacion/[courseId]/page.tsx` | Page | Detalle de curso + temario |
| `src/app/(dashboard)/capacitacion/[courseId]/[topicId]/page.tsx` | Page | Visor de un tema |
| `src/app/(dashboard)/capacitacion/[courseId]/[topicId]/survey-topic-viewer.tsx` | Client Component | Evaluación con form_survey |
| `src/components/lms/course-card.tsx` | Component | Tarjeta de curso en catálogo |
| `src/components/lms/course-form.tsx` | Component | Formulario crear/editar curso |
| `src/components/lms/topic-editor.tsx` | Component | Gestión del temario (manage) |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/app/(dashboard)/capacitacion/page.tsx` | Reemplazar catálogo plano con grid de `CourseCard` |
| `src/app/(dashboard)/capacitacion/lms-actions.ts` | Agregar `getPublishedSurveys()` para selector de evaluaciones |

## Archivos que NO cambian

- `lms_content`, `lms_quizzes`, `lms_paths`, `lms_progress` — backward compatible
- `src/app/(dashboard)/capacitacion/[contentId]/page.tsx` — reutilizado por temas de tipo `content`
- `src/components/lms/content-card.tsx` — permanece para uso legacy

---

## API de Server Actions (`course-actions.ts`)

```typescript
// ── Cursos ─────────────────────────────────────────────────
getCourses(onlyPublished?: boolean): Promise<ActionResult<LmsCourse[]>>
getCourse(id: string): Promise<ActionResult<LmsCourseWithTopics>>
createCourse(data: CreateCourseInput): Promise<ActionResult<{ id: string }>>
updateCourse(id: string, data: Partial<LmsCourse>): Promise<ActionResult>
deleteCourse(id: string): Promise<ActionResult>

// ── Temas ──────────────────────────────────────────────────
createCourseTopic(data: CreateTopicInput): Promise<ActionResult<{ id: string }>>
updateCourseTopic(id: string, data: Partial<LmsCourseTopic>): Promise<ActionResult>
deleteCourseTopic(id: string): Promise<ActionResult>
reorderCourseTopics(courseId: string, orderedIds: string[]): Promise<ActionResult>

// ── Progreso ───────────────────────────────────────────────
startTopic(courseId: string, topicId: string): Promise<ActionResult>
completeTopic(courseId: string, topicId: string, opts?: { quizScore?: number; surveyRunId?: string }): Promise<ActionResult>
getMyCourseProgress(courseId: string): Promise<ActionResult<LmsTopicProgress[]>>
```

### Tipos

```typescript
interface LmsCourse {
  id: string
  title: string
  description: string | null
  category: string | null
  cover_url: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

interface LmsCourseTopic {
  id: string
  course_id: string
  title: string
  description: string | null
  sort_order: number
  topic_type: 'content' | 'survey'
  content_id: string | null
  survey_id: string | null
  is_required: boolean
  created_at: string
  updated_at: string
  // Expandido en getCourse():
  lms_content?: LmsContent
  form_surveys?: { id: string; name: string; status: string }
}

interface LmsCourseWithTopics extends LmsCourse {
  topics: LmsCourseTopic[]
}

interface LmsTopicProgress {
  topic_id: string
  started_at: string
  completed_at: string | null
  quiz_score: number | null
  survey_run_id: string | null
}
```

---

## UX — Flujos

### Usuario final

```
1. /capacitacion → grid de CourseCards (cursos publicados)
   - Cada tarjeta muestra: título, categoría, "X / Y temas completados"
   - Botón "Ir al curso"

2. /capacitacion/[courseId] → detalle del curso
   - Header: título, descripción, progreso global
   - Temario: lista ordenada de temas
     - Ícono por tipo (play, PDF, texto, formulario)
     - Estado: ⬜ pendiente | 🔄 en progreso | ✅ completado
   - Click en tema → navega a /capacitacion/[courseId]/[topicId]

3. /capacitacion/[courseId]/[topicId] → visor del tema
   - Si tipo 'content': iframe PDF / video embed / texto
   - Si tipo 'survey': formulario de evaluación inline
   - Botón "Marcar como completado" (contenido) o "Enviar evaluación" (survey)
   - Navegación: ← Anterior | Siguiente →
```

### Administrador (`capacitacion.manage`)

```
1. /capacitacion → grid de CourseCards (todos, incluye borradores)
   - Botón "Nuevo curso" → abre CourseForm inline
   - Cada tarjeta: botones Editar | Eliminar

2. /capacitacion/[courseId] → detalle + TemarioEditor
   - TemarioEditor:
     - Lista de temas con ↑/↓ para reordenar
     - Botón "Agregar tema":
       · Tipo: Contenido | Evaluación
       · Contenido: selector de lms_content existente
       · Evaluación: selector de form_surveys publicados
     - Por tema: botones Editar | Eliminar
   - Botón "Publicar / Despublicar" curso
```

---

## Verificación

1. `npx tsc --noEmit` → 0 errores
2. Aplicar migración en Supabase → tablas + RLS creadas sin errores
3. Manual como **admin**:
   - Crear curso "Capacitación de Excel" → aparece en catálogo (borrador)
   - Agregar 3 temas: video, PDF, formulario publicado
   - Reordenar con ↑/↓ → orden persiste al recargar
   - Publicar → curso visible para usuarios
4. Manual como **usuario**:
   - Ver curso en catálogo → "0 / 3 temas completados"
   - Entrar tema 1 → registra inicio
   - Completar → ✅ en temario, progreso "1 / 3"
   - Tema de evaluación → responder formulario → registrado como completado
   - Tema 3 completo → "3 / 3 temas completados"
