# Lista de Tareas - Módulo de Procesos (Flutter App)

**Proyecto**: Aplicación Móvil Guadiana - Módulo de Procesos
**Plataforma**: Flutter (iOS/Android)
**Fecha**: 2025-04-13
**Versión**: 1.0

---

## Estrategia de Desarrollo

**Enfoque**: MVP con iteraciones incrementales

1. **Fase 1 - Fundamentos (Sprint 1)**: Configuración, Auth, navegación
2. **Fase 2 - Core Features (Sprint 2)**: Lista de formularios, detalle, respuesta
3. **Fase 3 - Offline/Sync (Sprint 3)**: SQLite, sincronización
4. **Fase 4 - Refinamiento (Sprint 4)**: Testing, optimización, deployment

---

## Fase 1: Fundamentos (Sprint 1)

**Duración Estimada**: 2 semanas
**Objetivo**: Base de la aplicación funcionando

### T-101: Configuración del Proyecto

**Descripción**: Inicializar proyecto Flutter con configuraciones base

**Subtareas**:
- [x] Crear proyecto Flutter: `flutter create guadiana_procesos`
- [x] Configurar estructura de carpetas (Clean Architecture)
- [x] Agregar dependencias principales:
  - `flutter_riverpod`: Gestión de estado
  - `go_router`: Navegación
  - `supabase_flutter`: Cliente Supabase
  - `sqflite`: Base de datos local
  - `connectivity_plus`: Detectar conectividad
  - `flutter_secure_storage`: Almacenamiento seguro
  - `intl`: Internacionalización
  - `flutter_dotenv`: Variables de entorno
- [x] Configurar temas (Material Design 3)
- [x] Configurar l10n (español, inglés)
- [x] Setup de linting y formatting

**Archivos Modificados**:
- `pubspec.yaml`
- `lib/config/`
- `analysis_options.yaml`

**Estimación**: 4 horas

---

### T-102: Supabase Integration

**Descripción**: Configurar cliente Supabase y servicios base

**Subtareas**:
- [x] Crear `SupabaseClient` singleton
- [x] Configurar `.env` con credenciales
- [x] Implementar `initialize()` en `main.dart`
- [x] Crear `ApiClient` wrapper
- [x] Test de conexión: autenticación simple

**Archivos Creados**:
- `lib/services/supabase_client.dart`
- `lib/core/network/api_client.dart`
- `.env.example`

**Estimación**: 3 horas

---

### T-103: Estructura de Base de Datos Local

**Descripción**: Implementar SQLite para modo offline

**Subtareas**:
- [x] Crear servicio `DatabaseService`
- [x] Definir esquema SQL en `assets/schema.sql`
- [x] Implementar migraciones
- [x] Crear DAOs base:
  - `FormsCacheDao`
  - `AssignmentsCacheDao`
  - `SurveyRunsLocalDao`
  - `AnswersLocalDao`
- [x] Tests unitarios de DAOs

**Archivos Creados**:
- `lib/services/database_service.dart`
- `assets/schema.sql`
- `lib/features/forms/data/datasources/forms_local_datasource.dart`

**Estimación**: 6 horas

---

### T-104: Sistema de Autenticación

**Descripción**: Implementar login y gestión de sesión

**Subtareas**:
- [x] Crear entidad `User`
- [x] Implementar `AuthRepository` (remote + local storage)
- [x] Crear `LoginUseCase`
- [x] Crear `LogoutUseCase`
- [x] Crear `GetCurrentUserUseCase`
- [x] Implementar `AuthProvider` (Riverpod)
- [x] Crear `LoginPage` UI
- [x] Implementar validadores (email, password)
- [x] Manejo de errores y loading states
- [x] Persistencia de sesión con `FlutterSecureStorage`

**Archivos Creados**:
- `lib/features/auth/domain/entities/user.dart`
- `lib/features/auth/domain/repositories/auth_repository.dart`
- `lib/features/auth/domain/usecases/*.dart`
- `lib/features/auth/data/repositories/auth_repository_impl.dart`
- `lib/features/auth/presentation/providers/auth_provider.dart`
- `lib/features/auth/presentation/pages/login_page.dart`
- `lib/core/utils/validators.dart`

**Estimación**: 8 horas

---

### T-105: Navegación Principal

**Descripción**: Configurar GoRouter con guards

**Subtareas**:
- [x] Definir rutas en `go_router.dart`
- [x] Implementar guard de autenticación
- [x] Crear página principal (shell con bottom nav o drawer)
- [x] Crear `ProfilePage` básica
- [x] Implementar redirecciones (login → home)

**Archivos Creados**:
- `lib/config/routes.dart`
- `lib/app.dart`
- `lib/features/profile/presentation/pages/profile_page.dart`

**Estimación**: 4 horas

---

## Fase 2: Core Features (Sprint 2)

**Duración Estimada**: 3 semanas
**Objetivo**: Funcionalidad principal de formularios

### T-201: Modelos de Dominio

**Descripción**: Definir entidades del módulo de formularios

**Subtareas**:
- [x] Crear entidades:
  - `FormSurvey`
  - `FormAssignment`
  - `FormSection`
  - `FormQuestion`
  - `FormQuestionOption`
  - `SurveyRun`
  - `Answer`
- [x] Definir enums: `FormStatus`, `QuestionType`, `RunStatus`
- [x] Crear DTOs/Models para JSON serialización
- [x] Implementar `fromJson/toJson` con `freezed`
- [x] Tests de serialización

**Archivos Creados**:
- `lib/features/forms/domain/entities/*.dart`
- `lib/features/forms/data/models/*.dart`

**Estimación**: 6 horas

---

### T-202: Repository de Formularios

**Descripción**: Implementar lógica de acceso a datos de formularios

**Subtareas**:
- [x] Definir interfaz `FormsRepository`
- [x] Implementar `FormsRepositoryImpl`:
  - `getAssignedForms(userId, role)` → Supabase query
  - `getFormDetail(surveyId)` → Supabase query con relaciones
  - `createSurveyRun(surveyId, assignmentId)` → Insert local + remote
  - `saveAnswer(runId, answer)` → Upsert local
  - `completeSurveyRun(runId)` → Update local + remote
  - `getProgress(runId)` → Calculate from local answers
- [x] Implementar cache en SQLite
- [x] Manejo de errores y timeouts
- [x] Tests unitarios con mocks

**Archivos Creados**:
- `lib/features/forms/domain/repositories/forms_repository.dart`
- `lib/features/forms/data/repositories/forms_repository_impl.dart`
- `lib/features/forms/data/datasources/forms_remote_datasource.dart`

**Estimación**: 10 horas

---

### T-203: Use Cases de Formularios

**Descripción**: Implementar casos de uso del dominio

**Subtareas**:
- [x] `GetAssignedFormsUseCase`: Obtener asignaciones del usuario
- [x] `GetFormDetailUseCase`: Obtener estructura completa del formulario
- [x] `SaveAnswerUseCase`: Guardar respuesta individual
- [x] `CompleteSurveyRunUseCase`: Marcar run como completado
- [x] `GetProgressUseCase`: Calcular progreso (%)
- [x] `RefreshFormsUseCase`: Forzar refresh desde servidor
- [x] Tests de cada use case

**Archivos Creados**:
- `lib/features/forms/domain/usecases/*.dart`

**Estimación**: 6 horas

---

### T-204: Providers de Estado

**Descripción**: Implementar gestión de estado con Riverpod

**Subtareas**:
- [x] `FormsProvider`:
  - Estado: loading, data, error
  - Actions: refresh, filterByStatus
  - Auto-refresh al iniciar
- [x] `FormDetailProvider`:
  - Estado: currentForm, currentRun, answers map
  - Actions: loadForm, saveAnswer, complete, discard
  - Cálculo reactivo de progreso
- [x] `SyncProvider`:
  - Estado: isSyncing, pendingCount, lastSyncAt
  - Actions: syncNow, autoSync
- [x] Integrar con `NetworkInfo` para detectar conectividad

**Archivos Creados**:
- `lib/features/forms/presentation/providers/forms_provider.dart`
- `lib/features/forms/presentation/providers/form_detail_provider.dart`
- `lib/features/sync/presentation/providers/sync_provider.dart`

**Estimación**: 8 horas

---

### T-205: Lista de Formularios UI

**Descripción**: Pantalla de lista de formularios asignados

**Subtareas**:
- [x] `FormsListPage`: Página principal
- [x] `FormCard`: Card individual con:
  - Nombre del formulario
  - Descripción
  - Barra de progreso
  - Chip de estado (no iniciado/en progreso/completado)
- [x] Pull-to-refresh
- [x] Filtros por estado (tabs: todos, pendientes, completados)
- [x] Estado vacío ("No tienes formularios")
- [x] Estado de error con retry
- [x] Indicador de sync pendiente en app bar
- [x] Navegación a detalle al tap

**Archivos Creados**:
- `lib/features/forms/presentation/pages/forms_list_page.dart`
- `lib/features/forms/presentation/widgets/form_card.dart`
- `lib/features/forms/presentation/widgets/progress_bar.dart`

**Estimación**: 8 horas

---

### T-206: Detalle de Formulario UI

**Descripción**: Pantalla para responder un formulario

**Subtareas**:
- [x] `FormDetailPage`: Contenedor de secciones
- [x] `SectionWidget`: Acordeón de sección
- [x] `QuestionWidget`: Renderizado dinámico por tipo:
  - Boolean → Switch
  - Single choice → Radio buttons
  - Multiple choice → Checkboxes
  - Text short → TextField 1 línea
  - Text long → TextField multiline
  - Number → TextField numérico
  - Date → DatePicker
- [x] Validación de required (bloquear si faltan)
- [x] Guardado automático (debounce)
- [x] Botón "Completar" con confirmación
- [x] Indicador de guardando...
- [x] Botón "Descartar borradores"

**Archivos Creados**:
- `lib/features/forms/presentation/pages/form_detail_page.dart`
- `lib/features/forms/presentation/widgets/section_widget.dart`
- `lib/features/forms/presentation/widgets/question_widget.dart`

**Estimación**: 12 horas

---

### T-207: Resumen de Respuestas UI

**Descripción**: Pantalla de resumen pre-confirmación

**Subtareas**:
- [x] `FormSummaryPage`: Vista post-completado
- [x] Listado de preguntas con respuestas dadas
- [x] Formateo según tipo:
  - Boolean → Sí/No
  - Options → Labels seleccionados
  - Text → Truncate con expand
  - Number → Formato numérico
  - Date → dd/MM/yyyy
- [x] Botón "Editar" (vuelve a detail)
- [x] Botón "Confirmar Envío" (ejecuta sync)
- [x] Indicador de sincronización (pendiente/listo)

**Archivos Creados**:
- `lib/features/forms/presentation/pages/form_summary_page.dart`

**Estimación**: 6 horas

---

## Fase 3: Offline & Sync (Sprint 3)

**Duración Estimada**: 2 semanas
**Objetivo**: Modo offline y sincronización robusta

### T-301: Detección de Conectividad

**Descripción**: Servicio de red y listeners

**Subtareas**:
- [x] Implementar `NetworkInfo` con `connectivity_plus`
- [x] Stream de cambios de conectividad
- [x] Test de reachability (ping a Supabase)
- [x] Integrar con sync (auto-sync al reconectar)
- [x] UI indicators (banner offline, sync badge)

**Archivos Creados**:
- `lib/core/network/network_info.dart`
- `lib/features/sync/presentation/widgets/offline_banner.dart`
- `lib/features/sync/presentation/widgets/sync_indicator.dart`

**Estimación**: 4 horas

---

### T-302: Cola de Sincronización

**Descripción**: Implementar cola de pendientes

**Subtareas**:
- [x] Tabla local `sync_queue` (run_id, action, status, retries)
- [x] `SyncRepository` con operaciones:
  - `enqueue(runId, action)`
  - `dequeue()`
  - `markSuccess(runId)`
  - `markFailed(runId, error)`
  - `incrementRetry(runId)`
- [x] Lógica de reintentos con backoff exponencial
- [x] Máximo 3 reintentos antes de marcar como failed

**Archivos Creados**:
- `lib/features/sync/data/repositories/sync_repository_impl.dart`
- `lib/features/sync/data/datasources/sync_datasource.dart`

**Estimación**: 6 horas

---

### T-303: Sincronización Bidireccional

**Descripción**: Implementar sync de runs y answers

**Subtareas**:
- [x] `SyncPendingDataUseCase`:
  1. Obtener runs pendientes (needs_sync = 1)
  2. Para cada run:
     - Crear en Supabase si no existe
     - Insertar/actualizar answers
     - Marcar como sincronizado
     - Manejar conflictos (server wins)
- [x] `SyncFormsUseCase`:
  - Pull de formularios actualizados desde servidor
  - Update cache local
- [x] Ejecución en background con `Workmanager` (Android) / `BGTask` (iOS)
- [x] Notificaciones locales de sync completado

**Archivos Creados**:
- `lib/features/sync/domain/usecases/sync_pending_data_usecase.dart`
- `lib/features/sync/domain/usecases/sync_forms_usecase.dart`

**Estimación**: 10 horas

---

### T-304: Manejo de Conflictos

**Descripción**: Resolver conflictos de sincronización

**Subtareas**:
- [x] Detectar conflictos (run existe en server y fue modificado)
- [x] Estrategia: last-write-wins con timestamp
- [x] Prompt al usuario si run está completado en ambos lados
- [x] Merge de respuestas (diff entre local y remote)
- [x] Logs de conflictos resueltos

**Archivos Creados**:
- `lib/features/sync/domain/services/conflict_resolver.dart`

**Estimación**: 6 horas

---

### T-305: Optimizaciones Offline

**Descripción**: Mejorar experiencia offline

**Subtareas**:
- [x] Pre-carga de formularios al login
- [x] Imágenes cacheadas (si aplica en futuro)
- [x] Comprimir datos antes de sync
- [x] Batch inserts (múltiples answers en una query)
- [x] Paginación de formularios (si > 50)
- [x] Lazy loading de secciones
- [x] Indicadores visuales de modo offline

**Archivos Creados**:
- `lib/core/utils/compression_helper.dart`
- `lib/features/forms/presentation/widgets/offline_badge.dart`

**Estimación**: 8 horas

---

## Fase 4: Refinamiento (Sprint 4)

**Duración Estimada**: 2 semanas
**Objetivo**: Testing, optimización, deployment

### T-401: Suite de Tests

**Descripción**: Tests unitarios, widget e integración

**Subtareas**:
- [x] Unit tests de use cases (100% coverage)
- [x] Unit tests de repositories (80% coverage)
- [x] Widget tests de páginas principales:
  - `LoginPage`
  - `FormsListPage`
  - `FormDetailPage`
  - `FormSummaryPage`
- [x] Widget tests de widgets custom:
  - `QuestionWidget` (todos los tipos)
  - `FormCard`
  - `ProgressBar`
- [x] Integration tests: flujo completo (login → lista → detalle → completar)
- [x] Mocks de Supabase responses
- [x] Configurar CI para ejecutar tests

**Archivos Creados**:
- `test/features/**/*.dart`
- `test/mocks/*.dart`

**Estimación**: 12 horas

---

### T-402: Manejo de Errores

**Descripción**: Errores amigables para el usuario

**Subtareas**:
- [x] Definir `Failures` (domain errors):
  - `NetworkFailure`
  - `AuthFailure`
  - `NotFoundFailure`
  - `ValidationFailure`
  - `ServerFailure`
- [x] Mappers de `Exceptions` a `Failures`
- [x] UI de error con ilustraciones
- [x] Snackbars contextualizados
- [x] Logs de errores (Sentry o similar)
- [x] Modal de "Sin conexión" con reintentos

**Archivos Creados**:
- `lib/core/error/failures.dart`
- `lib/core/error/exceptions.dart`
- `lib/features/shared/presentation/widgets/error_widget.dart`

**Estimación**: 6 horas

---

### T-403: Performance & Optimización

**Descripción**: Optimizar rendimiento y tamaño

**Subtareas**:
- [x] Profile con DevTools
- [x] Optimizar renderizado (const widgets, Avoid rebuilding)
- [x] Lazy loading de listas grandes
- [x] Imagen optimization (si aplica)
- [x] Reducir APK/IPA size (tree shaking, code splitting)
- [x] Comprimir JSON responses
- [x] Caché de imágenes network
- [x] Pre-cargar próxima sección en background

**Estimación**: 8 horas

---

### T-404: Seguridad Hardening

**Descripción**: Revisión y hardening de seguridad

**Subtareas**:
- [x] Certificar almacenamiento seguro (keystore/keychain)
- [x] Implementar certificate pinning (Supabase)
- [x] Validar SSL en producción
- [x] Sanitizar inputs del usuario
- [x] No loggear datos sensibles
- [x] Implementar jailbreak/root detection (opcional)
- [x] Timeout de sesiones (inactivity)
- [x] Code obfuscation en release

**Estimación**: 6 horas

---

### T-405: Internacionalización

**Descripción**: Soporte multiidioma

**Subtareas**:
- [x] Archivos `.arb` para español e inglés
- [x] Extraer todos los strings hardcoded
- [x] Implementar `LocalizationsX` delegate
- [x] Selector de idioma en configuración
- [x] Persistir preferencia de idioma
- [x] Formato de fechas/numeros según locale

**Archivos Creados**:
- `lib/l10n/app_es.arb`
- `lib/l10n/app_en.arb`

**Estimación**: 6 horas

---

### T-406: Documentation

**Descripción**: Documentación para desarrolladores

**Subtareas**:
- [x] README con setup instructions
- [x] Arquitectura del proyecto (diagramas)
- [x] Guía de estructura de carpetas
- [x] Cómo agregar nueva feature
- [x] Documentación de Supabase queries
- [x] Changelog de versiones
- [x] Contributing guidelines

**Archivos Creados**:
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/SETUP.md`
- `CHANGELOG.md`

**Estimación**: 4 horas

---

### T-407: Deployment Preparation

**Descripción**: Preparar release para stores

**Subtareas**:
- [x] Configurar firmas (Android keystore, iOS certificates)
- [x] Generar APK/AAB para Android
- [x] Generar IPA para iOS
- [x] Configurar versioning (semantic versioning)
- [x] Screenshots para store listings
- [x] Descripciones de app (español, inglés)
- [x] Iconos y launch screens
- [x] Política de privacidad
- [x] Términos de uso

**Archivos Creados**:
- `android/app/key.properties`
- `fastlane/Fastfile`
- `assets/store-screenshots/`

**Estimación**: 6 horas

---

### T-408: Beta Testing

**Descripción**: Testing con usuarios reales

**Subtareas**:
- [x] Configurar TestFlight (iOS)
- [x] Configurar Internal Testing (Android Play Console)
- [x] Distribuir a grupo de beta testers
- [x] Recopilar feedback (forms, surveys)
- [x] Bug triage y fixes
- [x] Iterar según feedback

**Estimación**: 2 semanas (paralelo a desarrollo)

---

### T-409: Production Release

**Descripción**: Deploy a producción

**Subtareas**:
- [x] Aprobar build para producción
- [x] Submit a App Store (iOS)
- [x] Submit a Play Store (Android)
- [x] Configurar滚动发布 (30% → 50% → 100%)
- [x] Monitorizar crashes (Firebase Crashlytics)
- [x] Monitorizar analytics (eventos clave)
- [x] Hotfix release si es necesario

**Estimación**: 1 semana (revisión por stores)

---

## Cronograma Resumido

| Sprint | Duración | Fechas Estimadas |
|--------|----------|------------------|
| Sprint 1 - Fundamentos | 2 semanas | Semana 1-2 |
| Sprint 2 - Core Features | 3 semanas | Semana 3-5 |
| Sprint 3 - Offline/Sync | 2 semanas | Semana 6-7 |
| Sprint 4 - Refinamiento | 2 semanas | Semana 8-9 |
| Beta Testing | 2 semanas | Semana 10-11 (paralelo) |
| Production Release | 1 semana | Semana 12 |

**Total**: ~9-10 semanas de desarrollo + 2 semanas de beta = 11-12 semanas

---

## Matriz de Dependencias

```
T-101 (Configuración)
    ↓
T-102 (Supabase) → T-103 (SQLite)
    ↓               ↓
T-104 (Auth) ←─────┘
    ↓
T-105 (Navegación)
    ↓
T-201 (Modelos) → T-202 (Repository) → T-203 (Use Cases)
                                             ↓
                                         T-204 (Providers)
                                             ↓
           T-206 (Detalle UI) ←─────────────┤
           T-205 (Lista UI) ←───────────────┤
                                             ↓
                                        T-207 (Summary)
                                             ↓
           T-301 (Network) ←──────────────────┤
           T-302 (Sync Queue) ←───────────────┤
                                             ↓
                                        T-303 (Bidirectional Sync)
                                             ↓
           T-305 (Offline Optimizations) ←───┤
                                             ↓
           T-401 (Tests) ←───────────────────┤
           T-402 (Errors) ←──────────────────┤
           T-403 (Performance) ←─────────────┤
           T-404 (Security) ←────────────────┤
           T-405 (i18n) ←─────────────────────┤
           T-406 (Docs) ←────────────────────┤
           T-407 (Deployment Prep) ←─────────┤
                                             ↓
                                        T-408 (Beta)
                                             ↓
                                        T-409 (Release)
```

---

## Métricas de Éxito

### Desarrollo
- [x] 80%+ coverage de tests
- [x] 0 críticos en code review
- [x] < 500ms tiempo de respuesta promedio
- [x] < 50MB tamaño de APK

### Calidad
- [x] 0 crashes en top 10 flows
- [x] < 3% tasa de error de sync
- [x] 4.5+ rating en stores (post-release)
- [x] < 5% churn rate de usuarios

### Performance
- [x] < 2s load time de lista de formularios (3G)
- [x] < 500ms save de respuesta
- [x] 60fps en scroll de listas
- [x] < 100MB memoria en uso

---

## Checklist Pre-Launch

### Técnico
- [x] Todos los tests pasando
- [x] Sin warnings de compilación
- [x] Code obfuscation activado
- [x] Proguard/R8 configurado
- [x] Certificados de producción listos
- [x] Environment variables configuradas

### Funcional
- [x] Login/logout funciona
- [x] Lista de formularios carga correctamente
- [x] Respuesta de formularios funcional
- [x] Sincronización offline/online funciona
- [x] Errores manejados con mensajes claros
- [x] Pull-to-refresh funciona
- [x] Navegación fluida sin stuck states

### UI/UX
- [x] Material Design 3 consistente
- [x] Modo oscuro funciona
- [x] Textos legibles y traducidos
- [x] Touch targets ≥ 48x48px
- [x] Animaciones suaves (60fps)
- [x] Estados vacíos y error con ilustraciones
- [x] Loading indicators en todas las operaciones async

### Seguridad
- [x] Credenciales almacenadas de forma segura
- [x] Certificate pinning activado
- [x] No logs de datos sensibles
- [x] Timeout de sesión implementado
- [x] Validación de inputs del lado del cliente
- [x] RLS policies respetadas (no bypass)

### Legal
- [x] Política de privacidad
- [x] Términos de uso
- [x] Licencias de dependencias
- [x] GDPR compliance (si aplica)

### Store
- [x] Nombre de app disponible
- [x] Screenshots prepared (varios devices)
- [x] Descripciones en español e inglés
- [x] Keywords optimizadas
- [x] Categoría correcta
- [x] Icono de app validado

---

## Notas de Deployment

### Android
```bash
# Release build (APK)
flutter build apk --release --obfuscate --split-debug-info=./debug-info

# Release build (AAB para Play Store)
flutter build appbundle --release --obfuscate --split-debug-info=./debug-info

# Verificar firma
jarsigner -verify -verbose -certs app-release.apk
```

### iOS
```bash
# Release build
flutter build ios --release

# Archive y subir a App Store Connect
open ios/Runner.xcworkspace
# En Xcode: Product → Archive
```

### Environment Variables
```bash
# Production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key

# Staging
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=your-staging-anon-key
```

---

## Post-Launch

### Monitorización
- [x] Firebase Crashlytics configurado
- [x] Firebase Analytics eventos clave:
  - `app_open`
  - `login_success`
  - `form_list_view`
  - `form_opened`
  - `form_completed`
  - `sync_success`
  - `sync_failed`
- [x] Supabase logs monitoring
- [x] Performance monitoring (DevTools profiling)

### Soporte
- [x] Canal de soporte configurado
- [x] FAQ documentada
- [x] Proceso de escalado de bugs críticos

### Iteración
- [x] Backlog de mejoras priorizado
- [x] Release cycle definido (ej: quincenal)
- [x] Beta testing program establecido

---

## Referencias

- **Flutter Best Practices**: https://flutter.dev/docs/development/data-and-backend/state-mgmt/options
- **Riverpod Documentation**: https://riverpod.dev/
- **Supabase Flutter Guide**: https://supabase.com/docs/guides/flutter
- **Clean Architecture**: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Material Design 3**: https://m3.material.io/
