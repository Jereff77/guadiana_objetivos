# Especificación de Requisitos - Módulo de Procesos (Flutter App)

**Proyecto**: Aplicación Móvil Guadiana - Módulo de Procesos
**Plataforma**: Flutter (iOS/Android)
**Fecha**: 2025-04-13
**Versión**: 1.0

---

## 1. Visión General

### 1.1 Propósito

La aplicación móvil Guadiana - Módulo de Procesos es una aplicación nativa desarrollada en Flutter que permite a los usuarios de campo (asesores, operarios, auditores) completar formularios asignados desde la plataforma web, registrar respuestas y monitorear su progreso en tiempo real.

### 1.2 Alcance

**Incluye:**
- Autenticación de usuarios (login exclusivo)
- Consulta de formularios asignados (por usuario o rol)
- Completado de formularios en modo online/offline
- Visualización de progreso de formularios
- Resumen de respuestas capturadas
- Sincronización de datos con Supabase

**Excluye (se maneja en plataforma web):**
- Registro de nuevos usuarios
- Creación/edición de formularios
- Gestión de asignaciones
- Reportes avanzados y exportación

### 1.3 Contexto del Sistema

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

---

## 2. Requisitos Funcionales

### [REQ-001] Autenticación de Usuario

El sistema debe permitir que los usuarios existentes inicien sesión en la aplicación móvil.

**Descripción:**
- Los usuarios se autentican utilizando email y contraseña
- Las credenciales se validan contra Supabase Auth
- El registro de nuevos usuarios NO está disponible en la app (solo web)

**Criterios de Aceptación:**
- [x] Pantalla de login con campos email/contraseña
- [x] Validación de formato de email
- [x] Manejo de errores (credenciales inválidas, red no disponible)
- [x] Sesión persistente (no requiere login en cada apertura)
- [x] Opción de cerrar sesión

**Prioridad:** Alta

---

### [REQ-002] Consulta de Formularios Asignados

El sistema debe mostrar al usuario una lista de formularios que le han sido asignados directamente o a través de su rol.

**Descripción:**
- La app consulta la tabla `form_assignments` filtrando por:
  - `assignee_user_id` = usuario actual, OR
  - `assignee_role` = rol del usuario actual
- Solo muestra formularios con `status = 'published'`
- Solo muestra asignaciones con `is_active = true`
- Filtra por fecha si `start_date` y `end_date` están definidos

**Criterios de Aceptación:**
- [x] Lista de formularios con: nombre, descripción, fecha de asignación, estado de avance
- [x] Indicador visual de formularios completados vs pendientes
- [x] Pull-to-refresh para actualizar la lista
- [x] Manejo de estado vacío ("No tienes formularios asignados")
- [x] Filtro por estado (pendientes, en progreso, completados)

**Prioridad:** Alta

**Tablas Involucradas:**
- `form_assignments`
- `form_surveys`
- `profiles`

---

### [REQ-003] Visualización de Progreso

El sistema debe mostrar el progreso de completado de cada formulario asignado.

**Descripción:**
- Calcula el porcentaje de preguntas respondidas vs totales
- Para cada `form_assignment`, busca el `resp_survey_runs` más reciente del usuario
- Si existe un run `in_progress`, calcula: (preguntas respondidas / total preguntas) × 100
- Si no hay run, muestra 0% o "No iniciado"

**Criterios de Aceptación:**
- [x] Barra de progreso visual en cada item de la lista
- [x] Indicador textual (ej: "45% completado")
- [x] Diferenciación visual entre:
  - No iniciado (0%)
  - En progreso (1-99%)
  - Completado (100%)

**Prioridad:** Media

**Tablas Involucradas:**
- `resp_survey_runs`
- `resp_answers`
- `form_questions`

---

### [REQ-004] Completado de Formularios

El sistema debe permitir al usuario responder un formulario asignado pregunta por pregunta.

**Descripción:**
- El usuario abre un formulario y ve las secciones y preguntas organizadas
- Cada pregunta se renderiza según su tipo:
  - `boolean`: Toggle sí/no
  - `single_choice`: Radio buttons
  - `multiple_choice`: Checkboxes
  - `text_short`: TextField una línea
  - `text_long`: TextField multilinea
  - `number`: TextField numérico
  - `date`: Selector de fecha
- Las respuestas se guardan localmente (SQLite) y se sincronizan cuando hay conexión

**Criterios de Aceptación:**
- [x] Navegación entre secciones (tabs o accordion)
- [x] Validación de campos requeridos antes de guardar
- [x] Guardado automático de respuestas (draft)
- [x] Botón "Completar" para finalizar el formulario
- [x] Confirmación antes de completar
- [x] Indicador de preguntas obligatorias (*)
- [x] Soporte offline (almacenamiento local)

**Prioridad:** Alta

**Tablas Involucradas:**
- `form_surveys`
- `form_sections`
- `form_questions`
- `form_question_options`
- `resp_survey_runs`
- `resp_answers`

---

### [REQ-005] Resumen de Respuestas

El sistema debe mostrar un resumen de las respuestas capturadas para un formulario completado.

**Descripción:**
- Al completar un formulario, se muestra un resumen
- Lista todas las preguntas con sus respuestas
- Permite revisar antes de confirmar envío definitivo
- Muestra fecha y hora de completado

**Criterios de Aceptación:**
- [x] Vista de resumen post-completado
- [x] Lista de preguntas con respuestas dadas
- [x] Opción de "Editar" para modificar respuestas
- [x] Opción de "Confirmar" para envío final
- [x] Indicador visual de sincronización (pendiente/sincronizado)

**Prioridad:** Media

**Tablas Involucradas:**
- `resp_survey_runs`
- `resp_answers`
- `form_questions`

---

### [REQ-006] Sincronización de Datos

El sistema debe sincronizar las respuestas capturadas offline con Supabase cuando hay conexión.

**Descripción:**
- La app detecta conectividad y sincroniza automáticamente
- Usa una cola local para respuestas pendientes
- Inserta/actualiza en `resp_survey_runs` y `resp_answers`
- Maneja conflictos si el run ya existe en el servidor

**Criterios de Aceptación:**
- [x] Detección automática de conexión
- [x] Sincronización en background
- [x] Indicador visual de sincronización pendiente
- [x] Manejo de errores de sincronización
- [x] Reintentos automáticos con backoff
- [x] Sincronización manual con botón "Actualizar"

**Prioridad:** Alta

---

### [REQ-007] Gestión de Sesión

El sistema debe gestionar la sesión del usuario de forma segura.

**Descripción:**
- Usa Supabase Auth para gestión de tokens
- Refresca tokens automáticamente
- Cierra sesión en caso de token expirado
- Permite cerrar sesión manualmente

**Criterios de Aceptación:**
- [x] Refresco automático de tokens
- [x] Manejo de sesiones expiradas
- [x] Cierre de sesión con limpieza de datos locales
- [x] Opción de "Cerrar sesión" en menú de perfil

**Prioridad:** Alta

---

## 3. Requisitos No Funcionales

### [NFR-001] Rendimiento

- La lista de formularios debe cargar en menos de 2 segundos (3G)
- El guardado de respuestas debe ser instantáneo (< 500ms)
- La sincronización no debe bloquear la UI

### [NFR-002] Usabilidad

- Interfaz intuitiva siguiendo guidelines Material Design/iOS
- Soporte para modo oscuro
- Accesibilidad: textos legibles, contraste suficiente, touch targets mínimos de 48x48px

### [NFR-003] Confiabilidad

- La app debe funcionar offline (modo lectura/escritura local)
- No debe perder datos si la app se cierra inesperadamente
- Recuperación automática de errores de sincronización

### [NFR-004] Seguridad

- Credenciales almacenadas de forma segura (keychain/keystore)
- Comunicación cifrada con Supabase (HTTPS)
- Tokens de acceso con expiración adecuada
- Sin almacenamiento de datos sensibles en logs

### [NFR-005] Compatibilidad

- **iOS**: 13.0 o superior
- **Android**: 6.0 (API 23) o superior
- **Flutter**: 3.19 o superior

---

## 4. Restricciones

### [CON-001] Registro de Usuarios

El registro de nuevos usuarios NO está permitido en la app móvil. Debe realizarse desde la plataforma web.

### [CON-002] Creación de Formularios

La creación, edición y eliminación de formularios es exclusiva de la plataforma web.

### [CON-003] Permisos

La app móvil respetará el sistema de permisos existente en Supabase (`has_permission` function).

### [CON-004] Estructura de Base de Datos

No se pueden modificar las tablas existentes. Las nuevas tablas deben integrarse con el schema actual.

---

## 5. Suposiciones

### [ASM-001] Infraestructura Existente

- Supabase está configurado y funcionando
- Las tablas `form_surveys`, `form_assignments`, `resp_survey_runs`, etc. están creadas
- El sistema de permisos `has_permission` está operativo
- Las RLS policies están aplicadas

### [ASM-002] Usuarios Existentes

- Los usuarios ya están registrados en la plataforma web
- Todos los usuarios tienen un rol asignado en `profiles.role`

### [ASM-003] Asignaciones

- Las asignaciones se crean desde la web
- Los usuarios tienen al menos una asignación activa

### [ASM-004] Conectividad

- Los usuarios tendrán conexión esporádica
- Se deben poder capturar formularios offline

---

## 6. Casos de Uso

### UC-001: Iniciar Sesión

**Actor:** Usuario (asesor, operario, auditor)

**Precondiciones:**
- Usuario registrado en plataforma web
- App instalada en dispositivo

**Flujo Principal:**
1. Usuario abre la app
2. Sistema muestra pantalla de login
3. Usuario ingresa email y contraseña
4. Sistema valida credenciales con Supabase
5. Sistema navega a pantalla "Mis Formularios"

**Flujos Alternativos:**
- 4a. Credenciales inválidas → Muestra error, permite reintentar
- 4b. Sin conexión → Muestra error, permite reintentar o usar offline

**Postcondiciones:**
- Usuario autenticado
- Token de acceso almacenado

---

### UC-002: Consultar Formularios Asignados

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario autenticado

**Flujo Principal:**
1. Sistema consulta `form_assignments` para el usuario
2. Sistema filtra asignaciones activas
3. Sistema carga formularios publicados
4. Sistema calcula progreso de cada formulario
5. Sistema muestra lista de formularios

**Flujos Alternativos:**
- 1a. Sin conexión → Muestra datos cacheados con indicador de offline
- 5a. No hay formularios → Muestra estado vacío

**Postcondiciones:**
- Lista de formularios visible
- Progreso calculado y mostrado

---

### UC-003: Responder Formulario

**Actor:** Usuario autenticado

**Precondiciones:**
- Usuario autenticado
- Formulario asignado y activo

**Flujo Principal:**
1. Usuario selecciona formulario de la lista
2. Sistema carga estructura del formulario (secciones y preguntas)
3. Usuario responde preguntas una por una
4. Sistema guarda respuestas localmente (SQLite)
5. Usuario completa todas las preguntas requeridas
6. Usuario presiona "Completar"
7. Sistema muestra resumen de respuestas
8. Usuario confirma envío
9. Sistema marca run como `completed`
10. Sistema sincroniza con Supabase

**Flujos Alternativos:**
- 6a. Faltan preguntas requeridas → Muestra validación, impide completar
- 10a. Sin conexión → Marca como pendiente de sincronización

**Postcondiciones:**
- Respuestas guardadas
- Run completado o pendiente de sincronización

---

## 7. Matriz de Trazabilidad

| ID | Requisito | UC Relacionado | Prioridad |
|----|-----------|----------------|-----------|
| REQ-001 | Autenticación | UC-001 | Alta |
| REQ-002 | Consulta de Formularios | UC-002 | Alta |
| REQ-003 | Visualización de Progreso | UC-002 | Media |
| REQ-004 | Completado de Formularios | UC-003 | Alta |
| REQ-005 | Resumen de Respuestas | UC-003 | Media |
| REQ-006 | Sincronización de Datos | UC-003 | Alta |
| REQ-007 | Gestión de Sesión | UC-001 | Alta |

---

## 8. Historias de Usuario

### US-001: Login de Usuario

**Como** usuario registrado
**Quiero** iniciar sesión con mis credenciales
**Para** acceder a mis formularios asignados

**Criterios de Aceptación:**
- Pantalla de login funcional
- Validación de email y contraseña
- Recordar sesión
- Cerrar sesión

---

### US-002: Ver Mis Formularios

**Como** usuario de campo
**Quiero** ver una lista de formularios asignados
**Para** saber qué debo completar

**Criterios de Aceptación:**
- Lista de formularios con nombre y descripción
- Indicador de progreso
- Filtros por estado
- Pull-to-refresh

---

### US-003: Completar Formulario

**Como** usuario de campo
**Quiero** responder un formulario pregunta por pregunta
**Para** registrar la información requerida

**Criterios de Aceptación:**
- Ver secciones y preguntas
- Responder según tipo de pregunta
- Guardado automático
- Validación de requeridos
- Completar formulario

---

### US-004: Trabajar Offline

**Como** usuario de campo
**Quiero** poder capturar formularios sin internet
**Para** no perder información en zonas sin conexión

**Criterios de Aceptación:**
- App funcional offline
- Almacenamiento local de respuestas
- Sincronización automática al reconectar
- Indicador de sincronización pendiente
