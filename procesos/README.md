# Procesos

Esta carpeta contiene otros proyectos relacionados con el mismo cliente y el mismo proyecto general, pero que no forman parte directa de la app de inventarios Flutter que vive en la raíz del repositorio.

## Estructura sugerida

- `procesos/`
  - `backend/` (por ejemplo, scripts, workers, servicios batch, automatizaciones)
  - `herramientas/` (pequeñas utilidades, CLI, pruebas de concepto)
  - `docs/` (diagramas, flujos de procesos, documentación funcional/técnica específica de procesos)

Cada subcarpeta dentro de `procesos` debe tratarse como un proyecto independiente:

- Su propio `README.md` explicando qué hace y cómo se ejecuta.
- Su propia configuración (`pubspec.yaml`, `package.json`, etc.) si es un proyecto de código.

## Convenciones

- Reutilizar nombres y terminología del dominio (almacenes, inventarios, sesiones, usuarios) para mantener coherencia con la app principal.
- Evitar mezclar código de la app Flutter raíz dentro de `procesos`; si hay lógica compartida, crear módulos/bibliotecas comunes claramente separados.
- Mantener las configuraciones sensibles (.env, claves, etc.) fuera del control de versiones o bien centralizadas en la raíz del repo y referenciadas desde cada proyecto.

## Próximos pasos

- Crear la(s) subcarpeta(s) necesarias dentro de `procesos` para cada proyecto nuevo.
- Documentar en cada proyecto cómo se integra con el resto del sistema (por ejemplo, qué tablas de Supabase toca, qué colas o servicios externos usa, etc.).

