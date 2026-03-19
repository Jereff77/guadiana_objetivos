# guadiana_objetivos

Repositorio principal del proyecto Guadiana para este cliente. Contiene la app de inventarios Flutter y otros proyectos relacionados que forman parte del mismo sistema, organizados como monorepo.

## Estructura general

- `inventarios/`: app Flutter principal de gestión de inventarios (antes estaba en la raíz).
- `procesos/`: proyectos adicionales relacionados con procesos del cliente (servicios, herramientas, automatizaciones, etc.).
- `documentos/`: documentación funcional y técnica (por ejemplo la especificación de la app de inventarios).
- `guadiana_objetivos/`: otros artefactos o proyectos históricos asociados.

## Apps y proyectos

- **App de inventarios (Flutter)**  
  Vive en `inventarios/`. Es el proyecto principal para la gestión de inventarios, con soporte offline y sincronización con Supabase.

- **Procesos**  
  Carpeta pensada para alojar otros proyectos del mismo cliente (por ejemplo procesos batch, backoffice, herramientas internas). Cada proyecto dentro de `procesos` debe tener su propio `README.md` y su propia configuración.

## Convenciones

- Mantener cada proyecto encapsulado en su carpeta, sin mezclar configuraciones (por ejemplo, cada app Flutter o servicio con su propio archivo de configuración).
- Compartir solo lo necesario mediante módulos/utilidades comunes claramente identificados.
- Seguir las mismas reglas de estilo y calidad (lint, pruebas) en todos los subproyectos.
