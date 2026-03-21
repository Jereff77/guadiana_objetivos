# PRD – Aplicación Móvil Android (Flutter) · Guadiana Checklists

**Versión**: 1.0
**Fecha**: 2026-03-21
**Complemento de**: Plataforma Web Next.js (MVP completado)
**Backend**: Supabase (esquema y RLS ya implementados)

---

## 1. Resumen Ejecutivo

### Contexto
La plataforma web de Guadiana Checklists ya está completa. Los administradores pueden diseñar formularios de auditoría, publicarlos y asignarlos a usuarios o roles. El eslabón faltante es la **aplicación móvil Android** que permite a auditores, asesores y operarios recibir esos formularios publicados y llenarlos en campo.

### Problema
Los auditores actualmente llenan checklists en papel o Excel, lo que genera:
- Pérdida de información y trazabilidad.
- Imposibilidad de consolidar resultados en tiempo real.
- Falta de estandarización entre sucursales.

### Solución
Una aplicación Android nativa en Flutter que:
1. Autentica al usuario con Supabase Auth.
2. Muestra los formularios asignados a ese usuario (ya publicados desde la web).
3. Permite llenar cada checklist con una UX clara y optimizada para uso en taller.
4. Envía las respuestas a Supabase en tiempo real.
5. Mantiene un historial de los checklists completados.

### Objetivo
Cerrar el ciclo completo de auditoría: **diseño en web → ejecución en app → análisis en web**.

---

## 2. Usuarios Objetivo

### Primarios (quienes usan la app)

| Rol | Descripción | Contexto de uso |
|-----|-------------|-----------------|
| **Auditor** | Aplica las auditorías formalmente asignadas a su perfil. | En campo, en sucursal, con el teléfono en mano. |
| **Asesor de ventas** | Completa checklists de KPIs de servicio asignados a su rol. | Durante o después de atender clientes. |
| **Operario de taller** | Completa checklists operativos de su área. | En el taller, con las manos posiblemente sucias — botones grandes. |

### Secundarios (no usan la app, pero se benefician)
- **Administrador corporativo**: Ve los resultados enviados desde la app en la plataforma web.
- **Jefe de sucursal**: Monitorea el cumplimiento de su equipo desde la web.

---

## 3. Flujo Principal de la Aplicación

```
[Login] → [Home: Lista de checklists asignados] → [Detalle del checklist]
       → [Ejecución: sección por sección] → [Validación] → [Envío]
       → [Confirmación] → [Historial]
```

El usuario nunca diseña formularios en la app — eso es exclusivo de la web. La app es **solo consumo y captura**.

---

## 4. Features del MVP (Must-Have)

### F-01 · Autenticación
- Login con correo electrónico y contraseña (Supabase Auth).
- Sesión persistente con refresh automático de token.
- Logout desde la app.
- Manejo de errores (credenciales incorrectas, sin conexión).

### F-02 · Lista de Checklists Asignados
- Al iniciar sesión, el usuario ve la lista de formularios publicados asignados a:
  - Su `user_id` directamente.
  - Su `role` (ej. todos los asesores).
- Solo muestra asignaciones activas y dentro del rango de vigencia.
- Cada card muestra: nombre del formulario, categoría, descripción corta y fecha límite.
- Filtro básico por categoría.

### F-03 · Pantalla de Inicio de Checklist
- Antes de empezar, el usuario ve el resumen: nombre, descripción, número de secciones y preguntas.
- Botón "Comenzar" que crea el registro `resp_survey_runs` con `status = 'in_progress'`.

### F-04 · Ejecución del Formulario
- Renderiza todas las secciones del formulario con sus preguntas.
- Encabezado de sección en azul corporativo `#004B8D`.
- Soporte completo para todos los tipos de pregunta:
  - **Boolean (Sí/No)**: Dos botones tipo toggle. Azul = seleccionado, gris = no seleccionado.
  - **Opción única**: Botones de radio visualmente claros.
  - **Opción múltiple**: Checkboxes con labels legibles.
  - **Texto corto**: Campo de texto de una línea.
  - **Texto largo**: Campo de texto multilínea con scroll.
  - **Número**: Teclado numérico, acepta decimales.
  - **Fecha**: Date picker nativo.
- Campo de "Acciones a seguir" (comentario opcional) visible bajo cada pregunta.
- Preguntas obligatorias marcadas con `*`.
- `help_text` de la pregunta visible como texto auxiliar bajo el campo.
- Navegación entre secciones (scroll continuo o paginado por sección).

### F-05 · Validación y Envío
- Al pulsar "Enviar", valida que todas las preguntas obligatorias tengan respuesta.
- Si hay errores: muestra un resumen de campos pendientes y hace scroll a la primera pregunta sin responder.
- Al enviar exitosamente:
  - Guarda todas las respuestas en `resp_answers`.
  - Actualiza `resp_survey_runs.status = 'completed'` y `completed_at = now()`.
  - Muestra pantalla de confirmación.

### F-06 · Historial de Checklists Completados
- Pantalla "Mis checklists" con las ejecuciones completadas del usuario autenticado.
- Ordenadas por fecha descendente.
- Card muestra: nombre del formulario, fecha de envío, estado (badge).
- Al tocar una ejecución, abre vista de solo lectura con todas las respuestas y comentarios.

### F-07 · Perfil y Cierre de Sesión
- Pantalla de perfil con nombre del usuario y su sucursal.
- Botón de cerrar sesión.

---

## 5. Features Fuera del MVP (Contempladas para Futuro)

| Feature | Justificación para diferir |
|---------|---------------------------|
| **Modo offline con sincronización** | Requiere SQLite local + lógica de sync. Complejidad alta. |
| **Captura de evidencia fotográfica** | Requiere Supabase Storage configurado para evidencias. |
| **Borrador automático** | Deseable pero no crítico para v1 — asumimos conexión estable. |
| **Lógica condicional** | Mostrar/ocultar preguntas según respuestas. Requiere motor de reglas. |
| **Notificaciones push** | Para alertas de formularios nuevos asignados o vencidos. |
| **Soporte iOS** | El cliente usa Android. iOS queda pendiente para Iteración 2. |

---

## 6. Requerimientos No Funcionales

### Rendimiento
- La lista de checklists debe cargar en menos de 2 segundos en conexión 4G.
- Un formulario de hasta 200 preguntas debe renderizar sin lag visible.
- El envío de respuestas debe completarse en menos de 5 segundos.

### Usabilidad
- Diseñada para uso en taller: botones mínimos de 48dp de alto.
- Sin jerga técnica en la UI — textos en español, claros y directos.
- No más de 3 toques desde el login hasta empezar a responder un checklist.

### Seguridad
- Todo el tráfico sobre HTTPS (Supabase garantiza esto).
- El token de sesión se almacena en `flutter_secure_storage`.
- Las políticas RLS en Supabase garantizan que el usuario solo ve SUS asignaciones.
- La app no puede acceder a formularios no asignados a su perfil.

### Compatibilidad
- Android 8.0 (API 26) o superior.
- Pantallas de 5" a 6.7" — layout adaptable.

---

## 7. Diseño Visual y Branding

### Paleta de Colores Corporativa
| Token | Hex | Uso |
|-------|-----|-----|
| `brandBlue` | `#004B8D` | AppBar, encabezados de sección, botón primario activo |
| `brandOrange` | `#FF8F1C` | Botón "Enviar", acentos, botón Sí seleccionado |
| `brandBlueDark` | `#002D72` | Texto en AppBar |
| `backgroundGrey` | `#F5F5F5` | Fondo de pantallas |
| `white` | `#FFFFFF` | Cards, campos de entrada |

### Tipografía
- Fuente: Roboto (default Flutter/Material).
- Títulos de sección: 16sp, bold, blanco sobre fondo azul.
- Labels de preguntas: 14sp, medium.
- Texto auxiliar: 12sp, gris.

### Componentes Clave
- **AppBar**: Fondo `#004B8D`, título blanco, ícono de usuario.
- **Card de checklist**: Fondo blanco, borde izquierdo naranja de 4px, sombra suave.
- **Encabezado de sección**: Barra `#004B8D`, texto blanco, número de sección.
- **Botón Sí**: Cuando seleccionado → fondo `#004B8D`, texto blanco. No seleccionado → gris claro.
- **Botón No**: Cuando seleccionado → fondo `#D32F2F` (rojo), texto blanco. No seleccionado → gris claro.
- **Botón Enviar**: `#FF8F1C`, texto blanco, ancho completo.
- **Badge completado**: Verde `#388E3C`.
- **Badge en progreso**: Naranja `#FF8F1C`.

---

## 8. Arquitectura Técnica

### Stack
- **Framework**: Flutter 3.x (stable channel)
- **Lenguaje**: Dart
- **Backend**: Supabase (ya configurado — tablas, RLS, Auth operativos)
- **State Management**: Riverpod (flutter_riverpod)
- **Navegación**: GoRouter
- **Cliente Supabase**: supabase_flutter
- **Almacenamiento seguro**: flutter_secure_storage
- **Inyección de dependencias**: Riverpod providers

### Estructura de Carpetas (Clean Architecture simplificada)
```
lib/
├── main.dart
├── core/
│   ├── constants/          # Colores, strings, rutas
│   ├── theme/              # ThemeData de Guadiana
│   └── supabase/           # Cliente Supabase singleton
├── features/
│   ├── auth/
│   │   ├── data/           # Supabase Auth calls
│   │   ├── domain/         # AuthRepository interface
│   │   └── presentation/   # LoginScreen, providers
│   ├── assignments/
│   │   ├── data/           # Queries form_assignments + form_surveys
│   │   ├── domain/         # Assignment model
│   │   └── presentation/   # HomeScreen, ChecklistCard
│   ├── execution/
│   │   ├── data/           # Queries secciones, preguntas, opciones
│   │   ├── domain/         # Survey, Section, Question, Answer models
│   │   └── presentation/   # ExecutionScreen, question widgets
│   └── history/
│       ├── data/           # Queries resp_survey_runs del user
│       └── presentation/   # HistoryScreen, RunDetailScreen
└── shared/
    └── widgets/            # Componentes UI reutilizables
```

### Integración con Supabase
El esquema de base de datos está completo. La app consumirá:

| Tabla | Operación | Descripción |
|-------|-----------|-------------|
| `form_assignments` | SELECT | Obtener asignaciones activas del usuario/rol |
| `form_surveys` | SELECT | Obtener datos del formulario asignado |
| `form_sections` | SELECT | Obtener secciones ordenadas |
| `form_questions` | SELECT | Obtener preguntas por sección |
| `form_question_options` | SELECT | Obtener opciones de respuesta |
| `resp_survey_runs` | INSERT / UPDATE | Crear y completar la ejecución |
| `resp_answers` | INSERT | Guardar respuestas individuales |
| `app_profiles` | SELECT | Obtener nombre y sucursal del usuario |

---

## 9. Métricas de Éxito

| Métrica | Meta |
|---------|------|
| Adopción | 100% de auditores usan la app (no papel) en el primer mes |
| Tiempo de llenado | Reducción del 50% vs formato papel |
| Tasa de envío | > 95% de checklists iniciados son enviados (no abandonados) |
| Errores de envío | < 1% de ejecuciones fallan por error técnico |
| Calificación de usabilidad | > 4/5 en encuesta interna post-piloto |

---

## 10. Suposiciones y Dependencias

- El backend (Supabase) ya está 100% operativo — no se requieren cambios en el esquema.
- Los usuarios ya tienen cuentas creadas en Supabase Auth con su rol asignado en `app_profiles`.
- Los formularios son diseñados y publicados desde la web antes de ser usados en la app.
- Los dispositivos Android tienen conexión a internet estable durante el llenado.
- El cliente proveerá dispositivos Android 8.0+ para los auditores.

---

## 11. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Conectividad intermitente en sucursales | Media | Alto | Diseñar mensajes de error claros; planear offline en v2 |
| Resistencia al cambio de auditores | Media | Medio | UX simplificada; capacitación corta (< 30 min) |
| Formularios con 100+ preguntas demasiado largos | Baja | Medio | Scroll fluido; progreso visual por sección |
| Dispositivos Android muy antiguos (< API 26) | Baja | Bajo | Definir mínimo API 26 en el acuerdo con el cliente |
