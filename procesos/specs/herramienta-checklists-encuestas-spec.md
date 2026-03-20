# Especificación Técnica – Herramienta de Checklists y Encuestas Guadiana

## Tabla de contenidos
- [Resumen ejecutivo](#resumen-ejecutivo)
- [Arquitectura del sistema](#arquitectura-del-sistema)
- [Especificaciones técnicas](#especificaciones-técnicas)
- [Diseño de base de datos (Supabase)](#diseño-de-base-de-datos-supabase)
- [Módulos funcionales](#módulos-funcionales)
- [Interfaz de usuario](#interfaz-de-usuario)
- [Seguridad](#seguridad)
- [Requisitos no funcionales](#requisitos-no-funcionales)
- [Métricas de éxito](#métricas-de-éxito)
- [Plan de implementación](#plan-de-implementación)

---

## Resumen ejecutivo

Se requiere una plataforma para crear, gestionar y analizar formularios tipo checklist o encuesta utilizados por Llantas y Rines del Guadiana en sus procesos operativos y comerciales (por ejemplo, KPIs de asesores y operarios).

La solución tendrá dos caras:
- **Aplicación web** (administradores / jefes de área): Diseñar formularios, configurar lógica básica, asignar checklists a usuarios / sucursales y consultar resultados.
- **Aplicación móvil Flutter (Android)**: Permitir que asesores y operarios respondan los formularios asignados de forma sencilla y rápida, con estilo visual alineado a la marca Guadiana.

El backend se implementará sobre **Supabase** (PostgreSQL, Auth, Storage y Edge Functions), ya utilizado en otros proyectos internos.

### Problema principal
- Actualmente los checklists y evaluaciones se gestionan de forma manual (archivos Excel o impresos), lo que dificulta:
  - Estandarizar los formatos entre sucursales.
  - Tener trazabilidad por usuario, fecha, vehículo, área, etc.
  - Analizar resultados históricos y KPIs.

### Objetivo
- Contar con una **plataforma centralizada** para:
  - Diseñar formularios de checklists/encuestas de auditoría sin necesidad de programar.
  - Ejecutar dichos formularios en campo desde una app Android.
  - Almacenar todas las respuestas en Supabase para análisis posterior, generación de KPIs y análisis con IA.

### Usuarios objetivo
- **Administrador corporativo**: Define plantillas estándar de checklists para toda la organización.
- **Jefes de sucursal / jefes de área**: Configuran versiones específicas de checklists, asignan a auditores y revisan resultados de su sucursal.
- **Auditores**: Aplican las auditorías llenando los formularios desde la app móvil.
- **Usuarios auditados (asesores / operarios / sucursales)**: Consultan su puntaje y resultados, pero no llenan formularios.

### Alcance del MVP
Must-have:
- CRUD de formularios checklist/encuesta desde la web.
- Soporte para tipos de pregunta básicos:
  - Opción binaria (Sí/No) con estilo similar a los formatos actuales.
  - Opción única (radio buttons / select).
  - Opción múltiple (checkboxes).
  - Texto corto.
  - Texto largo/comentarios.
  - Número (enteros / decimales).
  - Fecha.
- Organización por secciones dentro de un formulario.
- Publicación de formularios y asignación a usuarios / roles / sucursales.
- Ejecución de formularios desde app Flutter (Android).
- Registro de respuestas en Supabase con trazabilidad completa.
- Consulta de respuestas en una vista tabular filtrable y exportable (CSV/Excel).

Nice-to-have (futuras fases, no obligatorio en MVP):
- Lógica condicional simple (mostrar/ocultar preguntas según respuestas).
- Campos de captura de evidencia (foto, firma).
- Ejecución offline con sincronización posterior.
- Programación de checklists recurrentes (diarios, semanales, mensuales).
- Panel de KPIs visual (gráficas, dashboards).

---

## Arquitectura del sistema

### Visión general
```
┌─────────────────────────┐      ┌─────────────────────────┐
│   Web App Checklists    │      │   App Flutter Android   │
│ (React/Flutter Web)*    │      │  (Asesores / Operarios) │
└───────────────▲─────────┘      └───────────────▲─────────┘
                │                               │
                │ HTTPS (REST / RPC)            │
                │                               │
          ┌─────┴───────────────────────────────┴─────┐
          │                Supabase                    │
          │  - Auth                                    │
          │  - PostgreSQL (formularios / respuestas)   │
          │  - Storage (evidencias futuras)            │
          │  - Edge Functions (agregados / reportes)   │
          └────────────────────────────────────────────┘
```

> *La web app puede implementarse en Flutter Web reutilizando componentes de la app móvil, o en otra tecnología web según convenga. Este documento se mantiene agnóstico, pero asume integración vía Supabase.

### Arquitectura lógica de la solución
- **Capa de presentación (Web / Flutter)**:
  - Constructor de formularios (web).
  - Listado de formularios y respuestas.
  - Pantallas de ejecución de formularios (móvil).
- **Capa de dominio**:
  - Entidades: Formulario, Sección, Pregunta, Opción, Asignación, Respuesta, RespuestaDetalle.
  - Servicios de negocio: Asignación de formularios, validación de respuestas, cálculo de KPIs básicos.
- **Capa de datos**:
  - Cliente Supabase: acceso a tablas y RPC.
  - Edge Functions: generación de reportes/exports y agregados complejos.

---

## Especificaciones técnicas

### Tecnologías principales
- **Frontend Web (Next.js)**:
  - Next.js (React) como framework principal para el constructor de formularios y dashboards de resultados.
  - Ubicación del proyecto web: `guadiana_objetivos/guadiana_objetivos`.
- **Aplicación móvil**:
  - Flutter (ya utilizado en proyectos existentes del cliente).
  - Ubicación del proyecto móvil de procesos/auditorías: `procesos/`.
- **Backend**:
  - Supabase (PostgreSQL, Auth, Storage, Edge Functions).

### Integración con Supabase
- Autenticación con correo/contraseña (Supabase Auth).
- Uso de **Row Level Security (RLS)** para limitar acceso a:
  - Formularios según rol y sucursal.
  - Respuestas (solo administradores, jefes de sucursal y auditores).
- Edge Functions recomendadas para:
  - Exportar respuestas a Excel.
  - Cálculos de KPIs agregados.

### Modelo de permisos y roles
- Roles lógicos a nivel de aplicación (apoyados en claims / tablas de perfiles):
  - `admin_global`
  - `jefe_sucursal`
  - `asesor`
  - `operario`
  - `auditor`
- El rol determinará:
  - Qué formularios puede crear/editar.
  - A qué respuestas puede acceder.
  - Qué vistas y menús están disponibles.

### Paleta de colores corporativa
Basada en la identidad visual de **Llantas y Rines del Guadiana** (azules y acentos naranjas), se define una paleta de referencia:
- Azul primario (barra superior, énfasis principal): `#004B8D`–`#0054A6` (azul corporativo).
- Azul oscuro (texto en barras, botones sólidos): `#002D72`.
- Naranja de acento (bordes de campos, botones primarios en acciones clave): `#FF8F1C`.
- Gris claro de fondo: `#F5F5F5`.
- Blanco: `#FFFFFF`.

Los componentes principales (AppBar, barras de secciones, botones primarios) usarán azul corporativo; los campos editables y acciones destacadas usarán contorno/relleno naranja, siguiendo el estilo de los formatos compartidos (encabezados azules y bordes naranjas).

---

## Diseño de base de datos (Supabase)

### Consideraciones generales
- Todas las tablas incluyen:
  - `id` tipo `UUID` (`DEFAULT gen_random_uuid()`).
  - Campos de auditoría: `created_at`, `updated_at`, `created_by`, `updated_by` cuando aplique.
- RLS activado con políticas por rol/usuario.
- Prefijo `form_` para tablas de formularios y `resp_` para tablas de respuestas.

### Tablas principales

#### 1. Formularios
```sql
CREATE TABLE form_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT, -- descripción operativa visible en la UI
  code TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  category TEXT, -- ej: 'operarios', 'asesores', 'seguridad', etc.
  target_role TEXT, -- rol principal objetivo: asesor, operario, etc.
  ai_context TEXT NOT NULL, -- descripción detallada del propósito de la auditoría para IA
  version INTEGER NOT NULL DEFAULT 1,
  is_template BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users (id),
  updated_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. Secciones de formulario
```sql
CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3. Preguntas
```sql
CREATE TABLE form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES form_sections (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'boolean',
    'single_choice',
    'multiple_choice',
    'text_short',
    'text_long',
    'number',
    'date'
  )),
  required BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 4. Opciones de pregunta
```sql
CREATE TABLE form_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES form_questions (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT,
  score NUMERIC(10,2),
  "order" INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 5. Asignación de formularios
Permite asignar formularios a usuarios, roles y/o sucursales.

```sql
CREATE TABLE form_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys (id) ON DELETE CASCADE,
  assignee_user_id UUID REFERENCES auth.users (id),
  assignee_role TEXT,
  branch_id UUID,
  required_frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 6. Ejecuciones de formulario (cabecera de respuesta)
Representa una ejecución concreta de un formulario realizada por un auditor sobre un usuario/sucursal auditada en una fecha/hora.

```sql
CREATE TABLE resp_survey_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES form_surveys (id),
  assignment_id UUID REFERENCES form_assignments (id),
  respondent_id UUID NOT NULL REFERENCES auth.users (id), -- auditor que captura
  audited_user_id UUID REFERENCES auth.users (id), -- usuario auditado (cuando aplique)
  branch_id UUID,
  context JSONB,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  device_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 7. Respuestas a preguntas
```sql
CREATE TABLE resp_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES resp_survey_runs (id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES form_questions (id),
  option_id UUID REFERENCES form_question_options (id),
  value_text TEXT,
  value_number NUMERIC,
  value_bool BOOLEAN,
  value_date DATE,
  value_json JSONB,
  not_applicable BOOLEAN NOT NULL DEFAULT false,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

> La columna `comment` permite capturar la columna "ACCIONES A SEGUIR" de los formatos actuales directamente ligada a cada ítem evaluado.

### Índices y rendimiento
- Índices recomendados:
  - `form_surveys(code)`.
  - `form_questions(section_id, "order")`.
  - `form_question_options(question_id, "order")`.
  - `form_assignments(survey_id, assignee_user_id, branch_id)`.
  - `resp_survey_runs(survey_id, branch_id, respondent_id, completed_at)`.
  - `resp_answers(run_id, question_id)`.

---

## Módulos funcionales

### 1. Gestión de formularios (Web)
Funcionalidades:
- Crear, editar, clonar y archivar formularios.
- Agregar secciones con título y descripción.
- Agregar preguntas:
  - Tipo.
  - Texto principal (ítem).
  - Indicaciones / criterios.
  - Obligatoria o no.
  - Tipo de respuesta.
  - Opciones de respuesta.
  - Configuración de puntuación.
- Ordenar secciones y preguntas mediante drag & drop.
- Vista previa de formulario (modo lectura, simulando app móvil).
- Control de versiones simple:
  - Incrementar `version` al publicar cambios.
  - Mantener histórico.

### 2. Asignación y publicación (Web)
- Publicar formulario (`status = 'published'`).
- Asignar a:
  - Usuarios individuales.
  - Roles.
  - Sucursales específicas.
- Definir vigencia (fecha inicio/fin).
- Listar asignaciones existentes y su estado.

### 3. Ejecución de formularios (App Flutter)
- Autenticación de usuario vía Supabase.
- Pantalla de inicio:
  - Lista de formularios asignados.
  - Filtros por sucursal, categoría, fecha.
- Ejecución:
  - Encabezado con nombre de checklist y contexto.
  - Layout tipo tabla:
    - Columna izquierda: "ITEMS".
    - Columna central: "¿Qué se revisa? / Criterios".
    - Columnas de respuesta: Sí / No u otro control según tipo.
    - Columna "Acciones a seguir" / comentarios.
  - Validación de campos obligatorios.
  - Botón de guardar borrador y botón de enviar.
- Envío:
  - Crear registro en `resp_survey_runs` y `resp_answers`.
  - Confirmación de envío.

### 4. Consulta y exportación de respuestas (Web)
- Listado de ejecuciones por formulario:
  - Filtros: sucursal, rango de fechas, usuario, estatus.
- Detalle de ejecución individual:
  - Ver todas las respuestas en formato similar al checklist original.
- Exportación:
  - Exportar a CSV/Excel todas las respuestas filtradas.
  - Estructura amigable para análisis en herramientas externas.

### 5. KPIs básicos (Web)
Para una primera versión, se definen indicadores simples:
- Por checklist y periodo:
  - Porcentaje de ítems cumplidos (Sí) vs total.
  - Promedio de cumplimiento por sucursal.
  - Ranking de sucursales o usuarios por cumplimiento.
- Implementación:
  - Inicialmente consultas SQL directas o vistas/materialized views.
  - En fases posteriores, Edge Functions para agregados más complejos.

---

## Interfaz de usuario

### Principios generales
- Interfaz limpia y enfocada en la operación.
- Uso consistente de:
  - Azul de Guadiana para barras de encabezado y títulos de sección.
  - Naranja para bordes de campos y botones principales.
- Tipografía legible, tamaños suficientes para uso en taller.

### Web – Constructor de formularios
- Página de lista de formularios:
  - Tabla con nombre, categoría, estado, fecha de última modificación.
  - Acciones: editar, clonar, archivar, ver respuestas.
- Editor de formulario:
  - Layout de tres paneles:
    - Panel izquierdo: lista de secciones y preguntas.
    - Panel central: vista previa del formulario.
    - Panel derecho: propiedades de la sección/pregunta seleccionada.
  - Botón flotante o barra superior para:
    - Guardar borrador.
    - Publicar.
    - Vista previa completa.

### App Flutter – Ejecución de formularios
- Pantalla de inicio:
  - Logo de Guadiana en la parte superior.
  - Lista de formularios pendientes.
  - Botón para ver formularios completados.
- Pantalla de checklist:
  - Encabezado con:
    - Logo, nombre del formulario.
    - Información clave (sucursal, fecha, usuario, vehículo u otro contexto).
  - Cuerpo:
    - Secciones separadas por barras azules.
    - Para preguntas Sí/No:
      - Dos botones estilo toggle (azul seleccionado, gris no seleccionado).
    - Campo de texto opcional para "acciones a seguir".
  - Pie:
    - Botón "Guardar" (naranja).
    - Botón "Enviar" (naranja sólido).

---

## Seguridad

- Uso de Supabase Auth para autenticar todas las solicitudes.
- RLS en tablas críticas:
  - Formularios solo visibles para usuarios con permisos adecuados.
  - Respuestas visibles solo para administradores, jefes de sucursal y auditores.
  - Restricción de escritura para que un usuario solo pueda crear/editar sus propias respuestas.
- Comunicación siempre sobre HTTPS.
- Manejo seguro de sesiones en app Flutter (token refresh y logout).

---

## Requisitos no funcionales

- Disponibilidad:
  - Servicio enfocado a horario laboral; no se requiere 24/7 estricto, pero se debe evitar downtime en horas pico.
- Rendimiento:
  - El listado de formularios y la carga de un checklist deben ser casi instantáneos.
  - Los formularios deberán manejar hasta ~200 preguntas por ejecución sin degradación relevante.
- Escalabilidad:
  - Soportar crecimiento gradual de sucursales y usuarios.
- Mantenibilidad:
  - Código organizado con arquitectura limpia en Flutter.
  - Separación clara entre construcción de formularios y ejecución.
- Usabilidad:
  - Interfaz preparada para usuarios no técnicos.
  - Botones grandes y textos claros para uso en talleres.

---

## Métricas de éxito

- % de formularios operativos migrados desde papel/Excel al sistema.
- Número de checklists completados por semana por sucursal.
- Tiempo promedio para completar un checklist.
- % de formularios completados en tiempo.
- Nivel de cumplimiento promedio por sucursal / rol.

---

## Plan de implementación

### Fase 1 – Fundaciones técnicas
- Configurar esquema de Supabase descrito.
- Integrar autenticación y modelo de roles/perfiles.
- Definir tema base reutilizable en web y app móvil.

### Fase 2 – MVP formularios y ejecución
- Implementar web para:
  - Crear y editar formularios.
  - Asignar formularios a usuarios/roles/sucursales.
- Implementar app Flutter:
  - Autenticación Supabase.
  - Listado de formularios asignados.
  - Ejecución de formularios y envío de respuestas.

### Fase 3 – Consulta y exportación
- Implementar vistas web de:
  - Listado de ejecuciones y detalle de respuestas.
  - Exportación CSV/Excel.

### Fase 4 – KPIs y mejoras
- Agregar KPIs básicos.
- Evaluar e implementar:
  - Lógica condicional.
  - Campos de evidencia.
  - Soporte offline para la app móvil.

