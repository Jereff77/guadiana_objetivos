# Plan de Desarrollo Detallado – Plataforma Web Guadiana Checklists

Este documento detalla las tareas necesarias para el desarrollo de la plataforma web de gestión de checklists y encuestas, divididas por fases y organizadas por prioridad.

---

## Fase 1: Fundaciones y Configuración Inicial
*Configuración del entorno de desarrollo y base de datos.*

- [x] **[T-101]** Inicializar proyecto Next.js 14+ con TypeScript y Tailwind CSS dentro de `guadiana_objetivos/`.
- [x] **[T-102]** Configurar cliente de Supabase y variables de entorno.
- [x] **[T-103]** Implementar sistema de diseño base (colores corporativos, tipografía, componentes UI básicos con Shadcn/UI).
- [x] **[T-104]** Configurar Supabase Auth (Login/Logout) y Middleware para rutas protegidas.
- [x] **[T-105]** Crear esquema de base de datos en Supabase (Tablas `form_*` y `resp_*` según especificación).
- [x] **[T-106]** Implementar Políticas de Seguridad (RLS) para roles Admin y Jefe de Sucursal.

---

## Fase 2: Constructor de Formularios (Core)
*Desarrollo de la herramienta principal para crear y editar checklists.*

- [x] **[T-201]** Desarrollar Dashboard de formularios (Lista de borradores, publicados y archivados).
- [x] **[T-202]** Crear interfaz del Editor de Formularios (Layout de paneles).
- [x] **[T-203]** Implementar gestión de Secciones (Crear, editar, reordenar).
- [x] **[T-204]** Desarrollar componentes de Preguntas (Boolean, Única, Múltiple, Texto, Número, Fecha).
- [x] **[T-205]** Implementar funcionalidad de reordenamiento (Drag & Drop) para preguntas y secciones.
- [x] **[T-206]** Desarrollar sistema de guardado automático y validación de integridad del formulario.
- [x] **[T-207]** Implementar configuración de puntajes por respuesta (Lógica de KPIs).

---

## Fase 3: Asignaciones y Publicación
*Control de quién responde qué y cuándo.*

- [x] **[T-301]** Implementar flujo de publicación de formularios (Cambio de estado y versionamiento).
- [x] **[T-302]** Crear módulo de Asignaciones (Asignar a sucursales, roles o usuarios específicos).
- [x] **[T-303]** Desarrollar selector de vigencia y frecuencia para las asignaciones.
- [x] **[T-304]** Implementar vista previa del formulario simulando la App Móvil.

---

## Fase 4: Dashboard de Resultados y Reportes
*Visualización y extracción de los datos recolectados.*

- [x] **[T-401]** Desarrollar visor de Ejecuciones (Lista filtrable por fecha, sucursal, usuario y estatus).
- [x] **[T-402]** Crear vista de Detalle de Ejecución (Visualización de respuestas y comentarios de "Acciones a seguir").
- [x] **[T-403]** Implementar exportación a Excel/CSV de resultados filtrados.
- [x] **[T-404]** Desarrollar gráficas básicas de cumplimiento y KPIs (Promedios por sucursal).

---

## Fase 5: Pulido y Entrega (MVP)
*Aseguramiento de calidad y despliegue final.*

- [x] **[T-501]** Realizar pruebas de integración entre Web y Supabase.
- [ ] **[T-502]** Optimización de rendimiento y SEO básico para la plataforma.
- [ ] **[T-503]** Auditoría de seguridad de políticas RLS.
- [ ] **[T-504]** Despliegue inicial y capacitación para administradores.

---

## Control de Progreso
| Fase | Estado | Progreso |
| :--- | :--- | :--- |
| Fase 1 | Completada | 100% |
| Fase 2 | Completada | 100% |
| Fase 3 | Completada | 100% |
| Fase 4 | Completada | 100% |
| Fase 5 | En progreso | 0% |
