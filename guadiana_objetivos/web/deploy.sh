#!/bin/bash
# ========================================
# Script de Despliegue - Guadiana Objetivos
# ========================================
# Easy Panel con Docker en puerto 8080

set -e

echo "🚀 Desplegando Guadiana Objetivos en Easy Panel..."
echo ""

# Verificar que .env.production existe
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production no encontrado"
    echo "   Primero ejecuta: cp .env.production.example .env.production"
    echo "   Y edita .env.production con tus valores reales"
    exit 1
fi

# Verificar variables críticas
echo "📋 Verificando configuración..."

if grep -q "your-domain.com" .env.production; then
    echo "⚠️  ADVERTENCIA: NEXT_PUBLIC_SITE_URL está configurado como localhost"
    echo "   Debes cambiarlo a tu dominio real antes de continuar"
    echo ""
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if grep -q "sk-ant-your-key-here" .env.production; then
    echo "⚠️  ADVERTENCIA: ANTHROPIC_API_KEY no está configurado"
    echo "   El chat con GUADIANA no funcionará sin esta clave"
    echo ""
    read -p "¿Continuar de todos modos? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Configuración verificada"
echo ""

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Construir imagen
echo "🔨 Construyendo imagen Docker..."
docker-compose build --no-cache

# Iniciar contenedores
echo "🚀 Iniciando contenedores..."
docker-compose up -d

# Esperar a que la app esté lista
echo "⏳ Esperando a que la aplicación inicie..."
sleep 10

# Verificar health check
echo "🏥 Verificando health check..."
if curl -sf http://localhost:8080/api/health > /dev/null; then
    echo "✅ Aplicación iniciada correctamente"
    echo ""
    echo "📊 Estado de los contenedores:"
    docker-compose ps
    echo ""
    echo "🎉 Despliegue completado!"
    echo ""
    echo "📍 URL local: http://localhost:8080"
    echo "📍 Health check: http://localhost:8080/api/health"
    echo ""
    echo "📝 Logs en tiempo real: docker-compose logs -f app"
    echo "🛑 Detener: docker-compose down"
else
    echo "❌ Error: La aplicación no responde"
    echo ""
    echo "📝 Ver logs para diagnóstico:"
    docker-compose logs app
    exit 1
fi
