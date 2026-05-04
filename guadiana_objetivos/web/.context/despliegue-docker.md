# Despliegue y Docker - Guadiana Objetivos

**Última actualización**: 2026-05-02
**Entorno**: Hostinger Node.js con PM2

## Configuración Docker

### Dockerfile (Multi-Stage Build)
**Ubicación**: `web/Dockerfile`

```dockerfile
# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDeps needed for build)
RUN npm ci && \
    npm cache clean --force

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time args para NEXT_PUBLIC_* (se hornean en el bundle)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ========================================
# Stage 3: Runner
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install dumb-init para signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 8080

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
```

### Por Qué Multi-Stage
1. **deps**: Instala dependencias una sola vez (cacheable)
2. **builder**: Compila la app con variables de entorno
3. **runner**: Imagen minimal con solo archivos necesarios

---

## Variables de Entorno

### Requeridas para Build
```bash
# Solo accesibles en build-time (se hornean en el bundle)
NEXT_PUBLIC_SUPABASE_URL=https://mhdswebflviruafdlkvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

### Requeridas para Runtime
```bash
# Estas variables van en .env del servidor
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Service role key (NUNCA exponer)
NODE_ENV=production
PORT=8080
```

### Archivo `.env.local` (Desarrollo)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://mhdswebflviruafdlkvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# IA (opcional)
GOOGLE_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant...

# Python IA Service (legacy)
PYTHON_AI_SERVICE_URL=http://localhost:8000
PYTHON_AI_SERVICE_API_KEY=change-me-in-production
```

---

## Proceso de Despliegue

### Build de Imagen Docker
```bash
# Desde la raíz del proyecto
cd web

# Build imagen con build args
docker build -t guadiana-objetivos:latest \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --build-arg NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
  .
```

### Taggear y Subir a Registry
```bash
# Taggear
docker tag guadiana-objetivos:latest registry.tu-dominio.com/guadiana-objetivos:latest

# Subir
docker push registry.tu-dominio.com/guadiana-objetivos:latest
```

### Deploy en Servidor con PM2
```bash
# SSH al servidor
ssh user@tu-servidor.com

# Pull nueva imagen
docker pull registry.tu-dominio.com/guadiana-objetivos:latest

# Detener contenedor anterior
docker stop guadiana-objetivos
docker rm guadiana-objetivos

# Iniciar nuevo contenedor
docker run -d \
  --name guadiana-objetivos \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  registry.tu-dominio.com/guadiana-objetivos:latest
```

### Deploy Script Alternativo
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🏗️ Building Docker image..."
docker build -t guadiana-objetivos:latest .

echo "📦 Tagging image..."
docker tag guadiana-objetivos:latest registry.tu-dominio.com/guadiana-objetivos:latest

echo "⬆️ Pushing image..."
docker push registry.tu-dominio.com/guadiana-objetivos:latest

echo "🚀 Deploying to server..."
ssh user@tu-servidor.com << 'ENDSSH'
  docker pull registry.tu-dominio.com/guadiana-objetivos:latest
  docker stop guadiana-objetivos || true
  docker rm guadiana-objetivos || true
  docker run -d --name guadiana-objetivos --restart unless-stopped -p 8080:8080 registry.tu-dominio.com/guadiana-objetivos:latest
ENDSSH

echo "✅ Deploy complete!"
```

---

## Health Checks

### Endpoint `/api/health`
**Ubicación**: `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    app: 'guadiana-objetivos',
    version: process.env.npm_package_version || '0.1.1'
  })
}
```

### Health Check en PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'guadiana-objetivos',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    health_check_grace_period: 30000,
    min_uptime: '10s',
    max_restarts: 10,
  }]
}
```

### Docker Healthcheck
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

---

## Configuración de Nginx (Reverse Proxy)

### /etc/nginx/sites-available/guadiana-objetivos
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/health {
        proxy_pass http://localhost:8080/api/health;
        access_log off;
    }
}
```

---

## Logs y Monitoreo

### PM2 Logs
```bash
# Ver logs en tiempo real
pm2 logs guadiana-objetivos

# Guardar logs en archivo
pm2 logs guadiana-objetivos --output /var/log/guadiana-objetivos.log
```

### Docker Logs
```bash
# Ver logs del contenedor
docker logs -f guadiana-objetivos

# Últimas 100 líneas
docker logs --tail 100 guadiana-objetivos
```

### Nginx Logs
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

---

## Backup y Restore

### Backup de Base de Datos Supabase
```bash
# Usar Supabase CLI
supabase db dump -f backup.sql

# O desde pg_dump
pg_dump -h db.mhdswebflviruafdlkvb.supabase.co \
  -U postgres \
  -d postgres \
  -F c -f backup.dump
```

### Restore
```bash
# Desde Supabase CLI
supabase db reset --db-url "postgresql://..."

# O desde pg_restore
pg_restore -h db.mhdswebflviruafdlkvb.supabase.co \
  -U postgres \
  -d postgres \
  backup.dump
```

### Backup de Storage
```bash
# Usar Supabase CLI o rclone
supabase storage download --bucket objective-evidences --path ./backups
```

---

## Rollback

### Rollback a Versión Anterior
```bash
# En el servidor
docker stop guadiana-objetivos
docker rm guadiana-objetivos

# Iniciar versión anterior
docker run -d \
  --name guadiana-objetivos \
  --restart unless-stopped \
  -p 8080:8080 \
  registry.tu-dominio.com/guadiana-objetivos:v1.0.0
```

### Rollback con Git
```bash
# En local
git checkout previous-commit
docker build -t guadiana-objetivos:rollback .
docker push registry.tu-dominio.com/guadiana-objetivos:rollback

# En servidor
docker pull registry.tu-dominio.com/guadiana-objetivos:rollback
# ... restart con nueva imagen
```

---

## Security Best Practices

### 1. No Exponer Secrets en Imagen
```dockerfile
# ❌ MAL
ENV SUPABASE_SERVICE_ROLE_KEY=sk-...

# ✅ BIEN
# Pasar como -e en docker run
docker run -e SUPABASE_SERVICE_ROLE_KEY=$SECRET ...
```

### 2. Usar Usuario Non-Root
```dockerfile
USER nextjs
```

### 3. Scan de Vulnerabilidades
```bash
# Usar Trivy
trivy image guadiana-objetivos:latest
```

### 4. Actualizaciones Regulares
```bash
# Actualizar base Alpine
FROM node:20-alpine AS builder
RUN apk update && apk upgrade
```

### 5. HTTPS Only
```nginx
# Nginx redirect HTTP → HTTPS
return 301 https://$server_name$request_uri;
```

---

## Performance

### Optimizaciones de Next.js
```typescript
// next.config.ts
export default {
  output: 'standalone',  // Bundle minimal
  compress: true,        // Gzip/Brotli
  images: {
    formats: ['image/avif', 'image/webp']
  }
}
```

### Cache de Assets
```typescript
// next.config.ts headers
{
  source: '/_next/static/(.*)',
  headers: [{
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable'
  }]
}
```

---

## Troubleshooting

### Contenedor no inicia
```bash
# Ver logs
docker logs guadiana-objetivos

# Verificar variables de entorno
docker exec guadiana-objetivos env

# Shell al contenedor
docker exec -it guadiana-objetivos sh
```

### Error "Cannot connect to Supabase"
```bash
# Verificar URL y ANON KEY
docker exec guadiana-objetivos printenv | grep SUPABASE

# Test connectivity
docker exec guadiana-objetivos wget -O- https://mhdswebflviruafdlkvb.supabase.co
```

### Error 502 Bad Gateway
```bash
# Verificar si contenedor está corriendo
docker ps | grep guadiana-objetivos

# Verificar si puerto 8080 está escuchando
docker exec guadiana-objetivos netstat -tlnp
```

### Build falla
```bash
# Limpiar cache de Next.js
rm -rf .next

# Limpiar cache Docker
docker system prune -a
```
