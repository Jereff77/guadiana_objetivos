# Plan de tareas – Plataforma de Checklists y Auditorías Guadiana

Este documento agrupa las tareas de implementación derivadas de:
- Especificación técnica: `herramienta-checklists-encuestas-spec.md`
- PRD: `herramienta-checklists-encuestas-prd.md`

Las tareas están organizadas por fases y por componente (Supabase, Web Next.js, App Flutter).

---

## Fase 1 – Fundaciones técnicas

### 1.1 Backend – Supabase
- Crear tablas base de formularios:
  - `form_surveys`
  - `form_sections`
  - `form_questions`
  - `form_question_options`
- Crear tablas de asignaciones y respuestas:
  - `form_assignments`
  - `resp_survey_runs`
  - `resp_answers`
- Agregar índices recomendados:
  - Índices por código de formulario, orden de preguntas/opciones, filtros de runs/respuestas.
- Definir políticas RLS iniciales:
  - Perfiles de usuario y roles (admin_global, jefe_sucursal, auditor, usuario_auditado).
  - Acceso de solo lectura/escritura según rol.
- Configurar vistas o funciones básicas para listados:
  - Función para obtener formularios disponibles para un usuario.
  - Función para obtener auditorías realizadas por un auditor.

### 1.2 Proyecto Web – Next.js (constructor y consulta)
- Inicializar proyecto Next.js en `guadiana_objetivos/guadiana_objetivos`.
- Configurar cliente de Supabase y variables de entorno.
- Definir estructura de carpetas:
  - `app/` o `pages/` según versión de Next.js.
  - `components/`, `lib/`, `hooks/`, `styles/`.
- Configurar tema visual con paleta Guadiana:
  - Colores primarios, secundarios, acentos.
  - Componentes base de layout (AppBar, Sidebar, contenedores).

### 1.3 Proyecto App – Flutter (auditorías)
- Configurar proyecto Flutter para procesos en carpeta `procesos/` (si no existe, crear proyecto nuevo).
- Integrar Supabase en Flutter:
  - Inicialización del cliente.
  - Manejo básico de sesiones (login/logout).
- Definir estructura base:
  - `core/` (config, tema).
  - `data/` (modelos de formulario y respuestas).
  - `presentation/` (pantallas y widgets).

---

## Fase 2 – Constructor de formularios y asignación (Web)

### 2.1 Módulo de autenticación y layout
- Implementar flujo de login con Supabase.
- Crear layout principal:
  - Barra superior con logo Guadiana.
  - Menú lateral con secciones: Formularios, Asignaciones, Auditorías, Configuración.

### 2.2 Gestión de formularios
- Página de listado de formularios:
  - Tabla con nombre, categoría, estado, fecha de actualización.
  - Acciones: crear nuevo, editar, clonar, archivar.
- Página de edición de formulario:
  - Formulario para datos generales:
    - Nombre.
    - Descripción.
    - Categoría.
    - Rol objetivo.
    - Campo `ai_context`.
  - Editor de secciones:
    - Alta/edición/eliminación de secciones.
    - Reordenamiento de secciones.
  - Editor de preguntas:
    - Alta/edición/eliminación de preguntas.
    - Definir tipo de pregunta y si es obligatoria.
    - Definir opciones y puntajes para tipos de opción única/múltiple.
    - Reordenamiento de preguntas.
- Implementar vista previa de formulario:
  - Renderizar secciones y preguntas con layout similar a los checklists actuales.

### 2.3 Publicación y versiones
- Implementar cambio de estado:
  - `draft` → `published` → `archived`.
- Definir lógica de versionado:
  - Incrementar versión en cambios estructurales.
  - Bloquear edición de formularios archivados.

### 2.4 Asignación de formularios a auditores
- Crear UI de asignaciones:
  - Seleccionar formulario publicado.
  - Seleccionar auditores, roles y sucursales.
  - Definir rango de fechas de vigencia.
- Persistir asignaciones en `form_assignments`.
- Listar asignaciones existentes:
  - Permitir activar/desactivar asignaciones.

---

## Fase 3 – Ejecución de auditorías (App Flutter)

### 3.1 Autenticación y navegación básica
- Implementar pantalla de login con Supabase.
- Crear estructura de navegación:
  - Pantalla de lista de auditorías.
  - Pantalla de checklist.
  - Pantalla de detalle/historial (en iteración posterior si se requiere).

### 3.2 Listado de auditorías asignadas
- Consumir `form_assignments` y `form_surveys` para mostrar:
  - Formularios asignados al auditor autenticado.
  - Filtros por sucursal, categoría, fecha.
- Mostrar estado:
  - Pendiente, en progreso, completado (basado en `resp_survey_runs`).

### 3.3 Pantalla de checklist
- Construir layout de encabezado:
  - Logo Guadiana.
  - Nombre del formulario.
  - Datos de sucursal y usuario auditado.
- Cuerpo del checklist:
  - Secciones separadas con barras azules.
  - Para cada pregunta:
    - Texto del ítem.
    - Criterios/indicaciones.
    - Control de respuesta según tipo (Sí/No, opciones, texto, número, fecha).
    - Campo de comentario “Acciones a seguir”.
- Validación:
  - No permitir envío si faltan preguntas obligatorias.

### 3.4 Persistencia de auditorías
- Crear registros en `resp_survey_runs` al iniciar una auditoría.
- Crear registros en `resp_answers` conforme se responden las preguntas.
- Marcar `resp_survey_runs.status` como `completed` al enviar.

---

## Fase 4 – Consulta, exportación y KPIs básicos (Web)

### 4.1 Listado de ejecuciones
- Página de auditorías ejecutadas:
  - Filtros por formulario, sucursal, rango de fechas, auditor, estado.
  - Tabla con columnas básicas: formulario, sucursal, fecha, auditor, puntaje (si se calcula).

### 4.2 Detalle de una auditoría
- UI para mostrar:
  - Encabezado con datos de contexto (sucursal, auditor, usuario auditado).
  - Tabla de ítems:
    - Pregunta.
    - Respuesta.
    - Puntaje cuando aplique.
    - Comentarios / acciones a seguir.

### 4.3 Exportación CSV/Excel
- Implementar endpoint o Edge Function en Supabase que:
  - Reciba filtros (formulario, fechas, sucursales).
  - Devuelva archivo CSV/Excel con las auditorías y respuestas.
- Integrar botón de exportación en la UI.

### 4.4 KPIs iniciales
- Definir consultas o vistas para:
  - Porcentaje de cumplimiento por formulario y sucursal.
  - Ranking simple de sucursales por cumplimiento promedio.
- Mostrar KPIs en la web (tablas o gráficas simples).

---

## Fase 5 – Mejoras y preparación para IA

### 5.1 Calidad de datos y contexto
- Validar que todos los formularios de auditoría publicados tengan:
  - `ai_context` completo.
  - Estructura consistente de secciones y preguntas.
- Añadir validaciones en el constructor para reforzar la calidad del contenido.

### 5.2 Extensiones funcionales
- Evaluar e implementar:
  - Lógica condicional sencilla (mostrar/ocultar preguntas).
  - Soporte de evidencias (fotos, firmas) asociado a preguntas o auditorías.
  - Operación offline básica en la app móvil.

### 5.3 Integración futura con IA
- Definir formato de exportación de datos para modelos de IA:
  - Combinar `ai_context`, estructura del formulario y resultados.
- Diseñar APIs o procesos batch que generen datasets limpios de auditorías.

