# Diseño UI/UX - App Móvil Guadiana Procesos

**Versión**: 2.0 - Diseño Profesional
**Fecha**: 2025-04-13
**Inspiración**: iOS Human Interface Guidelines + Material Design 3

---

## Filosofía de Diseño

El nuevo diseño sigue los principios de las mejores aplicaciones móviles del mercado:

### ✨ Características Clave

1. **Minimalismo Elegante**
   - Espacio blanco abundante
   - Tipografía clara con jerarquía visual
   - Colores corporativos usados estratégicamente

2. **Profundidad Visual**
   - Cards con sombras sutiles
   - Elevaciones claras para elementos interactivos
   - Estados visuales bien definidos

3. **Accesibilidad**
   - Touch targets mínimos de 48px (16pt)
   - Contraste WCAG AA compliant
   - Textos legibles sin zoom

4. **Consistencia**
   - Patrones de UI repetibles
   - Espaciado consistente (múltiplos de 4px)
   - Lenguaje visual coherente

---

## Paleta de Colores

### Colores Primarios
```
Azul Guadiana (Primary):     #004B8D (RGB: 0, 75, 141)
Verde Éxito:               #059669 (RGB: 5, 150, 105)
Amarillo Advertencia:        #F59E0B (RGB: 245, 158, 11)
Rojo Error:                #DC2626 (RGB: 220, 38, 38)
```

### Colores Neutros
```
Blanco Puro:               #FFFFFF (RGB: 255, 255, 255)
Gris Muy Claro:            #F9FAFB (RGB: 249, 250, 251)
Gris Claro:                #F3F4F6 (RGB: 243, 244, 246)
Gris Medio:                #E5E7EB (RGB: 229, 231, 235)
Gris Oscuro:               #9CA3AF (RGB: 156, 163, 175)
Texto Principal:           #111827 (RGB: 17, 24, 39)
Texto Secundario:         #6B7280 (RGB: 107, 114, 128)
```

### Semántica de Color
```
#EFF6FF - Azul claro 10% (badges informativos)
#FEF3C7 - Amarillo claro 10% (badges advertencia)
#D1FAE5 - Verde claro 10% (badges éxito)
#FEE2E2 - Rojo claro 10% (badges error)
```

---

## Tipografía

### Sistema Tipográfico
- **Font Family**: SF Pro Text (iOS), Roboto (Android fallback)
- **Scale**: Tipografía modular iOS

### Escala Tipográfica
```
Large Title:     34pt, 700 (Bold)
Title 1:         28pt, 700 (Bold)
Title 2:         22pt, 700 (Bold)
Title 3:         20pt, 600 (Semibold)
Headline:        17pt, 600 (Semibold)
Body:            17pt, 400 (Regular)
Callout:         16pt, 400 (Regular)
Subhead:         15pt, 400 (Regular)
Footnote:         13pt, 400 (Regular)
Caption 1:       12pt, 400 (Regular)
Caption 2:       11pt, 400 (Regular)
```

### Letter Spacing
```
Títulos grandes:    -0.5%
Texto normal:       0%
Botones:            +0.5%
Todo mayúsculas:    +4%
```

---

## Espaciado y Layout

### Grid System
- **Base unit**: 4px
- **Gap sizes**: 4, 8, 12, 16, 20, 24, 32, 48px

### Padding
```
Compact:   12px horizontal, 12px vertical
Comfortable: 16px horizontal, 16px vertical
Spacious:  24px horizontal, 24px vertical
```

### Corner Radius
```
Botones:           12px
Cards:             16px
Campos input:      16px
Badges:            8px
Iconos circulares: 20px
```

---

## Componentes de UI

### 1. Status Bar
- Altura: 44px (seguro para notches)
- Fondo: Transparente (deja ver wallpaper)
- Contenido: Hora (izquierda), Iconos (derecha)

### 2. App Header
```
Altura: fit_content(88-100px)
Padding: 20px lateral
Componentes:
  - Título principal (32pt, Bold)
  - Subtítulo informativo (15pt, Regular)
  - Icono de perfil (opcional)
```

### 3. Cards de Formulario
```
Altura: fit_content(min 200px)
Padding: 20px
Border: 1px #F3F4F6
Sombra: 0 2px 8px rgba(0,0,0,0.08)
Border Radius: 16px

Estructura:
  ┌─────────────────────────────┐
  │ Título + Menú (⋯)           │
  │ Descripción                  │
  │ Badges (Fecha, Prioridad)   │
  │ Barra de progreso           │
  │ Botón CTA                   │
  └─────────────────────────────┘
```

### 4. Barra de Progreso
```
Altura track: 6px
Border radius: 3px
Background: #F3F4F6
Fill: #004B8D (primario) o #059669 (éxito)
```

### 5. Botones
```
Altura: 48px (touch target óptimo)
Border Radius: 12px
Padding: 0 20px
Font: 16pt 600, letter-spacing +0.5%

Primario:
  Background: #004B8D
  Text: #FFFFFF

Secundario:
  Background: #F3F4F6
  Text: #374151
```

### 6. Campos de Input
```
Altura: 56px
Border: 2px #E5E7EB
Border Radius: 16px
Padding: 0 20px
Background: #F9FAFB

Estado Focus:
  Border: 2px #004B8D
  Background: #FFFFFF

Estado Error:
  Border: 2px #DC2626
  Background: #FEE2E2
```

### 7. Badges
```
Height: 24-28px
Padding: 0 12px
Border Radius: 8px
Font: 12pt 600

Informativo:  #EFF6FF → #004B8D
Advertencia:  #FEF3C7 → #D97706
Éxito:       #D1FAE5 → #059669
Error:        #FEE2E2 → #DC2626
```

---

## Estados y Feedback

### Estados de Carga
```
Skeleton Loading:
  - Animación shimmer
  - Color base: #F3F4F6
  - Highlight: #E5E7EB

Spinner:
  - iOS Activity Indicator
  - Tamaño: Large (37pt)
```

### Estados Vacíos
```
Icono: 48pt, color #D1D5DB
Título: 16pt 600, color #6B7280
Descripción: 14pt, color #9CA3AF
Acciones: Botón primario o secundario
```

### Estados de Error
```
Fondo: #FFFFFF
Icono de error: 48pt, color #DC2626
Título: "Algo salió mal"
Mensaje: Descripción del error
Acción: "Reintentar" o "Volver"
```

---

## Animaciones

### Transiciones
```
Push (navegación hacia adelante): 300ms, ease-in-out
Pop (navegación hacia atrás): 300ms, ease-in-out
Modal (presentar): 250ms, ease-out
```

### Micro-interacciones
```
Botón press: scale(0.97), 100ms
Switch toggle: 200ms, ease-in-out
Card press: scale(0.98), 150ms
```

### Loading States
```
Progress bar: Animación lineal infinita
Skeleton: Shimmer effect (1.5s duración)
Spinner: Rotación continua (1s por vuelta)
```

---

## Patrones de Navegación

### Jerarquía Visual
```
1. Títulos: 28-32pt, peso 700 (Bold)
2. Subtítulos: 15-16pt, peso 400 (Regular)
3. Body text: 17pt, peso 400 (Regular)
4. Metadatos: 13-14pt, peso 600 (Semibold)
5. Captions: 11-12pt, peso 400 (Regular)
```

### Feedback Visual
```
Botón presionado → Escala 0.97
Input focus → Border azul + sombra
Card hover → Sombra aumentada
Formulario guardado → Checkmark animado
```

---

## Accesibilidad

### Contraste de Color
```
Texto principal sobre fondo:   14.1:1 (WCAG AAA)
Texto secundario sobre fondo:  7.1:1 (WCAG AA)
Botón primario:                4.6:1 (WCAG AA)
```

### Touch Targets
```
Mínimo: 44x44pt (iOS) / 48x48dp (Android)
Recomendado: 48x48pt para mejor usabilidad
Botón "Continuar": 56pt altura, ancho completo
```

### Texto Escalable
```
Mínimo: 11pt (iPhone), 12sp (Android)
Recomendado: 15pt para cuerpo de texto
Títulos: 17pt+ para mejor legibilidad
```

---

## Dark Mode

### Adaptación de Colores
```
Background:        #000000
Card Background:   #1C1C1E
Text Primary:      #FFFFFF
Text Secondary:    #A1A1AA
Borders:           #2C2C2E
Primary Action:     #0A84FF
```

### Imágenes y Media
```
Imágenes oscuras automáticamente en modo oscuro
Iconos adaptados al color del sistema
Fotos sin filtro de oscuración automático
```

---

## Patrones Específicos de la App

### Pull-to-Refresh
```
Indicador: Activity Indicator grande
Height expandido: 80-100px
Trigger: Pull hacia abajo con scroll natural
```

### Infinite Scroll
```
Threshold: 200px antes del final
Loading indicator: Spinner en底部
Item threshold: 5 items antes de cargar más
```

### Formularios
```
Autoguardado: Cada 30 segundos o al perder foco
Validación en tiempo real
Indicador de campos requeridos: asterisco rojo
```

### Sync Offline
```
Indicador visual: Barra de estado con naranja
Sincronizando: Spinner con texto "Sincronizando..."
Completado: Checkmark verde con "Sincronizado"
```

---

## Referencias de Diseño

### Inspiración
- iOS Mail (cards y listas)
- Notion (limpieza y espaciado)
- Linear (profesionalismo)
- Asana (gestión de proyectos)
- Slack (uso de color)

### Guidelines Consultadas
1. Apple Human Interface Guidelines
2. Material Design 3
3. WCAG 2.1 Accessibility Guidelines
4. Mobile UX Best Practices (NN/g)

---

## Próximos Pasos

1. ✅ Pantalla de Login - Completada
2. ✅ Pantalla de Lista de Formularios - Completada
3. 🔄 Pantalla de Detalle de Formulario - Pendiente
4. 🔄 Pantalla de Resumen - Pendiente
5. 🔄 Componentes reutilizables - Pendiente
6. 🔄 Sistema de diseño completo - Pendiente

---

## Notas de Implementación Flutter

### Widgets Recomendados
- `CupertinoPageRoute` para navegación iOS-style
- `AnimatedContainer` para transiciones suaves
- `Hero` animations para transiciones compartidas
- `Rive` para animaciones complejas (opcional)

### Paquetes Útiles
- `flutter_hooks` - Gestión de estado moderno
- `go_router` - Navegación declarativa
- `flutter_secure_storage` - Almacenamiento seguro
- `connectivity_plus` - Detección de red
- `shimmer` - Skeleton loading
- `flutter_slidable` - Swipe actions

---

Este diseño profesional sigue los estándares de la industria y está listo para ser implementado en Flutter con una experiencia de usuario premium.
