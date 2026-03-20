# Specs Generator

Genera especificaciones de producto (PRD) a partir de ideas o conversaciones, enriquecidas con investigación competitiva automática.

## Cuándo Usar Este Skill

Usa este skill cuando el usuario:
- Quiere documentar una idea de producto/software
- Proporciona una transcripción de conversación sobre un proyecto
- Necesita crear un PRD (Product Requirements Document)
- Quiere analizar competidores antes de desarrollar
- Pide "generar specs", "crear especificación", "documentar requirements"

## Flujo de Trabajo

### Paso 1: Recibir Input

El usuario puede proporcionar:
- **Idea en texto libre**: Descripción de lo que quiere construir
- **Transcripción**: Conversación donde se discutió el proyecto
- **Descripción informal**: Notas sueltas o bullet points

**Acción**: Leer el input completo y proceder al análisis.

---

### Paso 2: Análisis Inicial

Extraer del input la siguiente información:

1. **Problema Principal**: ¿Qué problema intenta resolver?
2. **Usuarios Objetivo**: ¿Quiénes usarán el producto?
3. **Features Implícitas**: Funcionalidades mencionadas directa o indirectamente
4. **Contexto**: Plataforma (web, mobile, desktop), tecnologías mencionadas
5. **Constraints**: Limitaciones de tiempo, presupuesto, tecnología
6. **Ambigüedades**: Puntos que no quedan claros

---

### Paso 3: Preguntas de Clarificación (INTERACTIVO)

**CRÍTICO**: Antes de continuar, hacer preguntas de clarificación si:

- Hay múltiples interpretaciones posibles
- Faltan datos clave (usuarios, plataforma, alcance)
- Hay features contradictorias
- El alcance no está definido

Usar el tool `question` para preguntar:

```
- ¿Cuál es el usuario principal? [Opciones detectadas]
- ¿La plataforma es web, mobile o ambas?
- ¿El MVP incluye [feature X] o es para versión posterior?
- ¿Hay restricciones de tiempo o presupuesto?
```

**No continuar hasta tener claridad suficiente.**

---

### Paso 4: Generar Keywords de Investigación

Generar automáticamente keywords para buscar competidores:

1. Extraer términos clave del problema
2. Identificar categoría del producto (CRM, e-commerce, dashboard, etc.)
3. Agregar términos de industria si aplica

**Ejemplo**:
- Input: "Sistema de gestión de inventario para ferreterías"
- Keywords automáticas: ["inventory management software", "POS ferretería", "sistema inventario retail", "stock management tool"]

**Acción**: Presentar keywords al usuario y permitir agregar más:

```
He generado estas keywords para buscar competidores:
- inventory management software
- POS ferretería
- sistema inventario retail

¿Deseas agregar o modificar alguna?
```

---

### Paso 5: Investigación Competitiva

**Usar el tool `webfetch`** para buscar herramientas similares:

1. Buscar en Google/DuckDuckGo: `"best [categoria] software"`, `"[keyword] alternatives"`
2. Visitar páginas de 3-5 competidores principales
3. Extraer de cada uno:
   - Features principales
   - Pricing (si está disponible)
   - Target audience
   - Diferenciadores

**Formato de investigación**:

```markdown
### [Nombre Competidor]
- **URL**: [url]
- **Target**: [usuarios objetivo]
- **Features clave**:
  - Feature 1
  - Feature 2
- **Pricing**: [info]
- **Diferenciador**: [qué lo hace único]
```

---

### Paso 6: Síntesis y Enriquecimiento

Combinar la información:

1. **Features del usuario**: Las extraídas del input original
2. **Features de competidores**: Funcionalidades comunes en el mercado
3. **Gaps identificados**: Lo que los competidores NO tienen y podría ser diferenciador
4. **Must-haves**: Features sin las cuales el producto no sirve
5. **Nice-to-haves**: Features que pueden esperar

---

### Paso 7: Generar el Spec

**Ubicación**: `specs/[nombre-proyecto]-spec.md` (crear carpeta si no existe)

**Template**: Usar el template PRD estándar (ver `templates/prd-template.md`)

**Idioma**: Detectar automáticamente del input del usuario y mantener consistencia.

**Acción**: 
1. Crear el directorio `specs/` si no existe
2. Generar el archivo con el template completado
3. Mostrar un resumen al usuario
4. Preguntar si desea refinamiento

---

### Paso 8: Refinamiento (Opcional)

Permitir al usuario:
- Agregar/quitar features
- Cambiar prioridades (must-have → nice-to-have)
- Agregar más competidores
- Ajustar cualquier sección

---

## Estructura del Template PRD

Ver archivo: `templates/prd-template.md`

Secciones:
1. **Resumen Ejecutivo** - Problema, solución, objetivo
2. **Usuarios Objetivo** - Primarios y secundarios
3. **Features Principales** - Categorizadas por prioridad
4. **Análisis Competitivo** - Tabla de competidores
5. **Features por Competitividad** - De competidores y diferenciadores
6. **No-Goals** - Lo que explícitamente NO se hará
7. **Constraints** - Restricciones técnicas/de negocio
8. **Métricas de Éxito** - KPIs
9. **Timeline Propuesto** - Fases sugeridas (opcional)

---

## Ejemplo de Uso

**Input del usuario**:
```
"Quiero hacer una app para que los restaurantes puedan recibir pedidos
de delivery sin usar UberEats o Rappi, que les cobran mucho. Los dueños
de restaurantes me han dicho que pierden como 30% de comisión."
```

**Flujo**:
1. Análisis → Problema: comisiones altas, Usuarios: restaurantes
2. Preguntas → ¿Incluye app para clientes o solo panel de restaurantes?
3. Keywords → "restaurant ordering system", "white label delivery", "own delivery platform"
4. Investigación → ChowNow, GloriaFood, OrderUp
5. Spec generado → Con features de competidores + diferenciadores

---

## Notas Importantes

- **Siempre preguntar** antes de asumir algo que no está claro
- **Mantener el idioma** del input original
- **No inventar features** que el usuario no mencionó (solo sugerir de competidores)
- **Crear la carpeta specs/** si no existe
- **El nombre del archivo** debe ser descriptivo: `[proyecto]-spec.md`
- **Usar webfetch** para investigación, no inventar competidores
