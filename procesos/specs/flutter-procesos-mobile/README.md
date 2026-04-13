# Guadiana Procesos - App Móvil Flutter

**Especificación Completa del Módulo de Procesos**

## Resumen Ejecutivo

Aplicación móvil nativa (Flutter) para el módulo de Procesos de Guadiana, que permite a los usuarios de campo (asesores, operarios, auditores) completar formularios asignados desde la plataforma web, registrar respuestas y monitorear su progreso en tiempo real.

**Características Principales:**
- ✅ Autenticación de usuarios (login exclusivo)
- ✅ Consulta de formularios asignados (por usuario o rol)
- ✅ Completado de formularios en modo online/offline
- ✅ Visualización de progreso de formularios
- ✅ Resumen de respuestas capturadas
- ✅ Sincronización automática con Supabase

## Documentos de Especificación

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [requirement.md](./requirement.md) | Requisitos funcionales y no funcionales | ✅ Completo |
| [design.md](./design.md) | Diseño técnico y arquitectura | ✅ Completo |
| [tasks.md](./tasks.md) | Plan de desarrollo y tareas | ✅ Completo |

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     Plataforma Web (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Formularios  │  │ Asignaciones │  │  Resultados  │          │
│  │   (CRUD)     │  │   (CRUD)     │  │  (Análisis)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↕ Supabase (PostgreSQL + Auth)
┌─────────────────────────────────────────────────────────────────┐
│              App Móvil Flutter (Este Proyecto)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Login     │  │  Mis Formular.│  │   Responder   │          │
│  │   (Auth)     │  │   (Lista)     │  │   (Form)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Flutter 3.19+
- **Lenguaje**: Dart
- **Gestión de Estado**: Riverpod + Provider
- **Navegación**: GoRouter
- **UI**: Material Design 3

### Backend/Services
- **Backend as a Service**: Supabase
- **Base de Datos Local**: SQLite (sqflite)
- **Auth**: Supabase Auth
- **Network**: connectivity_plus

### DevOps
- **CI/CD**: GitHub Actions (propuesto)
- **Error Tracking**: Firebase Crashlytics (propuesto)
- **Analytics**: Firebase Analytics (propuesto)

## Integración con Schema Existente

La app Flutter se integra con las siguientes tablas existentes en Supabase:

### Tablas de Formularios (Read-Only en App)
- `form_surveys`: Definición de formularios
- `form_sections`: Secciones de formularios
- `form_questions`: Preguntas de formularios
- `form_question_options`: Opciones de respuesta

### Tablas de Asignaciones (Read-Only en App)
- `form_assignments`: Asignaciones a usuarios/roles

### Tablas de Respuestas (Read/Write en App)
- `resp_survey_runs`: Ejecuciones de formularios
- `resp_answers`: Respuestas individuales

### Tablas de Permisos (Respetadas desde App)
- `profiles`: Perfiles de usuario
- `platform_modules`: Módulos y permisos

**Nota**: No se requieren modificaciones al schema existente.

## Cronograma de Desarrollo

| Sprint | Duración | Objetivo |
|--------|----------|----------|
| Sprint 1 | 2 semanas | Configuración, Auth, Navegación |
| Sprint 2 | 3 semanas | Lista de formularios, Respuesta |
| Sprint 3 | 2 semanas | Offline, Sincronización |
| Sprint 4 | 2 semanas | Testing, Optimización |
| Beta | 2 semanas | Testing con usuarios |
| **Total** | **11-12 semanas** | **MVP listo** |

## Casos de Uso Principales

### UC-001: Iniciar Sesión
1. Usuario abre la app
2. Ingresa email y contraseña
3. Sistema valida con Supabase
4. Navega a "Mis Formularios"

### UC-002: Consultar Formularios
1. Usuario ve lista de formularios asignados
2. Sistema filtra por usuario y rol
3. Muestra progreso de cada formulario

### UC-003: Responder Formulario
1. Usuario selecciona formulario
2. Responde preguntas por tipo
3. Sistema guarda automáticamente
4. Usuario completa y confirma
5. Sistema sincroniza con Supabase

## Características Técnicas Destacadas

### Offline-First Architecture
- SQLite local para cache
- Cola de sincronización
- Detección automática de conectividad
- Reintentos con backoff exponencial

### Gestión de Estado Reactiva
- Riverpod para state management
- Providers para: Auth, Forms, Sync
- Streams para conectividad
- Cálculo reactivo de progreso

### Seguridad
- Almacenamiento seguro de credenciales
- Tokens con expiración
- RLS policies respetadas
- Certificate pinning (propuesto)

### UI/UX
- Material Design 3
- Modo oscuro
- Internacionalización (ES/EN)
- Accesibilidad (textos legibles, touch targets)

## Requisitos Funcionales

### [REQ-001] Autenticación
- Login con email/contraseña
- Validación con Supabase Auth
- Sesión persistente

### [REQ-002] Consulta de Formularios
- Lista de asignaciones por usuario/rol
- Filtrado por fecha y estado
- Pull-to-refresh

### [REQ-003] Progreso
- Barra de progreso visual
- Cálculo automático de %
- Estados: No iniciado, En progreso, Completado

### [REQ-004] Completado de Formularios
- Renderizado dinámico por tipo de pregunta
- Guardado automático
- Validación de requeridos
- Soporte offline

### [REQ-005] Resumen
- Vista pre-confirmación
- Listado de respuestas
- Opción de editar

### [REQ-006] Sincronización
- Detección de conexión
- Sincronización automática
- Cola de pendientes
- Reintentos automáticos

## Métricas de Éxito

### Desarrollo
- 80%+ coverage de tests
- < 500ms tiempo de respuesta
- < 50MB tamaño de APK

### Calidad
- 0 crashes en top 10 flows
- < 3% tasa de error de sync
- 4.5+ rating en stores

### Performance
- < 2s load time (3G)
- < 500ms save de respuesta
- 60fps en scroll de listas

## Próximos Pasos

1. **Aprobar especificación**: Revisar documentos y aprobar
2. **Setup de proyecto**: Inicializar repositorio Flutter
3. **Comenzar Sprint 1**: Configuración y Auth
4. **Iteración**: Sprints quinceninales con demos
5. **Beta Testing**: Distribución a grupo seleccionado
6. **Production Release**: Deploy a stores

## Documentación Adicional

- **Requisitos**: [requirement.md](./requirement.md)
- **Diseño**: [design.md](./design.md)
- **Tareas**: [tasks.md](./tasks.md)
- **Schema BD**: Ver migraciones en `/web/supabase/migrations/20260320000001_create_checklists_schema.sql`

## Contacto

Para dudas o aclaraciones sobre esta especificación, consultar con el equipo de desarrollo.

---

**Versión**: 1.0
**Última Actualización**: 2025-04-13
**Estado**: ✅ Especificación Completa - Pendiente Aprobación
