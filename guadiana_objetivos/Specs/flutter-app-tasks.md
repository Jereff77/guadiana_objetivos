# Plan de Desarrollo Detallado – App Android Flutter · Guadiana Checklists

**Versión**: 1.0
**Fecha**: 2026-03-21
**Prerequisito**: La plataforma web y el backend Supabase están 100% operativos.
**Stack**: Flutter 3.x · Dart · Supabase · Riverpod · GoRouter

---

## Resumen de Fases

| Fase | Descripción | Tareas |
|------|-------------|--------|
| **Fase 1** | Fundaciones y configuración | M-101 → M-105 |
| **Fase 2** | Autenticación y navegación | M-201 → M-204 |
| **Fase 3** | Lista de checklists asignados | M-301 → M-305 |
| **Fase 4** | Ejecución del formulario | M-401 → M-409 |
| **Fase 5** | Envío y persistencia | M-501 → M-505 |
| **Fase 6** | Historial y perfil | M-601 → M-604 |
| **Fase 7** | Pulido, pruebas y entrega | M-701 → M-706 |

---

## Fase 1 – Fundaciones y Configuración

*Estructura del proyecto, dependencias y tema visual.*

### M-101 · Inicializar proyecto Flutter
- [ ] Crear proyecto Flutter en `guadiana_objetivos/mobile/` con `flutter create`.
- [ ] Configurar `pubspec.yaml` con dependencias iniciales:
  - `supabase_flutter: ^2.x` — cliente Supabase
  - `flutter_riverpod: ^2.x` — manejo de estado
  - `go_router: ^14.x` — navegación declarativa
  - `flutter_secure_storage: ^9.x` — almacenamiento seguro del token
  - `intl: ^0.19.x` — formateo de fechas en español
- [ ] Configurar `.gitignore` para excluir `.env` y archivos sensibles.
- [ ] Verificar build limpio en Android: `flutter run` sin errores.

### M-102 · Configurar cliente Supabase
- [ ] Crear archivo `lib/core/supabase/supabase_client.dart` con `SupabaseClient` singleton.
- [ ] Leer `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde variables de entorno o `--dart-define`.
- [ ] Inicializar Supabase en `main.dart` antes de `runApp()`.
- [ ] Probar conexión ejecutando una query de prueba (SELECT 1).

### M-103 · Sistema de diseño base (tema Guadiana)
- [ ] Crear `lib/core/theme/app_theme.dart` con `ThemeData` personalizado:
  - `primaryColor`: `#004B8D`
  - `colorScheme.secondary`: `#FF8F1C`
  - `scaffoldBackgroundColor`: `#F5F5F5`
  - `appBarTheme`: fondo azul, texto blanco
  - `elevatedButtonTheme`: fondo naranja `#FF8F1C`, texto blanco, radio 8px
  - `inputDecorationTheme`: borde naranja al enfocar
- [ ] Crear `lib/core/constants/app_colors.dart` con todas las constantes de color.
- [ ] Crear `lib/core/constants/app_strings.dart` con textos reutilizables en español.
- [ ] Aplicar tema en `MaterialApp` en `main.dart`.
- [ ] Verificar visualmente con una pantalla de prueba.

### M-104 · Estructura de carpetas y arquitectura base
- [ ] Crear estructura de features: `auth/`, `assignments/`, `execution/`, `history/`.
- [ ] Cada feature con subcarpetas: `data/`, `domain/`, `presentation/`.
- [ ] Crear `lib/shared/widgets/` para componentes reutilizables.
- [ ] Configurar `ProviderScope` en `main.dart` (Riverpod).

### M-105 · Configurar navegación con GoRouter
- [ ] Crear `lib/core/router/app_router.dart` con todas las rutas:
  - `/login` → `LoginScreen`
  - `/home` → `HomeScreen` (lista de checklists)
  - `/checklist/:assignmentId` → `ChecklistDetailScreen`
  - `/execution/:runId` → `ExecutionScreen`
  - `/execution/:runId/confirm` → `ConfirmationScreen`
  - `/history` → `HistoryScreen`
  - `/history/:runId` → `RunDetailScreen`
  - `/profile` → `ProfileScreen`
- [ ] Implementar `redirect` en GoRouter para proteger rutas (requieren sesión activa).
- [ ] Crear `AuthNotifier` en Riverpod que escucha `supabase.auth.onAuthStateChange`.

---

## Fase 2 – Autenticación

*Login, sesión persistente y logout.*

### M-201 · Modelo y repositorio de autenticación
- [ ] Crear `AuthRepository` con métodos:
  - `signIn(email, password)` → llama `supabase.auth.signInWithPassword()`
  - `signOut()` → llama `supabase.auth.signOut()`
  - `currentUser` → getter de `supabase.auth.currentUser`
- [ ] Crear `AuthNotifier` (Riverpod `AsyncNotifier`) que expone el estado de sesión.
- [ ] Manejar restauración de sesión al abrir la app (Supabase lo hace automáticamente con `initialize()`).

### M-202 · Pantalla de Login
- [ ] Diseñar `LoginScreen` con:
  - Logo de Guadiana (o placeholder con "G" en círculo azul).
  - Campo de correo electrónico.
  - Campo de contraseña (con toggle mostrar/ocultar).
  - Botón "Iniciar sesión" (naranja, ancho completo).
  - Mensaje de error en rojo debajo del botón (credenciales incorrectas, sin conexión).
  - Indicador de carga mientras se procesa.
- [ ] Al login exitoso → navegar a `/home`.
- [ ] No mostrar botón "Registrarse" — las cuentas las crea el administrador desde la web.

### M-203 · Pantalla de Perfil y Logout
- [ ] Crear `ProfileScreen` con:
  - Avatar circular con inicial del nombre.
  - Nombre completo del usuario (desde `app_profiles`).
  - Sucursal asignada.
  - Rol en español (ej. "Auditor", "Asesor de ventas", "Operario").
  - Botón "Cerrar sesión" (rojo outline).
- [ ] Al cerrar sesión → navegar a `/login` y limpiar estado.

### M-204 · Guard de rutas y manejo de sesión
- [ ] Implementar `redirect` en GoRouter: si no hay sesión y la ruta no es `/login`, redirigir a `/login`.
- [ ] Implementar `redirect` inverso: si ya hay sesión y va a `/login`, redirigir a `/home`.
- [ ] Manejar expiración de token (Supabase auto-refresh — verificar que funciona).

---

## Fase 3 – Lista de Checklists Asignados

*Pantalla principal: ver qué formularios tiene pendientes el usuario.*

### M-301 · Modelo de datos – Asignaciones y Formularios
- [ ] Crear clases Dart:
  - `Assignment` (id, surveyId, assigneeUserId, assigneeRole, branchId, frequency, startDate, endDate, isActive)
  - `Survey` (id, name, description, category, status, version)
  - `AssignmentWithSurvey` (join de ambas)
- [ ] Implementar serialización `fromJson()` en cada modelo.

### M-302 · Repositorio de Asignaciones
- [ ] Crear `AssignmentsRepository` con método `getActiveAssignments()`:
  - Query a `form_assignments` donde:
    - `is_active = true`
    - `start_date <= hoy` y (`end_date IS NULL` OR `end_date >= hoy`)
    - `assignee_user_id = currentUserId` OR `assignee_role = currentUserRole`
  - JOIN con `form_surveys` (solo `status = 'published'`).
  - Ordenar por `start_date DESC`.
- [ ] Manejar errores de red y RLS (si no hay asignaciones, retornar lista vacía).

### M-303 · Pantalla Home – Lista de Checklists
- [ ] Crear `HomeScreen` con:
  - AppBar azul con título "Mis Checklists" y ícono de usuario (→ perfil).
  - `FutureProvider` o `AsyncNotifier` de Riverpod que carga las asignaciones.
  - Estado de carga: shimmer / skeleton de 3 cards.
  - Estado vacío: ilustración + "No tienes checklists asignados".
  - Estado de error: mensaje + botón "Reintentar".
  - Lista de `ChecklistCard`.

### M-304 · Widget ChecklistCard
- [ ] Crear `ChecklistCard` con:
  - Borde izquierdo naranja de 4px.
  - Nombre del formulario (16sp, bold).
  - Categoría (badge azul claro).
  - Descripción corta (2 líneas, overflow ellipsis).
  - Frecuencia en español (ej. "Semanal", "Mensual").
  - Fecha límite (si `end_date` está definida).
  - Al tocar → navegar a `ChecklistDetailScreen`.

### M-305 · Filtro por categoría
- [ ] Agregar `FilterChip`s horizontales en la parte superior de la lista.
- [ ] Chips: "Todos" + las categorías únicas de las asignaciones del usuario.
- [ ] Filtrado local (sin nueva query a Supabase).

---

## Fase 4 – Ejecución del Formulario

*El núcleo de la app: renderizar y responder el checklist.*

### M-401 · Repositorio de Formularios
- [ ] Crear `SurveyRepository` con método `getSurveyDetail(surveyId)`:
  - Fetch de `form_sections` ordenadas por `order`.
  - Para cada sección: fetch de `form_questions` ordenadas por `order`.
  - Para cada pregunta tipo `single_choice`, `multiple_choice`, `boolean`: fetch de `form_question_options`.
  - Retorna `Survey` completo con secciones, preguntas y opciones anidadas.
- [ ] Manejar formularios grandes (hasta 200 preguntas) sin bloquear la UI.

### M-402 · Pantalla de Detalle / Inicio del Checklist
- [ ] Crear `ChecklistDetailScreen` con:
  - Nombre del formulario (grande, bold).
  - Descripción completa.
  - Número de secciones y total de preguntas.
  - Sucursal del usuario.
  - Fecha y hora actual (se usará como `started_at`).
  - Botón "Comenzar" (naranja, ancho completo).
- [ ] Al tocar "Comenzar":
  - Crear registro en `resp_survey_runs` con `status = 'in_progress'`, `started_at = now()`.
  - Navegar a `ExecutionScreen` pasando el `runId` generado.

### M-403 · Pantalla de Ejecución – Layout Principal
- [ ] Crear `ExecutionScreen` con:
  - AppBar con nombre del formulario y botón de salida (con confirmación de alerta si hay respuestas).
  - Barra de progreso linear (respuestas completadas / total preguntas).
  - Scroll con todas las secciones y preguntas.
  - Botón flotante "Enviar" visible al llegar al final.
- [ ] Crear `ExecutionNotifier` (Riverpod) que:
  - Almacena el mapa de respuestas: `{questionId: Answer}`.
  - Expone métodos `setAnswer(questionId, value)` y `setComment(questionId, comment)`.
  - Calcula el progreso en tiempo real.

### M-404 · Widget de Sección
- [ ] Crear `SectionHeader` con:
  - Fondo `#004B8D`, texto blanco.
  - Número de sección (ej. "Sección 1 de 4").
  - Título de la sección.
  - Descripción de sección (si existe).
- [ ] Separar visualmente las secciones con padding y un `Divider`.

### M-405 · Widgets de Preguntas – Boolean (Sí/No)
- [ ] Crear `BooleanQuestionWidget` con:
  - Label de la pregunta (con `*` si es obligatoria).
  - `help_text` debajo del label en gris.
  - Dos botones lado a lado: "Sí" y "No".
  - Estado "Sí" seleccionado: fondo `#004B8D`, texto blanco.
  - Estado "No" seleccionado: fondo `#D32F2F`, texto blanco.
  - Estado sin selección: ambos en gris claro.
  - Campo de comentario "Acciones a seguir" debajo (ver M-409).

### M-406 · Widgets de Preguntas – Choice (Única y Múltiple)
- [ ] Crear `SingleChoiceQuestionWidget` con:
  - Label y help_text.
  - Lista de `RadioListTile` con las opciones de `form_question_options`.
  - Color de radio seleccionado: `#004B8D`.
  - Si hay score: no mostrarlo al usuario (es info de KPI para la web).
- [ ] Crear `MultipleChoiceQuestionWidget` con:
  - `CheckboxListTile` por cada opción.
  - Color de checkbox: `#004B8D`.
  - Permite seleccionar múltiples opciones.
- [ ] Campo de comentario al final de cada una (ver M-409).

### M-407 · Widgets de Preguntas – Texto
- [ ] Crear `TextShortQuestionWidget`:
  - `TextField` de una línea.
  - Borde naranja al enfocar.
  - Keyboard type: text.
- [ ] Crear `TextLongQuestionWidget`:
  - `TextField` con `maxLines: 5`, `minLines: 3`.
  - Borde naranja al enfocar.
  - Útil para comentarios extensos.
- [ ] Campo de comentario al final de cada una.

### M-408 · Widgets de Preguntas – Número y Fecha
- [ ] Crear `NumberQuestionWidget`:
  - `TextField` con `keyboardType: TextInputType.numberWithOptions(decimal: true)`.
  - Validación: solo acepta números (positivos, decimales permitidos).
- [ ] Crear `DateQuestionWidget`:
  - Botón que abre `showDatePicker()` de Material.
  - Muestra la fecha seleccionada en formato `dd/MM/yyyy`.
  - Locale en español.
- [ ] Campo de comentario al final de cada una.

### M-409 · Campo "Acciones a Seguir" por Pregunta
- [ ] Crear `ActionCommentField` widget reutilizable:
  - Label: "Acciones a seguir" en gris oscuro.
  - `TextField` de texto multilínea (2 líneas mínimo).
  - Siempre visible bajo cada pregunta (no es colapsable).
  - Campo opcional — no bloquea el envío si está vacío.
  - Guarda en `resp_answers.comment`.

---

## Fase 5 – Validación, Envío y Persistencia

*Guardar las respuestas en Supabase correctamente.*

### M-501 · Validación antes del envío
- [ ] Al presionar "Enviar", el `ExecutionNotifier` valida:
  - Que todas las preguntas con `required = true` tengan respuesta no nula.
  - Para `boolean`: debe estar en `true` o `false` (no `null`).
  - Para `single_choice`: debe tener al menos una opción seleccionada.
  - Para `multiple_choice`: debe tener al menos una opción seleccionada.
  - Para `text_short` / `text_long`: campo no vacío ni solo espacios.
  - Para `number`: valor no nulo.
  - Para `date`: fecha no nula.
- [ ] Si hay errores:
  - Mostrar `SnackBar` rojo: "Hay X preguntas obligatorias sin responder".
  - Hacer scroll automático a la primera pregunta con error.
  - Resaltar preguntas con error con borde rojo.

### M-502 · Repositorio de Respuestas
- [ ] Crear `AnswersRepository` con método `submitRun(runId, answers)`:
  - Para cada respuesta en el mapa: construir objeto `resp_answers` con el campo correcto según tipo:
    - Boolean → `value_bool`
    - Single/Multiple choice → `option_id` (y `value_json` para múltiple)
    - Text → `value_text`
    - Number → `value_number`
    - Date → `value_date`
    - Comentario → `comment`
  - Hacer `INSERT` en batch en `resp_answers`.
  - Hacer `UPDATE` en `resp_survey_runs` → `status = 'completed'`, `completed_at = now()`.
- [ ] Manejar errores: si el INSERT falla, no marcar el run como completado.

### M-503 · Lógica de envío en ExecutionNotifier
- [ ] Método `submit()` en `ExecutionNotifier`:
  1. Validar (M-501). Si hay errores, abortar.
  2. Cambiar estado a "enviando" (muestra loading overlay).
  3. Llamar `AnswersRepository.submitRun()`.
  4. Si éxito → navegar a `ConfirmationScreen`.
  5. Si error → mostrar diálogo de error con opción "Reintentar".

### M-504 · Pantalla de Confirmación
- [ ] Crear `ConfirmationScreen` con:
  - Ícono de check verde grande.
  - Texto "¡Checklist enviado exitosamente!".
  - Nombre del formulario completado.
  - Fecha y hora de envío.
  - Botón "Ver mis checklists" → navegar a `/home`.
  - Botón "Ver historial" → navegar a `/history`.
- [ ] La pantalla no permite regresar con el botón back al formulario.

### M-505 · Manejo de errores de red
- [ ] Si no hay conexión al iniciar un checklist: mostrar alerta "Sin conexión a internet. Revisa tu conexión e intenta de nuevo."
- [ ] Si la conexión se pierde durante el llenado: permitir continuar respondiendo (las respuestas están en memoria).
- [ ] Al intentar enviar sin conexión: mostrar error específico con "Reintentar cuando tengas conexión".
- [ ] Implementar `Connectivity` check antes de operaciones críticas (INSERT/UPDATE).

---

## Fase 6 – Historial y Perfil

*Ver los checklists ya completados y el perfil de usuario.*

### M-601 · Repositorio de Historial
- [ ] Crear `HistoryRepository` con método `getUserRuns()`:
  - Query a `resp_survey_runs` donde `respondent_id = currentUserId`.
  - JOIN con `form_surveys` para obtener el nombre.
  - Ordenar por `completed_at DESC`.
  - Filtrar por `status IN ('completed', 'in_progress')`.

### M-602 · Pantalla de Historial
- [ ] Crear `HistoryScreen` con:
  - Lista de ejecuciones completadas del usuario.
  - Card por ejecución: nombre del formulario, fecha de envío, badge de estado.
  - Badge verde = "Completado", naranja = "En progreso".
  - Estado vacío: "Aún no has completado ningún checklist".
  - Al tocar una ejecución → navegar a `RunDetailScreen`.

### M-603 · Pantalla de Detalle de Ejecución (Solo Lectura)
- [ ] Crear `RunDetailScreen` con:
  - Fetch de respuestas: `resp_answers` JOIN `form_questions` JOIN `form_sections` para el `runId`.
  - Agrupadas por sección.
  - Para cada pregunta: mostrar el label, la respuesta en formato legible y el comentario (si existe).
  - Respuestas en modo solo lectura (no editables).
  - Botón "Regresar" al historial.

### M-604 · Pantalla de Perfil
- [ ] Crear `ProfileScreen` con:
  - Avatar circular con inicial del nombre (fondo azul, letra blanca).
  - Nombre completo (desde `app_profiles.full_name`).
  - Correo electrónico (desde `auth.users`).
  - Sucursal (desde `app_profiles.branch_id` → nombre de sucursal).
  - Rol en español.
  - Versión de la app (desde `pubspec.yaml`).
  - Botón "Cerrar sesión" (rojo outline).

---

## Fase 7 – Pulido, Pruebas y Entrega

*Calidad, rendimiento y preparación para producción.*

### M-701 · Estados de carga y feedback visual
- [ ] Implementar shimmer/skeleton en todas las listas y pantallas de carga.
- [ ] Agregar `LinearProgressIndicator` en la pantalla de ejecución (progreso de preguntas).
- [ ] Loading overlay semi-transparente durante el envío (bloquea interacción).
- [ ] `SnackBar` de feedback en todas las acciones críticas.
- [ ] Pull-to-refresh en `HomeScreen` e `HistoryScreen`.

### M-702 · Accesibilidad y usabilidad en taller
- [ ] Verificar que todos los botones táctiles sean ≥ 48dp de alto/ancho.
- [ ] Aumentar tamaño de fuente base en `ThemeData` si es necesario para usuarios mayores.
- [ ] Verificar contraste de colores (AA mínimo según WCAG).
- [ ] Probar en pantalla pequeña (5") y grande (6.7").

### M-703 · Pruebas unitarias
- [ ] Unit tests para `AuthRepository` (mock de Supabase).
- [ ] Unit tests para `AssignmentsRepository` — lógica de filtrado de fechas.
- [ ] Unit tests para `AnswersRepository` — construcción correcta del payload por tipo.
- [ ] Unit tests para validación en `ExecutionNotifier`.
- [ ] Meta: ≥ 80% de cobertura en la capa `domain/` y `data/`.

### M-704 · Pruebas de widgets
- [ ] Widget tests para `BooleanQuestionWidget` (toggle Sí/No).
- [ ] Widget tests para `SingleChoiceQuestionWidget` (selección).
- [ ] Widget tests para `LoginScreen` (formulario, errores).
- [ ] Widget test para `ChecklistCard` (render correcto de datos).

### M-705 · Build de producción
- [ ] Configurar `--dart-define` con `SUPABASE_URL` y `SUPABASE_ANON_KEY` para producción.
- [ ] Configurar `applicationId` y nombre de la app en `android/app/build.gradle`.
- [ ] Configurar ícono de la app con el logo de Guadiana.
- [ ] Configurar `minSdkVersion = 26` (Android 8.0).
- [ ] Generar APK de release: `flutter build apk --release`.
- [ ] Probar APK en dispositivo físico Android.

### M-706 · Documentación y entrega
- [ ] Documentar en `mobile/README.md`:
  - Cómo configurar el entorno de desarrollo.
  - Cómo conectar con Supabase (variables de entorno).
  - Cómo generar el APK de release.
- [ ] Crear guía de instalación para el cliente (instalar APK en dispositivos).
- [ ] Crear guía de usuario rápida (≤ 1 página) para auditores: cómo iniciar sesión, llenar y enviar un checklist.

---

## Control de Progreso

| Fase | Estado | Progreso |
|:-----|:-------|:---------|
| Fase 1 – Fundaciones | Pendiente | 0% |
| Fase 2 – Autenticación | Pendiente | 0% |
| Fase 3 – Lista de Checklists | Pendiente | 0% |
| Fase 4 – Ejecución del Formulario | Pendiente | 0% |
| Fase 5 – Envío y Persistencia | Pendiente | 0% |
| Fase 6 – Historial y Perfil | Pendiente | 0% |
| Fase 7 – Pulido y Entrega | Pendiente | 0% |

---

## Dependencias entre Tareas

```
M-101 → M-102 → M-103 → M-104 → M-105
                                    ↓
M-201 → M-202 → M-203 → M-204
                                    ↓
M-301 → M-302 → M-303 → M-304 → M-305
                                    ↓
M-401 → M-402 → M-403 → M-404 → M-405
         ↓                ↓
       M-406            M-406
       M-407            M-407
       M-408            M-408
       M-409            M-409
                                    ↓
M-501 → M-502 → M-503 → M-504 → M-505
                                    ↓
M-601 → M-602 → M-603 → M-604
                                    ↓
M-701 → M-702 → M-703 → M-704 → M-705 → M-706
```
