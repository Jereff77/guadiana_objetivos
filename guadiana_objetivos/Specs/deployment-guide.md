# Guía de Despliegue – Guadiana Checklists Web
**Versión:** 1.0 MVP
**Fecha:** 2026-03-20
**Plataforma destino:** Hostinger Node.js

---

## Requisitos del Servidor

| Requisito | Valor mínimo |
|---|---|
| Node.js | 18.x o superior |
| RAM | 512 MB |
| Disco | 500 MB libres |
| Puerto | 3000 (configurable via `PORT`) |

---

## Variables de Entorno

Crear el archivo `.env.production` (o configurarlas en el panel de Hostinger):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mhdswebflviruafdlkvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_de_supabase>

# URL pública del sitio (sin barra final)
NEXT_PUBLIC_SITE_URL=https://tu-dominio.hostinger.com

# Node environment
NODE_ENV=production
PORT=3000
```

> **Importante:** Obtener `NEXT_PUBLIC_SUPABASE_ANON_KEY` en:
> Supabase Dashboard → Project Settings → API → Project API keys → `anon public`

---

## Configurar Supabase Auth (una sola vez)

1. Ir a **Supabase Dashboard** → Authentication → URL Configuration
2. **Site URL:** `https://tu-dominio.hostinger.com`
3. **Redirect URLs:** Agregar `https://tu-dominio.hostinger.com/**`
4. Guardar cambios

---

## Proceso de Despliegue

### Opción A: Build local + subir al servidor

```bash
# 1. Clonar o actualizar el repositorio
git pull origin main

# 2. Instalar dependencias
cd guadiana_objetivos/web
npm install

# 3. Generar el build de producción standalone
npm run build

# El output se genera en: .next/standalone/
```

**Archivos a subir al servidor Hostinger:**
```
.next/standalone/           → subir completo
.next/static/               → subir a .next/static/ dentro de standalone
public/                     → subir a public/ dentro de standalone
```

**Estructura final en el servidor:**
```
/app/
├── .next/
│   ├── standalone/
│   │   ├── server.js          ← punto de entrada
│   │   ├── .next/
│   │   └── node_modules/
│   └── static/               ← assets estáticos (copiados aquí)
└── public/                   ← archivos públicos (copiados aquí)
```

### Opción B: Deploy directo con PM2

```bash
# En el servidor, desde el directorio standalone:
npm install -g pm2

# Iniciar la aplicación
PORT=3000 pm2 start server.js --name guadiana-checklists

# Configurar inicio automático
pm2 startup
pm2 save

# Ver logs
pm2 logs guadiana-checklists

# Reiniciar después de deploy
pm2 restart guadiana-checklists
```

### Script de deploy automático

```bash
#!/bin/bash
# deploy.sh — ejecutar en el servidor después de actualizar los archivos

set -e

echo "=== Guadiana Checklists Deploy ==="

# Copiar assets estáticos al lugar correcto
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Reiniciar la aplicación
pm2 restart guadiana-checklists || pm2 start .next/standalone/server.js --name guadiana-checklists

echo "=== Deploy completado ==="
pm2 status guadiana-checklists
```

---

## Verificación Post-Deploy

Comprobar que las siguientes URLs respondan correctamente:

| URL | Resultado esperado |
|---|---|
| `https://tu-dominio.com/` | Redirect a `/dashboard` |
| `https://tu-dominio.com/login` | Página de login |
| `https://tu-dominio.com/formularios` | Lista de formularios (requiere sesión) |
| `https://tu-dominio.com/resultados` | Lista de resultados (requiere sesión) |
| `https://tu-dominio.com/api/resultados/export` | Respuesta 401 (sin sesión) |

---

## Actualizaciones Futuras

```bash
# 1. Hacer pull de los cambios
git pull origin main

# 2. Reinstalar dependencias si cambiaron
npm install

# 3. Rebuild
npm run build

# 4. Copiar assets y reiniciar (ver script deploy.sh arriba)
bash deploy.sh
```

---

# Guía de Capacitación – Administradores

## Acceso al Sistema

1. Ir a `https://tu-dominio.com`
2. Ingresar con email y contraseña
3. Si se olvidó la contraseña: clic en **"¿Olvidaste tu contraseña?"** → ingresar email → revisar correo → seguir el enlace

---

## Módulo: Formularios

### Crear un nuevo formulario

1. Ir a **Formularios** en el menú lateral
2. Clic en **"Nuevo formulario"**
3. Ingresar nombre y descripción → **Crear**
4. En el editor:
   - Panel izquierdo: estructura (secciones y preguntas)
   - Panel derecho: propiedades del elemento seleccionado
5. **Agregar sección:** Botón "+" en el panel izquierdo
6. **Agregar pregunta:** Seleccionar una sección → botón "+" → elegir tipo
7. Los cambios se guardan automáticamente (indicador en la barra superior)

### Tipos de pregunta disponibles

| Tipo | Uso recomendado |
|---|---|
| **Sí / No** | Verificaciones binarias (ej. "¿Limpio el área?") |
| **Opción única** | Evaluaciones con criterios (ej. Excelente/Bueno/Regular/Deficiente) |
| **Opción múltiple** | Selección de múltiples items |
| **Texto corto** | Observaciones breves |
| **Texto largo** | Descripciones detalladas |
| **Número** | Métricas numéricas (ej. temperatura, inventario) |
| **Fecha** | Fechas de vencimiento, eventos |

### Puntajes KPI

- Cada opción de respuesta puede tener un puntaje (0–100)
- El sistema calcula el puntaje máximo posible automáticamente
- Usado para generar el % de cumplimiento en estadísticas

### Publicar un formulario

1. El formulario debe tener al menos **1 sección con 1 pregunta**
2. Clic en **"Publicar"** en la barra superior del editor
3. Una vez publicado, no se puede editar directamente
4. Para modificarlo: **"Crear nueva versión"** → editar el borrador → publicar

---

## Módulo: Asignaciones

### Crear una asignación

1. Ir a **Asignaciones** → **"Nueva asignación"**
2. Seleccionar:
   - **Formulario:** solo aparecen los publicados
   - **Tipo:** Por rol (todos los usuarios con ese rol) o Usuario específico
   - **Frecuencia:** Una vez / Diario / Semanal / Mensual
   - **Vigencia:** Fechas de inicio y fin (opcional)
3. Clic en **"Crear asignación"**

### Activar / Desactivar asignaciones

- En la tabla de asignaciones → menú de acciones (⋮) → **Activar** o **Desactivar**
- Las asignaciones inactivas no aparecen en la app móvil

---

## Módulo: Resultados

### Ver ejecuciones

1. Ir a **Resultados**
2. Filtrar por: Estado, Fecha desde, Fecha hasta → **"Filtrar"**
3. Clic en el ícono → para ver el detalle de una ejecución

### Exportar a Excel

1. Aplicar los filtros deseados
2. Clic en **"Exportar CSV"**
3. El archivo `.csv` se descarga — abrir con Excel (compatible UTF-8)

### Ver estadísticas y KPIs

1. Clic en **"Estadísticas"** en la página de Resultados
2. Visualiza:
   - KPI cards: Total, Completadas, En progreso, % Cumplimiento
   - Gráfica de ejecuciones por formulario
   - Tendencia semanal
   - Cumplimiento por sucursal (verde ≥80%, naranja ≥50%, rojo <50%)

---

## Soporte

Para reportar problemas o solicitar cambios, contactar al equipo de desarrollo con:
- Descripción del problema
- Captura de pantalla
- Usuario afectado
- Fecha y hora del incidente
