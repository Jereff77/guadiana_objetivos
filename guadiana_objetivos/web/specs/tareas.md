# Tareas: Reestructura LMS Capacitación — Cursos con Temario

> Spec completa: `specs/lms-courses-temario.md`
> Rama: `decisiones`

---

## T-01 — Migración SQL
**Archivo**: `supabase/migrations/20260323000010_create_lms_courses_schema.sql`

- [ ] Tabla `lms_courses` (id, title, description, category, cover_url, is_published, created_by, timestamps)
- [ ] Tabla `lms_course_topics` (id, course_id, title, description, sort_order, topic_type, content_id, survey_id, is_required, timestamps + CONSTRAINT)
- [ ] Tabla `lms_course_progress` (id, user_id, course_id, topic_id, started_at, completed_at, quiz_score, survey_run_id, UNIQUE user+topic)
- [ ] Triggers `update_updated_at` en lms_courses y lms_course_topics
- [ ] RLS: lms_courses (view=solo publicados, manage=todos)
- [ ] RLS: lms_course_topics (hereda visibilidad del curso)
- [ ] RLS: lms_course_progress (usuario ve el propio, manage ve todos)
- [ ] Aplicar migración con MCP Supabase

---

## T-02 — Server Actions
**Archivo**: `src/app/(dashboard)/capacitacion/course-actions.ts`

- [ ] Tipos: LmsCourse, LmsCourseTopic, LmsCourseWithTopics, LmsTopicProgress
- [ ] `getCourses(onlyPublished?)` — lista de cursos
- [ ] `getCourse(id)` — curso con topics + join lms_content + form_surveys
- [ ] `createCourse(data)` — requiere manage/root
- [ ] `updateCourse(id, data)` — requiere manage/edit/root
- [ ] `deleteCourse(id)` — requiere manage/delete/root
- [ ] `createCourseTopic(data)` — requiere manage/root
- [ ] `updateCourseTopic(id, data)` — requiere manage/edit/root
- [ ] `deleteCourseTopic(id)` — requiere manage/delete/root
- [ ] `reorderCourseTopics(courseId, orderedIds)` — actualiza sort_order
- [ ] `startTopic(courseId, topicId)` — upsert ignoreDuplicates
- [ ] `completeTopic(courseId, topicId, opts?)` — update completado
- [ ] `getMyCourseProgress(courseId)` — progreso del usuario actual

**También en** `lms-actions.ts`:
- [ ] `getPublishedSurveys()` — form_surveys con status='published'

---

## T-03 — Componente `CourseCard`
**Archivo**: `src/components/lms/course-card.tsx`

- [ ] Props: course, totalTopics, completedTopics, canManage, canEdit, canDelete
- [ ] Cover image o placeholder con ícono
- [ ] Badges: categoría, Publicado/Borrador (manage)
- [ ] Barra de progreso visual "X / Y temas"
- [ ] Botón "Ir al curso"
- [ ] Edición inline (canEdit)
- [ ] Eliminación con confirmación (canDelete)

---

## T-04 — Componente `CourseForm`
**Archivo**: `src/components/lms/course-form.tsx`

- [ ] Campos: Título*, Descripción, Categoría, URL portada, checkbox Publicar
- [ ] useTransition + isPending
- [ ] Submit → createCourse() → redirect a /capacitacion/[id]
- [ ] Manejo de errores inline

---

## T-05 — Componente `TopicEditor`
**Archivo**: `src/components/lms/topic-editor.tsx`

- [ ] Lista de temas con ↑/↓ para reordenar
- [ ] Botones Editar / Eliminar por tema
- [ ] Panel "Agregar tema": título, tipo (Contenido|Evaluación), selector de contenido/survey, checkbox obligatorio
- [ ] Edición inline por tema
- [ ] Confirmación de borrado
- [ ] reorderCourseTopics al mover

---

## T-06 — Página `/capacitacion` (modificar)
**Archivo**: `src/app/(dashboard)/capacitacion/page.tsx`

- [ ] Reemplazar catálogo plano con grid de `CourseCard`
- [ ] Calcular completedTopics/totalTopics por curso y usuario
- [ ] Mantener sección "Rutas de aprendizaje" si hay paths
- [ ] Sección "Nuevo curso" con CourseForm (solo manage)
- [ ] Eliminar filtro por categoría del catálogo antiguo

---

## T-07 — Página `/capacitacion/[courseId]` (nueva)
**Archivo**: `src/app/(dashboard)/capacitacion/[courseId]/page.tsx`

- [ ] requirePermission('capacitacion.view')
- [ ] getCourse() + getMyCourseProgress()
- [ ] notFound() si no publicado y sin manage
- [ ] Header: título, descripción, categoría, cover, botón publicar/despublicar
- [ ] Progreso global: barra + contador
- [ ] Lista temario: ícono por tipo, estado (pendiente/en progreso/completado), link al tema
- [ ] TopicEditor (manage): con datos de contenidos y surveys

---

## T-08 — Página `/capacitacion/[courseId]/[topicId]` (nueva)
**Archivo**: `src/app/(dashboard)/capacitacion/[courseId]/[topicId]/page.tsx`

- [ ] requirePermission('capacitacion.view')
- [ ] startTopic() automático server-side
- [ ] Si 'content': getLmsContent + signed URL para PDF + ContentViewer
- [ ] Si 'survey': SurveyTopicViewer
- [ ] Breadcrumb: Capacitación > Curso > Tema
- [ ] Navegación ← Anterior | Siguiente →

---

## T-09 — Componente `SurveyTopicViewer` (nuevo)
**Archivo**: `src/app/(dashboard)/capacitacion/[courseId]/[topicId]/survey-topic-viewer.tsx`

- [ ] Props: surveyId, courseId, topicId
- [ ] Cargar secciones/preguntas/opciones del survey
- [ ] Renderizar formulario LMS-style (sin cabecera de formularios)
- [ ] Validación de requeridos
- [ ] Al enviar: crear run → guardar respuestas → completar run → completeTopic()
- [ ] router.refresh() al completar

---

## T-10 — Verificación final

- [ ] `npx tsc --noEmit` → 0 errores
- [ ] `npx next build` → exitoso
- [ ] Prueba manual admin: crear curso → agregar temas → reordenar → publicar
- [ ] Prueba manual usuario: ver catálogo → completar temas → progreso actualizado
- [ ] Prueba tema evaluación: responder survey → marcado como completado
