# 🚀 Despliegue Rápido - Guadiana Objetivos

**Easy Panel con Docker** | Puerto **8080**

## 📋 Pre-despliegue

### 1. Configurar variables de entorno

El archivo `.env.production` ya está creado con las credenciales de Supabase.

Solo necesitas cambiar **2 valores**:

```bash
# Editar .env.production
nano .env.production
```

**Cambiar estos valores:**

```env
# ⚠️ CAMBIAR: Tu dominio real
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# ⚠️ CAMBIAR: Tu API key de Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-tu-key-real-aqui
```

## 🚀 Opciones de Despliegue

### Opción 1: Script Automático (Recomendado)

```bash
chmod +x deploy.sh
./deploy.sh
```

### Opción 2: Docker Compose Manual

```bash
docker-compose up -d --build
```

### Opción 3: Desde Easy Panel (Interfaz Web)

1. Abre Easy Panel en tu servidor
2. Crea nuevo **Compose Stack**
3. Pega el contenido de `docker-compose.yml`
4. Añade las variables de entorno desde `.env.production`
5. Click en **Deploy**

## ✅ Verificar Despliegue

```bash
# Health check
curl http://localhost:8080/api/health

# Ver logs
docker-compose logs -f app

# Ver contenedores
docker-compose ps
```

## 🌐 Configurar Dominio

Entra a `http://tu-servidor:8080` y verifica que la aplicación funcione.

Luego configura tu dominio para apuntar a `http://tu-servidor:8080`

### Con Traefik (Easy Panel integrado)

Añade estos labels al servicio en `docker-compose.yml`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.guadiana.rule=Host(`tu-dominio.com`)"
  - "traefik.http.routers.guadiana.tls=true"
  - "traefik.http.routers.guadiana.tls.certresolver=letsencrypt"
```

### Con Nginx (Reverse Proxy)

Usa el archivo `nginx.conf` incluido:

```bash
# Añade al docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar contenedor
docker-compose restart app

# Detener todo
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache

# Entrar al contenedor
docker exec -it guadiana-objetivos-app sh
```

## 📊 Monitoreo

Easy Panel mostrará:
- **Consumo de recursos**: CPU, RAM, Disco
- **Logs**: En tiempo real
- **Estado**: Health check status
- **Restart count**: Si el contenedor se reinicia

## 🐛 Troubleshooting

### La app no inicia

```bash
# Ver logs del error
docker-compose logs app

# Verificar variables de entorno
docker exec guadiana-objetivos-app env | grep NEXT_PUBLIC
```

### Error de conexión a Supabase

Verifica que las credenciales sean correctas en `.env.production`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mhdswebflviruafdlkvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (tu-key-completa)
```

### Health check falla

```bash
# Acceder al contenedor
docker exec -it guadiana-objetivos-app sh

# Verificar que Next.js está corriendo
wget -O- http://localhost:8080/api/health
```

## 🔒 Seguridad

- ✅ Usuario non-root (nextjs:nodejs)
- ✅ Variables de entorno en `.env.production` (no en git)
- ✅ Health check con wget
- ✅ Restart policy: unless-stopped

## 📝 Archivos Incluidos

```
guadiana_objetivos/web/
├── Dockerfile                    # Imagen multi-stage optimizada
├── docker-compose.yml            # Orquestación de servicios
├── .env.production               # Variables de entorno (creado)
├── .env.production.example       # Template de variables
├── .dockerignore                 # Exclusiones de build
├── nginx.conf                    # Config Nginx opcional
├── deploy.sh                     # Script de despliegue automático
├── README_DEPLOY.md              # Esta guía
└── DEPLOYMENT_EASYPANEL.md       # Guía completa detallada
```

## 🎯 Checklist

Antes de desplegar en producción:

- [ ] `.env.production` configurado con dominio real
- [ ] `ANTHROPIC_API_KEY` configurada
- [ ] Supabase migrations aplicadas
- [ ] Puerto 8080 disponible
- [ ] Dominio apuntando al servidor
- [ ] Traefik o Nginx configurado para HTTPS
- [ ] Backups automáticos configurados

---

**Versión**: 1.0 | **Puerto**: 8080 | **Fecha**: 2026-03-26
