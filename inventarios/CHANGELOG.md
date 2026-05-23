# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versiones siguiendo [Versionado Semántico](https://semver.org/lang/es/).

---

## [1.0.0] - 2026-05-22

### Primera versión de producción

#### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Recuperación y restablecimiento de contraseña
- Persistencia del último email usado

#### Inventarios
- Captura de inventario por almacén con escáner de código de barras
- Historial de conteos por producto
- Revisión de inventario con comparativa esperado vs. contado
- Reportes de inventario exportables
- Notas por registro de inventario
- Filtros mejorados en listados

#### Sincronización
- Sincronización offline/online con Supabase (SQLite local + Drift)
- Detección automática de conectividad

#### General
- Selección de almacén al iniciar sesión
- Dashboard principal
- Perfil de usuario
- Control de roles y permisos
- Versión visible en pantalla de login

---

## Guía de versionado

- **MAJOR** (`X.0.0`): Cambios incompatibles o reestructuración completa
- **MINOR** (`1.X.0`): Nueva funcionalidad compatible hacia atrás
- **PATCH** (`1.0.X`): Corrección de errores y ajustes menores
- **Build number** (`+N`): Se incrementa en cada build para las tiendas
