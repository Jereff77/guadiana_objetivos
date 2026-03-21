# PRD – Plataforma de Checklists y Auditorías Guadiana

## 1. Resumen ejecutivo

Llantas y Rines del Guadiana necesita una plataforma para estandarizar y digitalizar los procesos de auditoría en sucursales. Actualmente las auditorías se realizan con formatos en Excel o papel, lo cual dificulta:
- Asegurar que todas las sucursales se evalúan con el mismo criterio.
- Tener trazabilidad por auditor, sucursal, fecha y persona auditada.
- Analizar los resultados a lo largo del tiempo y generar KPIs accionables.

Este producto consta de:
- **Aplicación web (Next.js)** para diseñar formularios de auditoría (checklists/encuestas), asignarlos a auditores y analizar resultados.
- **Aplicación móvil Flutter (Android)** para que los auditores llenen las auditorías en campo, con una UI alineada al diseño actual de Guadiana.
- **Backend en Supabase** para autenticar usuarios, almacenar formularios y respuestas, y servir de base para análisis posteriores (incluyendo IA).

Objetivo principal del producto:
- Permitir a Guadiana ejecutar auditorías consistentes, trazables y medibles en todas sus sucursales, facilitando una visión clara del desempeño y del cumplimiento de estándares operativos.

## 2. Usuarios objetivo

### Primarios
- **Administrador corporativo**
  - Define lineamientos generales de auditoría.
  - Crea plantillas estándar de formularios.
  - Consulta KPIs globales.

- **Jefe de sucursal / jefe de área**
  - Ajusta o selecciona formularios relevantes para su sucursal.
  - Programa auditorías y asigna formularios a auditores.
  - Revisa resultados de auditorías de su sucursal, identifica desviaciones y acciones pendientes.

- **Auditores**
  - Aplican las auditorías en sucursal con la app móvil.
  - Registran resultados ítem por ítem (Sí/No, selección múltiple, comentarios, etc.).
  - Documentan “acciones a seguir” para hallazgos.

### Secundarios
- **Usuarios auditados (asesores / operarios / sucursales)**
  - Consultan su puntaje y observaciones.
  - No llenan formularios.

- **Equipo de calidad / dirección**
  - Usa el histórico de auditorías y KPIs para tomar decisiones estratégicas.
  - Más adelante, consumirá los resultados y contexto desde herramientas de IA.

## 3. Problema y oportunidad

### Problemas actuales
- Formatos de auditoría dispersos (Excel, papel) que cambian entre sucursales.
- Poca visibilidad consolidada del estado de cumplimiento por sucursal.
- Difícil identificar tendencias negativas a tiempo (ej. sucursal que se deteriora).
- Sin contexto estructurado para aplicar análisis con IA.

### Oportunidad
- Establecer un **lenguaje común de auditoría** para toda la organización.
- Tener una **fuente única de verdad** con todas las auditorías históricas.
- Generar **KPIs comparables** por sucursal, área, auditor y periodo.
- Preparar datos y contexto para **análisis automatizado con IA** (detectar patrones, sugerir acciones).

## 4. Alcance del producto (MVP vs futuro)

### Alcance del MVP

1. **Gestión de formularios de auditoría (Web – Next.js)**
   - Crear, editar, clonar y archivar formularios.
   - Definir:
     - Nombre del formulario.
     - Descripción operativa visible.
     - Categoría (ej. “Operarios”, “Asesores”, “Seguridad”, etc.).
     - Rol objetivo principal (ej. “asesor de ventas”, “operario de taller”).
     - Campo `ai_context`: descripción detallada del objetivo del formulario y de cómo interpretar los resultados (texto obligatorio).
   - Estructurar el formulario por secciones:
     - Título y descripción de sección.
   - Definir preguntas por sección:
     - Texto principal/ítem (ej. “Revisar que el área de recepción esté limpia”).
     - Descripción / criterios (qué se considera cumplimiento).
     - Tipo de pregunta:
       - Sí/No (booleano).
       - Opción única (radio).
       - Opción múltiple (checkboxes).
       - Texto corto.
       - Texto largo.
       - Número.
       - Fecha.
     - Obligatoria o no.
     - Opciones de respuesta (cuando aplique) con puntaje por opción.
   - Ordenar secciones y preguntas (drag & drop).
   - Vista previa de formulario con layout similar a los formatos actuales (ITEMS, ¿Qué se revisa?, Sí/No, Criterios, Acciones a seguir).

2. **Asignación de formularios a auditores (Web)**
   - Publicar formularios (`draft` → `published`).
   - Asignar formularios a:
     - Auditores específicos.
     - Roles (ej. todos los auditores de cierta región).
     - Sucursales.
   - Definir rango de vigencia (inicio/fin).
   - Ver listado de asignaciones y su estado (activa/inactiva).

3. **Ejecución de auditorías (App móvil – Flutter, carpeta `procesos`)**
   - Login del auditor vía Supabase.
   - Listado de auditorías/formularios asignados:
     - Filtro por sucursal, categoría, fecha.
   - Selección de auditoría específica:
     - Encabezado con:
       - Nombre del formulario.
       - Sucursal.
       - Usuario o área auditada.
       - Fecha/hora.
   - Captura de resultados:
     - Renderizar secciones con encabezados azules (marca Guadiana).
     - Para cada pregunta:
       - Campo de respuesta según tipo (Sí/No, opciones, texto, número, etc.).
       - Campo de comentarios para “Acciones a seguir” (opcional, pero visible).
     - Validar respuestas obligatorias.
   - Guardar:
     - Guardado de borrador (opcional, si es simple de implementar).
     - Envío de auditoría (marca el run como `completed`).

4. **Consulta básica de resultados (Web)**
   - Listado de ejecuciones por formulario:
     - Filtros por sucursal, rango de fechas, auditor, estado.
   - Detalle de una auditoría:
     - Mostrar todas las respuestas en formato tabular similar al checklist original.
   - Exportación:
     - Exportar respuestas filtradas a CSV/Excel.

5. **Modelo de datos en Supabase**
   - Tablas `form_surveys`, `form_sections`, `form_questions`, `form_question_options`.
   - Tablas `form_assignments`, `resp_survey_runs`, `resp_answers`.
   - Inclusión de:
     - `ai_context` en `form_surveys`.
     - `audited_user_id` en `resp_survey_runs`.
   - Índices básicos para consultas de formularios y respuestas.
   - RLS aplicada por rol/usuario.

### Fuera de alcance del MVP (pero contemplado)

- Lógica condicional avanzada (mostrar/ocultar preguntas según respuestas).
- Campos de evidencia multimedia (fotos, firmas).
- Soporte de operación offline con sincronización posterior.
- Dashboards de KPIs avanzados con gráficas interactivas.
- Integraciones de IA (modelos que analicen auditorías y sugieran acciones).

## 5. Requerimientos funcionales

### 5.1 Gestión de formularios (Web)

- RF-01: El sistema debe permitir crear un nuevo formulario de auditoría con nombre, descripción, categoría, rol objetivo y `ai_context`.
- RF-02: El sistema debe permitir definir secciones dentro de un formulario.
- RF-03: El sistema debe permitir agregar, editar, eliminar y reordenar preguntas dentro de una sección.
- RF-04: El sistema debe soportar tipos de pregunta:
  - Booleano (Sí/No).
  - Opción única.
  - Opción múltiple.
  - Texto corto.
  - Texto largo.
  - Número.
  - Fecha.
- RF-05: El sistema debe permitir marcar preguntas como obligatorias.
- RF-06: El sistema debe permitir definir opciones de respuesta con un puntaje (score) para preguntas de tipo opción única o múltiple.
- RF-07: El sistema debe permitir previsualizar un formulario antes de publicarlo.
- RF-08: El sistema debe permitir clonar formularios existentes.
- RF-09: El sistema debe permitir cambiar el estado del formulario entre `draft`, `published` y `archived`.

### 5.2 Asignación de formularios (Web)

- RF-10: El sistema debe permitir asignar un formulario a uno o más auditores específicos.
- RF-11: El sistema debe permitir asignar formularios por rol de auditor y/o por sucursal.
- RF-12: El sistema debe permitir fijar fechas de inicio y fin de vigencia de una asignación.
- RF-13: El sistema debe mostrar todas las asignaciones existentes con filtros básicos (formulario, sucursal, activo/inactivo).

### 5.3 Ejecución de auditorías (App móvil)

- RF-14: El auditor debe autenticarse mediante Supabase para usar la app.
- RF-15: El auditor debe ver un listado de auditorías pendientes/asignadas, ordenadas por fecha o prioridad.
- RF-16: El auditor debe poder iniciar una nueva ejecución de un formulario desde dicho listado.
- RF-17: El auditor debe poder registrar para cada pregunta:
  - La respuesta según el tipo de pregunta.
  - Un comentario de “acciones a seguir” (opcional).
- RF-18: El sistema debe validar que se llenen todas las preguntas obligatorias antes de permitir enviar la auditoría.
- RF-19: El sistema debe registrar cada ejecución en `resp_survey_runs` y las respuestas en `resp_answers`.
- RF-20: El sistema debe asociar la ejecución al auditor (`respondent_id`), al usuario auditado (`audited_user_id`, cuando aplique) y a la sucursal (`branch_id`).

### 5.4 Consulta y exportación de resultados (Web)

- RF-21: El sistema debe mostrar un listado de ejecuciones por formulario con filtros por sucursal, fecha, auditor y estado.
- RF-22: El sistema debe permitir abrir el detalle de una ejecución y ver todas sus respuestas, incluyendo comentarios.
- RF-23: El sistema debe permitir exportar a CSV/Excel el listado de ejecuciones y sus respuestas.

### 5.5 Roles y permisos

- RF-24: Los administradores corporativos deben poder:
  - Crear y editar formularios.
  - Ver resultados de todas las sucursales.
- RF-25: Los jefes de sucursal deben poder:
  - Consultar resultados solo de su(s) sucursal(es).
  - Asignar formularios a auditores que atienden su sucursal.
- RF-26: Los auditores deben poder:
  - Ver los formularios que tienen asignados.
  - Registrar nuevas ejecuciones.
  - Ver auditorías que ellos mismos realizaron.
- RF-27: Los usuarios auditados deben poder:
  - Ver sus resultados y puntajes (según configuración futura de vistas).

## 6. Requerimientos no funcionales

### 6.1 Rendimiento
- La carga del listado de formularios en web debe ser menor a 2–3 segundos en condiciones típicas.
- La carga de un formulario en la app móvil debe ser prácticamente inmediata una vez descargado (el tamaño máximo esperado es ~200 preguntas).

### 6.2 Seguridad
- Todo el tráfico debe ir protegido por HTTPS.
- Debe utilizarse Supabase Auth para autenticación.
- Deben implementarse políticas RLS para:
  - Limitar qué formularios y respuestas puede ver cada usuario según su rol y sucursal.
  - Evitar que un usuario modifique auditorías de otro usuario sin permiso.

### 6.3 Usabilidad
- La interfaz debe ser simple, con textos claros y botones grandes (uso en taller).
- El flujo de captura debe minimizar cambios de pantalla; idealmente se captura la mayor parte en un solo flujo tipo tabla con scroll.

### 6.4 Mantenibilidad
- El código de la app Flutter debe seguir una arquitectura clara (p. ej. Clean Architecture o equivalente).
- El frontend Next.js debe estructurarse en páginas, componentes y hooks reutilizables.

## 7. Éxito y métricas

### Métricas de adopción
- % de auditorías que se realizan en la nueva plataforma vs métodos anteriores.
- Número de auditorías completadas por semana por sucursal.

### Métricas de calidad del proceso
- % de formularios completados en tiempo (según programación).
- Promedio de cumplimiento por sucursal / área / usuario.
- Reducción del tiempo de consolidación de resultados para reportes corporativos.

### Preparación para IA
- % de formularios de auditoría que tienen `ai_context` completo.
- Cobertura de datos estructurados (preguntas, puntajes, comentarios) para alimentar modelos de IA.

## 8. Suposiciones y dependencias

- Supabase ya está configurado como backend corporativo.
- Existirá (o se podrá crear) una tabla de sucursales y una de perfiles de usuario donde se asocien roles y sucursales.
- El equipo de TI acepta Next.js como framework estándar para nuevos frontends web.
- Habrá al menos un diseñador o responsable que valide la aplicación del branding Guadiana (colores, tipografía).

## 9. Riesgos

- Resistencia al cambio por parte de auditores acostumbrados a formatos en papel.
- Conectividad limitada en algunas sucursales (mitigación futura: soporte offline).
- Necesidad de ajustar el modelo de datos conforme se enriquezcan las auditorías o se quiera más granularidad para IA.

## 10. Roadmap propuesto (alto nivel)

1. **Fundaciones**
   - Crear esquema en Supabase según diseño definido.
   - Configurar proyectos base:
     - Next.js en `guadiana_objetivos/guadiana_objetivos`.
     - Flutter app de procesos en `procesos/`.

2. **MVP**
   - Constructor de formularios web.
   - Asignación a auditores y sucursales.
   - Ejecución de auditorías en la app móvil.
   - Consulta básica y exportación de resultados.

3. **Iteración 2**
   - KPIs básicos (porcentaje de cumplimiento, ranking de sucursales, etc.).
   - Mejoras de UX según feedback de auditores y jefes de sucursal.

4. **Iteración 3**
   - Funcionalidades avanzadas (lógica condicional, evidencias, offline).
   - Preparación y primeras pruebas de análisis con IA utilizando `ai_context` y el histórico de auditorías.

