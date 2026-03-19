# Inventarios

App Flutter de gestión de inventarios del proyecto Guadiana.

## Ubicación en el monorepo

Este proyecto vive en `inventarios/` dentro del repositorio `guadiana_objetivos`.

## Cómo ejecutar

Desde la raíz del proyecto de inventarios:

```bash
cd inventarios
flutter pub get
flutter run
```

## Estructura

- `lib/`: código Dart principal de la app.
- `android/`, `ios/`, `web/`, `linux/`, `macos/`, `windows/`: plataformas soportadas.
- `assets/`, `img/`: recursos estáticos.
- `tool/`: scripts (seed de base de datos, configuración de Supabase, etc.).

La documentación funcional y técnica general está en `../documentos/` en la raíz del monorepo.

