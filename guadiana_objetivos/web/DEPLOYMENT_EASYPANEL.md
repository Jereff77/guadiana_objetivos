# Guía de Despliegue en Easy Panel con Docker

## 📋 Requisitos Previos

- Easy Panel instalado en tu servidor
- Acceso a Supabase (URL y Anon Key)
- API Key de Anthropic Claude (opcional pero recomendado)
- Dominio configurado apuntando a tu servidor

## 🚀 Pasos de Despliegue

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.production.example .env.production
```

Edita `.env.production` con tus valores reales:

```env
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# URL del sitio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# Anthropic Claude (REQUERIDO para chat con GUADIANA)
ANTHROPIC_API_KEY=sk-ant-tu-key-aqui
```

### 2. Opción A: Despliegue Directo con Docker Compose

Sube los archivos siguientes a tu servidor:
- `Dockerfile`
- `docker-compose.yml`
- `.env.production`
- `next.config.ts`
- `package.json` y `package-lock.json`
- Todo el contenido de `src/`

Luego ejecuta:

```bash
docker-compose up -d --build
```

**NOTA**: El puerto configurado es **8080**. Asegúrate de que tu dominio apunte a `http://tu-servidor:8080`

### 2. Opción B: Despliegue desde Git en Easy Panel

1. En Easy Panel, crea un nuevo **Compose Stack**
2. Selecciona "From Git" o pega el contenido
3. Usa el siguiente `docker-compose.yml` para producción:

```yaml
services:
  app:
    image: ghcr.io/tu-usuario/guadiana-objetivos:latest
    container_name: guadiana-objetivos-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.guadiana.rule=Host(`tu-dominio.com`)"
      - "traefik.http.routers.guadiana.tls=true"
      - "traefik.http.routers.guadiana.tls.certresolver=letsencrypt"
```

### 3. Configurar Dominio en Easy Panel

Si usas Traefik (integrado en Easy Panel), añade estos labels al servicio:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.guadiana.rule=Host(`tu-dominio.com`)"
  - "traefik.http.routers.guadiana.tls=true"
  - "traefik.http.routers.guadiana.tls.certresolver=letsencrypt"
  - "traefik.http.routers.guadiana.entrypoints=websecure"
```

### 4. Verificar Despliegue

El contenedor incluye un health check. Verifica que esté funcionando:

```bash
docker logs guadiana-objetivos-app
curl http://localhost:8080/api/health
```

Deberías ver:

```json
{
  "status": "healthy",
  "timestamp": "2026-03-26T...",
  "app": "guadiana-objetivos"
}
```

## 🔧 Configuración Avanzada

### Con Nginx Reverse Proxy

Si prefieres usar Nginx en lugar de Traefik:

1. Actualiza el upstream en nginx.conf:

```nginx
upstream nextjs_app {
    server app:8080;
}
```

2. Añade el servicio nginx al docker-compose.yml:

```yaml
services:
  app:
    # ... configuración de la app ...

  nginx:
    image: nginx:alpine
    container_name: guadiana-objetivos-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

### Actualizaciones Automáticas

Para actualizaciones automáticas cuando haya cambios en el repo:

```yaml
labels:
  - "com.centurylinklabs.watchtower.enable=true"
  - "com.centurylinklabs.watchtower.scope=guadiana-objetivos"
```

## 📊 Monitoreo

Easy Panel mostrará:
- **Consumo de recursos**: CPU, RAM, Disco
- **Logs**: Logs del contenedor en tiempo real
- **Estado**: Health check status
- **Restart count**: Si el contenedor se reinicia

## 🐛 Troubleshooting

### La app no inicia

```bash
# Ver logs
docker logs guadiana-objetivos-app

# Verificar variables de entorno
docker exec guadiana-objetivos-app env | grep NEXT_PUBLIC

# Reconstruir desde cero
docker-compose down -v
docker-compose up -d --build
```

### Error de conexión a Supabase

Verifica que las variables de entorno estén correctamente configuradas:

```bash
docker exec guadiana-objetivos-app printenv | grep SUPABASE
```

### Health check falla

```bash
# Acceder al contenedor
docker exec -it guadiana-objetivos-app sh

# Verificar que Next.js está corriendo
wget -O- http://localhost:8080/api/health
```

## 🔐 Seguridad en Producción

1. **Nunca commitear** `.env.production`
2. **Usar secrets** de Easy Panel para credenciales sensibles
3. **Configurar HTTPS** con certificados Let's Encrypt
4. **Limitar tasa** de requests en Traefik si es necesario
5. **Backups automáticos** de la base de datos Supabase

## 📦 Estructura de Archivos para Despliegue

```
guadiana_objetivos/web/
├── Dockerfile
├── docker-compose.yml
├── .env.production (crear desde ejemplo)
├── nginx.conf (opcional)
├── package.json
├── next.config.ts
└── src/
    └── app/
        └── api/
            └── health/
                └── route.ts
```

## ✅ Checklist Pre-Despliegue

- [ ] `.env.production` creado con todos los valores
- [ ] Supabase migrations aplicadas en producción
- [ ] API Keys de IA configuradas (Anthropic u otro)
- [ ] Health check endpoint creado y accesible
- [ ] Dominio apuntando al servidor
- [ ] Easy Panel instalado y accesible
- [ ] Puerto 8080 disponible (configurado en Dockerfile y docker-compose.yml)
- [ ] Traefik o Nginx configurado para HTTPS
- [ ] Backups automáticos configurados

## 🚀 Comandos Útiles

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache app

# Actualizar a la última versión
docker-compose pull
docker-compose up -d

# Ver recursos consumidos
docker stats guadiana-objetivos-app
```

## 📞 Soporte

Si encuentras problemas:

1. Verifica los logs del contenedor
2. Verifica que Supabase sea accesible
3. Verifica las variables de entorno
4. Revisa esta documentación

---

**Versión**: 1.0
**Última actualización**: 2026-03-26
**Stack**: Next.js 15, Docker, Easy Panel
