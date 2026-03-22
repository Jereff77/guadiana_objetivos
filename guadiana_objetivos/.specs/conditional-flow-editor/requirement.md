# Requisitos: Editor Visual de Flujo Condicional

## Resumen

Agregar al editor de formularios un tab **"Flujo"** donde el creador puede definir lógica condicional visual: si una respuesta = X → saltar a la sección Y. La interfaz es un canvas interactivo donde las secciones son nodos y las condiciones son conexiones entre ellos.

---

## Requisitos Funcionales

### [REQ-001] Tab "Flujo" en el editor
El editor de formularios (`/formularios/[id]/editar`) debe incluir un tab **"Flujo"** junto al tab "Estructura" existente. Al seleccionar "Flujo", se reemplaza el contenido por un canvas interactivo de nodos y conexiones.

### [REQ-002] Nodos de sección
Cada sección del formulario aparece como un nodo rectangular en el canvas. Los nodos son arrastrables para reorganizar el layout visual. Cada nodo muestra:
- Número de orden de la sección
- Título de la sección
- Cantidad de preguntas que contiene

### [REQ-003] Nodos especiales
Existe un nodo **"Inicio"** que representa el comienzo del formulario y un nodo **"Fin"** que representa la finalización. Estos nodos no son eliminables y no tienen propiedades configurables.

### [REQ-004] Conexiones entre nodos
El usuario puede conectar dos nodos arrastrando desde el **handle de salida** (derecha) de un nodo al **handle de entrada** (izquierda) del nodo destino. Cada conexión representa una condición.

### [REQ-005] Configuración de condición
Al hacer clic en una conexión (arista), aparece un **panel de configuración** que permite seleccionar:
- La **pregunta disparadora** (solo preguntas tipo `boolean` o `single_choice` de la sección origen)
- La **opción de respuesta** que activa el salto

La arista muestra una etiqueta resumida: `"[Pregunta]: [Opción]"`.

### [REQ-006] Una condición por opción
Una misma pregunta puede tener múltiples condiciones, **una por opción de respuesta**. Cada opción puede llevar a una sección diferente. Ejemplo:
- Pregunta "¿Tiene observaciones?" → Sí → Sección "Detalle de observaciones"
- Pregunta "¿Tiene observaciones?" → No → Sección "Cierre"

Una opción sin condición asignada sigue el flujo lineal predeterminado.

### [REQ-007] Flujo predeterminado sin condición
Si una sección no tiene condiciones definidas para la respuesta dada, el formulario avanza a la siguiente sección en orden numérico (comportamiento actual). Las condiciones solo modifican el flujo cuando se cumplen.

### [REQ-008] Persistencia
Las condiciones se guardan en la tabla `form_conditions` de Supabase. Los cambios se guardan al confirmar la configuración de una condición en el panel.

### [REQ-009] Validación visual
Si una condición referencia una pregunta o sección que fue eliminada, la arista se muestra en **rojo** como inválida. El usuario puede eliminarla desde el panel de configuración.

### [REQ-010] Ejecución del flujo condicional
El motor de ejecución (vista previa web y app Flutter) debe evaluar las condiciones al navegar entre secciones y saltar a la sección correspondiente cuando se cumpla la condición.

---

## Requisitos No Funcionales

| ID | Requisito |
|----|-----------|
| [NFR-001] | El canvas debe funcionar en pantallas ≥ 1280px de ancho |
| [NFR-002] | La librería de visualización debe ser `@xyflow/react` (React Flow v12) |
| [NFR-003] | Las condiciones inválidas (secciones/preguntas eliminadas) deben detectarse en el cliente |

---

## Restricciones

| ID | Restricción |
|----|-------------|
| [CON-001] | Solo preguntas tipo `boolean` y `single_choice` pueden ser disparadores de condiciones |
| [CON-002] | Solo se implementa la acción "saltar a sección". Quedan fuera: mostrar/ocultar secciones, cambiar opciones, condiciones compuestas (AND/OR) |
| [CON-003] | El tab "Flujo" solo está disponible para formularios en estado "borrador" |

---

## Supuestos

| ID | Supuesto |
|----|----------|
| [ASM-001] | La tabla `form_conditions` no existe aún y debe crearse mediante migración en Supabase |
| [ASM-002] | La app Flutter puede recibir y procesar la lógica de condiciones en su motor de ejecución |
| [ASM-003] | El usuario creador del formulario tiene acceso completo al editor |
