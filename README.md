# guadiana_objetivos

Repositorio principal del proyecto Guadiana para este cliente. Contiene la app de inventarios Flutter y otros proyectos relacionados que forman parte del mismo sistema.

## Estructura general

- `lib/`, `android/`, `ios/`, `web/`, etc.: código de la app Flutter principal (gestión de inventarios).
- `documentos/`: documentación funcional y técnica (por ejemplo la especificación de la app de inventarios).
- `tool/`: scripts y utilidades de soporte (seed, configuración de base de datos, etc.).
- `procesos/`: proyectos adicionales relacionados con procesos del cliente (servicios, herramientas, automatizaciones, etc.).

## Apps y proyectos

- **App de inventarios (Flutter)**  
  Proyecto principal para la gestión de inventarios, con soporte offline y sincronización con Supabase.

- **Procesos**  
  Carpeta pensada para alojar otros proyectos del mismo cliente (por ejemplo procesos batch, backoffice, herramientas internas). Cada proyecto dentro de `procesos` debe tener su propio `README.md` y su propia configuración.

## Convenciones

- Mantener cada proyecto encapsulado en su carpeta, sin mezclar configuraciones (por ejemplo, cada app Flutter o servicio con su propio archivo de configuración).
- Compartir solo lo necesario mediante módulos/utilidades comunes claramente identificados.
- Seguir las mismas reglas de estilo y calidad (lint, pruebas) en todos los subproyectos.
