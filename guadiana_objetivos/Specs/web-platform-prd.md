# PRD – Plataforma Web de Gestión de Checklists y Encuestas (Next.js)

## 1. Resumen Ejecutivo

### Problema
Llantas y Rines del Guadiana actualmente gestiona sus auditorías y KPIs de forma manual (Excel/Papel), lo que genera falta de estandarización, dificultad en la trazabilidad y lentitud en el análisis de datos.

### Solución
Una plataforma web robusta construida con **Next.js** que permita a los administradores diseñar formularios dinámicos, asignar tareas a sucursales/roles y visualizar resultados en tiempo real, centralizando la información en Supabase.

### Objetivo
Digitalizar el 100% de los procesos de auditoría interna, reduciendo el tiempo de consolidación de datos y permitiendo una toma de decisiones basada en métricas precisas.

---

## 2. Usuarios Objetivo

- **Administrador Global**: Control total sobre plantillas, usuarios y configuraciones de la organización.
- **Jefe de Área / Sucursal**: Gestiona asignaciones específicas para su ámbito y revisa el desempeño de su equipo.
- **Analista de Datos**: Consulta y exporta resultados para la generación de reportes estratégicos.

---

## 3. Features Principales

### P1 (Must-Have - MVP)
- **Constructor de Formularios (Form Builder)**:
  - Interfaz Drag & Drop para crear secciones y preguntas.
  - Soporte para tipos de datos: Boolean (Sí/No), Opción Única/Múltiple, Texto, Número, Fecha.
  - Configuración de puntajes por respuesta para cálculo automático de KPIs.
- **Gestor de Asignaciones**:
  - Asignación masiva por rol (Asesor, Operario) o por sucursal.
  - Definición de periodos de vigencia.
- **Dashboard de Resultados**:
  - Vista tabular de ejecuciones completadas.
  - Detalle individual de cada respuesta con sus comentarios ("Acciones a seguir").
- **Exportación de Datos**:
  - Botón para exportar resultados filtrados a Excel/CSV.

### P2 (Should-Have)
- **Visualización de KPIs**:
  - Gráficas de cumplimiento por sucursal y tendencia temporal.
- **Control de Versiones**:
  - Posibilidad de editar formularios publicados creando una nueva versión sin perder datos históricos.
- **Previsualización Real-time**:
  - Ver cómo se verá el formulario en la app móvil mientras se diseña.

### P3 (Nice-to-Have)
- **Lógica Condicional**: Mostrar/ocultar preguntas basadas en respuestas previas.
- **Notificaciones Push**: Enviar alertas a la app móvil desde la web para auditorías urgentes.

---

## 4. Análisis Competitivo

| Competidor | Fortalezas | Debilidades | Diferenciador Guadiana |
| :--- | :--- | :--- | :--- |
| **SafetyCulture (iAuditor)** | Muy completo, offline excelente. | Costo por usuario elevado, complejo para PYMEs. | Integración nativa con procesos existentes y costo controlado. |
| **GoAudits** | Dashboards de 360 grados, alertas automáticas. | Menos flexibilidad en el diseño de formularios personalizados. | Foco específico en el flujo operativo de Llantas y Rines. |
| **Form.com** | Muy potente para empresas grandes, AI en imágenes. | Curva de aprendizaje alta, requiere mucha configuración. | Simplicidad y rapidez de despliegue con Next.js + Supabase. |

---

## 5. Features por Competitividad

- **Diferenciador Clave**: El sistema permite una columna de "Acciones a seguir" obligatoria para respuestas negativas, cerrando el ciclo de auditoría en el momento de la captura.
- **Estructura IA-Ready**: Aunque el MVP no incluye IA activa, cada formulario tiene un campo `ai_context` para que, en la Fase 2, un modelo de lenguaje pueda analizar automáticamente las fallas recurrentes.

---

## 6. No-Goals (Fuera de Alcance MVP Web)
- Ejecución de formularios desde la web (se reserva exclusivamente para la App Móvil).
- Edición de fotos/evidencia (se maneja en la App).
- Integración con sistemas de nómina externos.

---

## 7. Constraints Técnicos

- **Framework**: Next.js (React) con TypeScript.
- **Base de Datos**: Supabase (PostgreSQL).
- **Estilo**: Tailwind CSS siguiendo la paleta corporativa (Azul: `#004B8D`, Naranja: `#FF8F1C`).
- **Autenticación**: Supabase Auth con RLS estricto.

---

## 8. Métricas de Éxito (KPIs)
- **Adopción**: 100% de las sucursales usando la plataforma en 3 meses.
- **Eficiencia**: Reducción del 80% en el tiempo de generación de reportes mensuales.
- **Calidad**: Identificación proactiva de 3 áreas de mejora crítica por sucursal al mes mediante los datos recolectados.

---

## 9. Timeline Sugerido

- **Semana 1**: Configuración de Base de Datos y Auth.
- **Semana 2-3**: Desarrollo del Form Builder y Esquema de Tablas.
- **Semana 4**: Módulo de Asignaciones y Listado de Respuestas.
- **Semana 5**: Exportación y Pulido de UI.
