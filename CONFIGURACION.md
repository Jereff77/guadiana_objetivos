# 🚀 Guía de Configuración - Guadiana App

## 📋 Requisitos Previos

1. **Flutter SDK**: 3.4.3 o superior
2. **Android SDK**: 35 o superior
3. **Credenciales de Supabase**: URL y clave anónima

## 🔧 Configuración de Supabase

### Opción 1: Archivo .env (Recomendado)
1. Copia el archivo `.env.example` a `.env`
2. Edita el archivo `.env` con tus credenciales:

```env
# Reemplaza con tus datos reales
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima-aqui
FLUTTER_ENV=development
```

### Opción 2: Variables de Entorno
```bash
flutter run --dart-define=SUPABASE_URL=https://tu-proyecto.supabase.co --dart-define=SUPABASE_ANON_KEY=tu-clave-anonima
```

## 📱 Instalación del APK

### APK de Prueba
- **Ubicación**: `build/app/outputs/flutter-apk/app-release.apk`
- **Tamaño**: 34.2 MB
- **Requisitos**: Android 5.0 (API 21) o superior

### Pasos para Instalar:
1. Copia el archivo `app-release.apk` a tu dispositivo Android
2. Activa "Fuentes desconocidas" en configuración de seguridad
3. Instala el APK
4. Abre la aplicación y configura las credenciales si es necesario

## 🎯 Funcionalidades Implementadas

### ✅ Nombres de Usuario en Revisión de Inventario
- **Auditores**: Ven nombres completos de usuarios que realizaron conteos
- **Almacenistas**: Ven "Tú" en sus propios conteos
- **Mejora visual**: Indicadores de sincronización y fechas

### ✅ Filtros para Almacenistas
- **Filtro por estado**: Abierto/Cerrado
- **Filtro por fechas**: Rango de fechas de creación
- **Filtro por usuario**: Solo visible para auditores
- **Seguridad**: Los almacenistas solo ven sus propios inventarios

## 🔍 Solución de Problemas Comunes

### Error: "SUPABASE_URL y/o SUPABASE_ANON_KEY no configurados"
**Solución**: Configura las credenciales usando el archivo `.env` o variables de entorno

### Error: "El plugin sqlite3_flutter_libs requiere Android SDK versión 35"
**Solución**: Ya está solucionado en la configuración del proyecto

### Error: "No se pueden editar los conteos"
**Causa**: La sesión de inventario está cerrada
**Solución**: Inicia una nueva sesión de inventario

## 📞 Soporte

Si tienes problemas con la configuración:
1. Verifica que las credenciales de Supabase sean correctas
2. Asegúrate de tener conexión a internet
3. Revisa que tu dispositivo cumpla con los requisitos mínimos

## 🔄 Actualización

Para actualizar la aplicación después de cambios:
```bash
flutter clean
flutter pub get
flutter build apk --release