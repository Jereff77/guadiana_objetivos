# Requerimientos — Sistema de Objetivos e Incentivos
## Llantas y Rines del Guadiana — Módulos M0, M1, M2, M3, M4, M6, M7

**Versión:** 2.0
**Fecha:** 2026-03-22
**Relacionado con:** Módulo 5 (Checklists) ya implementado en `guadiana_objetivos/web`

---

## 1. Contexto y Alcance

### 1.1 Módulos cubiertos en este documento

| ID | Módulo | Prioridad | Fase |
|----|--------|-----------|------|
| **M0** | **Sistema de Usuarios y Roles Granular** | **CRÍTICA** | **0 — Fundacional** |
| M1 | Plataforma de Gestión de Objetivos | ALTA | 1 |
| M2 | Tablero de Control y Medición | ALTA | 1–2 |
| M3 | Sistema de Incentivos Vinculado | ALTA | 2 |
| M4 | Motor de IA para Verificación (Python) | ALTA | 2 |
| M6 | Sistema de Mentoring | MEDIA | 4 |
| M7 | LMS — Capacitación y Conocimiento | MEDIA | 4 |

> **M0 es prerequisito de todos los demás módulos.** Debe implementarse primero.

### 1.2 Lo que NO cubre este documento

El **Módulo 5 (Checklists/Formularios)** ya está implementado. Sus permisos actuales (roles hardcodeados) deberán **migrarse** al nuevo sistema granular de M0, sin modificar su funcionalidad.

---

## 2. Módulo M0 — Sistema de Usuarios y Roles Granular

### 2.1 Descripción

Sistema centralizado de gestión de usuarios y control de acceso basado en roles personalizables. Reemplaza el sistema de roles hardcodeados (`admin_global`, `jefe_sucursal`, etc.) por un sistema donde los roles son configurables y los permisos se asignan módulo por módulo.

### 2.2 Concepto de Roles

#### Role `root`
- Es el único rol del sistema predefinido e inmutable.
- Un usuario `root` **bypasea todos los controles de permisos** de la plataforma.
- Solo un usuario `root` puede asignar el rol `root` a otro usuario.
- No está sujeto a las reglas de permisos granulares.

#### Roles personalizados
- Creados por usuarios con permiso de gestión de roles.
- Cada rol tiene un nombre, descripción y un conjunto de permisos por módulo/área.
- Un usuario tiene exactamente un rol asignado.
- Los roles se pueden activar o desactivar sin eliminarlos.

### 2.3 Áreas y Módulos de la Plataforma

El sistema define las siguientes áreas sobre las que se pueden configurar permisos:

| Clave del área | Nombre visible | Módulo |
|----------------|---------------|--------|
| `users.view` | Ver lista de usuarios | M0 |
| `users.edit` | Editar perfil de usuarios | M0 |
| `users.activate` | Activar / desactivar usuarios | M0 |
| `users.change_role` | Cambiar rol de un usuario | M0 |
| `roles.view` | Ver roles existentes | M0 |
| `roles.manage` | Crear, editar, eliminar roles | M0 |
| `formularios.view` | Ver formularios | M5 |
| `formularios.create` | Crear formularios | M5 |
| `formularios.edit` | Editar formularios | M5 |
| `formularios.delete` | Eliminar formularios | M5 |
| `formularios.assign` | Asignar formularios | M5 |
| `resultados.view` | Ver resultados de checklists | M5 |
| `resultados.export` | Exportar resultados | M5 |
| `objetivos.view` | Ver objetivos | M1 |
| `objetivos.manage` | Crear y editar objetivos | M1 |
| `objetivos.review` | Aprobar/rechazar entregables | M1 |
| `dashboard.view` | Ver tablero de control | M2 |
| `dashboard.export` | Exportar datos del tablero | M2 |
| `incentivos.view` | Ver incentivos | M3 |
| `incentivos.manage` | Configurar esquemas de incentivos | M3 |
| `incentivos.approve` | Aprobar cálculos de incentivos | M3 |
| `ia.view` | Ver resultados de análisis IA | M4 |
| `ia.configure` | Configurar prompts de IA | M4 |
| `mentoring.view` | Ver programa de mentoring | M6 |
| `mentoring.manage` | Gestionar pares y sesiones | M6 |
| `capacitacion.view` | Ver contenidos LMS | M7 |
| `capacitacion.manage` | Crear y publicar contenidos | M7 |

### 2.4 Requerimientos Funcionales — Roles

**[REQ-M0-001]** El sistema debe tener exactamente un tipo de rol especial llamado `root`. Este rol es creado automáticamente durante el setup inicial del sistema.

**[REQ-M0-002]** Los usuarios con permiso `roles.manage` (o rol `root`) deben poder:
- Crear nuevos roles con nombre y descripción
- Activar o desactivar roles existentes
- Asignar permisos granulares a un rol seleccionando áreas de la lista definida en 2.3
- Eliminar roles que no tengan usuarios asignados

**[REQ-M0-003]** La interfaz de configuración de roles debe mostrar todas las áreas disponibles agrupadas por módulo, con toggle de activar/desactivar por área.

**[REQ-M0-004]** Solo un usuario con rol `root` puede asignar el rol `root` a otro usuario. Esta acción queda registrada en un log de auditoría.

**[REQ-M0-005]** Un rol no puede ser eliminado si tiene usuarios asignados. Debe desactivarse primero y reasignar a los usuarios.

### 2.5 Requerimientos Funcionales — Usuarios

**[REQ-M0-006]** Debe existir una sección `/usuarios` que muestre todos los usuarios del sistema en una tabla con:
- Nombre completo
- Email
- Rol asignado
- Estado (activo / inactivo)
- Fecha de último acceso (si disponible)

**[REQ-M0-007]** Los usuarios con permiso `users.edit` deben poder editar el perfil de cualquier usuario (excepto del `root` a menos que sean `root`):
- Nombre completo
- Teléfono
- Número de WhatsApp (**campo obligatorio para comunicación con IA**)
- Avatar/foto de perfil (opcional)
- Cualquier dato adicional del perfil

**[REQ-M0-008]** El número de **WhatsApp** es un campo independiente del teléfono. Puede coincidir o ser diferente. Es el canal principal por el que la IA se comunicará con el usuario. Debe validarse como número con código de país (ej. `+52 55 1234 5678`).

**[REQ-M0-009]** Los usuarios con permiso `users.activate` deben poder activar o desactivar una cuenta de usuario. Un usuario desactivado no puede iniciar sesión.

**[REQ-M0-010]** Los usuarios con permiso `users.change_role` deben poder cambiar el rol asignado a otro usuario, con excepción de:
- No pueden asignar el rol `root` (solo `root` puede hacerlo)
- No pueden modificar a un usuario `root`

**[REQ-M0-011]** Cada usuario puede editar **su propio perfil** (nombre, teléfono, WhatsApp, foto) sin necesidad de permiso especial.

**[REQ-M0-012]** La creación de usuarios (invitación por email) solo la pueden hacer usuarios con permiso `users.edit` o rol `root`.

### 2.6 Requerimientos No Funcionales

**[NFR-M0-001]** La verificación de permisos se realiza en el servidor (Server Actions y Server Components), nunca solo en el cliente.

**[NFR-M0-002]** El rol `root` bypasea los controles en la capa de aplicación (Next.js). Las RLS de Supabase aplican una política especial para el usuario con rol `root` usando la función `is_root()`.

**[NFR-M0-003]** El sistema debe ser compatible con los datos existentes de la tabla `profiles`. La migración asignará un rol personalizado equivalente a cada rol hardcodeado actual.

**[NFR-M0-004]** Cada cambio de rol de usuario queda registrado (quién hizo el cambio, cuándo, rol anterior y nuevo).

---

## 3. Módulo M1 — Plataforma de Gestión de Objetivos

### 3.1 Descripción
Permite definir, asignar y dar seguimiento a objetivos mensuales por departamento/sucursal, con criterios de cumplimiento y entregables específicos.

### 3.2 Requerimientos Funcionales

**[REQ-M1-001]** Los usuarios con permiso `objetivos.manage` deben poder crear y gestionar departamentos con nombre, descripción y responsable asignado.

**[REQ-M1-002]** Los usuarios con permiso `objetivos.manage` deben poder definir hasta 4 objetivos mensuales por departamento, especificando:
- Título y descripción del objetivo
- Mes y año al que aplica
- Criterio de cumplimiento (porcentaje mínimo o valor numérico)
- Peso/ponderación respecto al total del mes (suma = 100%)
- Tipo de evidencia requerida (documento, fotografía, texto, checklist vinculado)

**[REQ-M1-003]** Cada objetivo puede tener uno o más **entregables** configurables: nombre, descripción, tipo y fecha límite.

**[REQ-M1-004]** Los usuarios asignados deben poder **subir evidencias** para cada entregable: archivos (PDF, imágenes), texto libre o vinculación a un run de checklist existente.

**[REQ-M1-005]** Los usuarios con permiso `objetivos.review` deben poder **aprobar o rechazar** cada entregable con comentario. El rechazo devuelve el entregable a estado pendiente.

**[REQ-M1-006]** El sistema debe mantener **historial completo** de objetivos por periodo (mes/año), inmutable una vez cerrado el período.

**[REQ-M1-007]** Los objetivos deben poder **clonarse** de un mes a otro con ajustes, para facilitar la configuración recurrente.

**[REQ-M1-008]** El sistema debe calcular automáticamente el **% de cumplimiento** de cada objetivo según los entregables aprobados.

### 3.3 Requerimientos No Funcionales

**[NFR-M1-001]** Los archivos de evidencia se almacenan en **Supabase Storage** en bucket `objective-evidences`.

---

## 4. Módulo M2 — Tablero de Control y Medición

### 4.1 Descripción
Dashboard ejecutivo que consolida el cumplimiento de objetivos en tiempo real, con gráficas, alertas y reportes exportables.

### 4.2 Requerimientos Funcionales

**[REQ-M2-001]** El tablero debe mostrar **KPIs en tiempo real** por departamento:
- % de cumplimiento mensual actual vs. objetivo
- Número de entregables pendientes / aprobados / rechazados
- Tendencia respecto al mes anterior

**[REQ-M2-002]** Los usuarios con permiso `dashboard.view` ven el tablero. La visibilidad de departamentos depende de la configuración de su rol (puede limitarse por departamento asignado).

**[REQ-M2-003]** Deben existir vistas de comparación: **mensual, trimestral y anual**, con gráficas de tendencia (Recharts).

**[REQ-M2-004]** El sistema debe generar **alertas automáticas** cuando:
- Un departamento baja del 70% de cumplimiento a mitad de mes
- Un entregable está a 2 días de su fecha límite sin subirse
- Un período termina con cumplimiento < 80%

**[REQ-M2-005]** Los usuarios con permiso `dashboard.export` pueden **exportar** en Excel/CSV y PDF.

**[REQ-M2-006]** Debe existir una vista de **"ranking de departamentos"** ordenada por % de cumplimiento mensual.

### 4.3 Requerimientos No Funcionales

**[NFR-M2-001]** Reusar el componente `kpi-charts.tsx` (Recharts) ya existente en `src/components/resultados/`.

---

## 5. Módulo M3 — Sistema de Incentivos

### 5.1 Descripción
Calcula automáticamente las bonificaciones de los colaboradores según su porcentaje de cumplimiento mensual de objetivos.

### 5.2 Requerimientos Funcionales

**[REQ-M3-001]** Los usuarios con permiso `incentivos.manage` deben poder configurar un **esquema de incentivos** por departamento o por rol.

**[REQ-M3-002]** Al cierre de cada mes, el sistema debe **calcular automáticamente** la bonificación individual de cada colaborador.

**[REQ-M3-003]** Los usuarios con permiso `incentivos.approve` deben poder **revisar y aprobar/ajustar** el cálculo antes de que sea definitivo.

**[REQ-M3-004]** El sistema debe generar **reportes de incentivos** individual y grupal por período, exportables.

**[REQ-M3-005]** Cada usuario puede ver **su propio reporte** de incentivos independientemente de sus permisos.

**[REQ-M3-006]** El historial de incentivos debe ser **inmutable** una vez aprobado.

---

## 6. Módulo M4 — Motor de IA para Verificación

### 6.1 Descripción
Servicio en **Python** (backend separado) que analiza documentos y evidencias, comparando contra criterios del objetivo. El frontend Next.js **solo consume y muestra** las respuestas.

### 6.2 Arquitectura

```
[Supabase Storage]  ←→  [Python AI Service]  ←→  [Next.js Frontend]
       ↑                        ↑
  Evidencias             Supabase DB
  subidas               (guarda resultados)
```

### 6.3 Requerimientos Funcionales

**[REQ-M4-001]** El servicio Python expone `POST /analyze` que recibe deliverable_id, evidencias y criterios, y retorna veredicto con summary y hallazgos.

**[REQ-M4-002]** Los usuarios con permiso `ia.configure` pueden editar los **prompts del sistema** desde la interfaz web.

**[REQ-M4-003]** Los usuarios con permiso `objetivos.review` pueden **confirmar o revisar** manualmente el veredicto de la IA.

**[REQ-M4-004]** Los usuarios con permiso `ia.view` pueden ver el **log de todos los análisis** realizados.

**[REQ-M4-005]** La comunicación con el usuario vía **WhatsApp** (campo del perfil) puede usarse para notificar resultados del análisis IA.

### 6.4 Requerimientos No Funcionales

**[NFR-M4-001]** El servicio Python corre en servidor separado. Next.js lo llama desde Server Actions con autenticación por API Key.

**[NFR-M4-002]** El número de WhatsApp del perfil del usuario es el canal de notificaciones de la IA.

---

## 7. Módulo M6 — Sistema de Mentoring

### 7.1 Requerimientos Funcionales

**[REQ-M6-001]** Los usuarios con permiso `mentoring.manage` pueden crear pares mentor-mentee y programar sesiones.

**[REQ-M6-002]** El mentor registra temas, acuerdos y calificación de cada sesión.

**[REQ-M6-003]** El mentee da retroalimentación de cada sesión.

**[REQ-M6-004]** El sistema genera reportes mensuales de avance por par.

**[REQ-M6-005]** Las sesiones pueden vincularse con objetivos del M1.

---

## 8. Módulo M7 — LMS (Capacitación y Conocimiento)

### 8.1 Requerimientos Funcionales

**[REQ-M7-001]** Los usuarios con permiso `capacitacion.manage` crean categorías, contenidos (PDF, video URL, texto) y rutas de aprendizaje.

**[REQ-M7-002]** Todos los usuarios con permiso `capacitacion.view` acceden al catálogo de contenidos publicados.

**[REQ-M7-003]** Cada contenido puede tener evaluación automatizada (opción múltiple).

**[REQ-M7-004]** Se emiten certificaciones internas al completar rutas con calificación mínima.

**[REQ-M7-005]** El asistente de IA (Python `/chat`) responde preguntas sobre el contenido del LMS. El número de WhatsApp del usuario puede usarse para sesiones de chat externas.

---

## 9. Restricciones Transversales

**[CON-001]** Todo el código nuevo en web sigue el patrón Next.js 15 App Router con Server Components y Server Actions.

**[CON-002]** El rol `root` no se puede eliminar ni modificar.

**[CON-003]** Todos los controles de permisos granulares se validan en el servidor (Server Actions / Server Components). El cliente solo muestra/oculta UI como ayuda visual, nunca como control de seguridad.

**[CON-004]** El número de WhatsApp se almacena con código de país y se valida en formato E.164 (`+521234567890`).

**[CON-005]** El servicio Python de IA es independiente del servidor Next.js.

**[CON-006]** La autenticación de sesión sigue siendo Supabase Auth (ya implementada).

---

## 10. Suposiciones

**[ASM-001]** El primer usuario del sistema se creará manualmente en Supabase y se le asignará el rol `root` como parte del setup inicial.

**[ASM-002]** La migración de los roles hardcodeados existentes a roles personalizados se hará como parte de la implementación de M0.

**[ASM-003]** La integración de WhatsApp para notificaciones de IA es responsabilidad del servicio Python (usa la API de WhatsApp Business o similar). Next.js solo almacena el número.

**[ASM-004]** M0 debe estar 100% funcional antes de iniciar M1.
