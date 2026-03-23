# Requerimientos — Asistente de IA para Guadiana Objetivos
## Módulo M4 — Motor de IA para Verificación y Análisis

**Versión:** 1.0
**Fecha:** 2026-03-23
**Basado en:** Sistema SARA (Sistema Autónomo de Realidad Aumentada)

---

## 1. Contexto y Alcance

### 1.1 Descripción General

El Módulo M4 introduce un asistente de inteligencia artificial integrado en la plataforma Guadiana Objetivos. Este asistente utiliza modelos de lenguaje multimodales (Anthropic Claude 3.5 Sonnet) para:

- **Analizar evidencias** subidas por empleados (documentos, imágenes, URLs)
- **Verificar cumplimiento** de objetivos y entregables
- **Generar reportes** automáticos de progreso
- **Recomendar capacitación** basada en brechas detectadas
- **Asistir empleados** mediante chat contextual (texto y voz)

### 1.2 Integración con Módulos Existentes

| Módulo | Integración | Permisos Requeridos |
|--------|-------------|---------------------|
| **M0** | Sistema de permisos `ia.*` | — |
| **M1** | Análisis de objetivos y entregables | `objetivos.view` |
| **M7** | Recomendaciones de capacitación | `capacitacion.view` |
| **M5** | Análisis de respuestas abiertas | `formularios.view` |

### 1.3 Arquitectura de Referencia (SARA)

SARA es un sistema basado en Google Gemini 2.5 Flash con:
- Backend Python 3.11 + FastAPI + Socket.IO
- Frontend React 18.2 + Electron
- Agentes especializados (CAD, Web, IoT, Impresión 3D)
- Audio nativo bidireccional
- Autenticación biométrica
- Project Manager para archivos

**Adaptaciones para Guadiana:**
- **SÍ** requerimos audio bidireccional (voz del usuario, respuesta de IA)
- **NO** requerimos biométrica
- **SÍ** requerimos análisis de documentos/evidencias
- **SÍ** requerimos integración con Supabase
- **SÍ** requerimos chat de asistencia (texto y voz)

---

## 2. Permisos del Sistema

### 2.1 Nuevas Áreas de Permiso

| Código | Nombre | Descripción |
|--------|--------|-------------|
| `ia.view` | Ver análisis IA | Permite ver resultados de análisis de inteligencia artificial |
| `ia.configure` | Configurar IA | Permite ajustar prompts y configuración del servicio de IA |
| `ia.analyze` | Ejecutar análisis | Permite solicitar análisis de evidencias y objetivos |

### 2.2 Matriz de Permisos por Rol

| Rol | ia.view | ia.configure | ia.analyze |
|-----|---------|--------------|------------|
| `root` | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ |
| `gerente` | ✅ | ❌ | ✅ |
| `empleado` | ✅ | ❌ | ❌ |

> **Nota:** Los roles son definidos en M0. Esta tabla muestra la configuración recomendada.

---

## 3. Requerimientos Funcionales

### 3.1 Análisis de Evidencias

**[REQ-M4-001]** El sistema debe permitir al usuario (con permiso `ia.analyze`) solicitar el análisis de una evidencia específica asociada a un entregable.

**[REQ-M4-002]** El análisis de evidencia debe:
- Identificar el tipo de contenido (PDF, imagen, URL, texto)
- Extraer información relevante del documento
- Evaluar la calidad y suficiencia de la evidencia
- Generar un resumen ejecutivo
- Proponer una calificación sugerida (aprobado/mejora necesaria)

**[REQ-M4-003]** Para evidencias de tipo imagen, el sistema debe utilizar capacidades de visión del modelo de IA para analizar el contenido visual.

**[REQ-M4-004]** Para evidencias de tipo documento (PDF, Word), el sistema debe extraer el texto antes del análisis.

**[REQ-M4-005]** El resultado del análisis debe persistir en la base de datos para auditoría y referencia futura.

### 3.2 Verificación de Objetivos

**[REQ-M4-006]** El sistema debe permitir al gerente solicitar una verificación automática del cumplimiento de un objetivo basándose en:
- Evidencias subidas
- Estado actual de entregables
- Fecha límite
- Peso del objetivo dentro del departamento

**[REQ-M4-007]** La verificación debe generar un reporte que incluya:
- Porcentaje de cumplimiento estimado
- Entregables pendientes
- Riesgos de incumplimiento
- Recomendaciones específicas

**[REQ-M4-008]** El sistema debe ser capaz de detectar anomalías, como:
- Evidencias genéricas o no relacionadas
- Plagio o contenido duplicado
- Fechas inconsistentes
- Falta de evidencia en entregables críticos

### 3.3 Recomendaciones de Capacitación

**[REQ-M4-009]** El sistema debe analizar las brechas de desempeño de un empleado y recomendar capacitación específica del módulo M7 (LMS).

**[REQ-M4-010]** Las recomendaciones deben basarse en:
- Objetivos no cumplidos
- Entregables rechazados recurrentemente
- Áreas de mejora identificadas en revisiones
- Habilidades técnicas requeridas vs. demostradas

**[REQ-M4-011]** El sistema debe priorizar recomendaciones según:
- Impacto en objetivos actuales
- Disponibilidad de cursos en M7
- Historial de aprendizaje del empleado

### 3.4 Chat de Asistencia

**[REQ-M4-012]** El sistema debe ofrecer un chat de asistencia donde los empleados pueden:
- Preguntar sobre sus objetivos asignados
- Consultar el estado de entregables
- Solicitar orientación sobre evidencias a subir
- Recibir recordatorios de fechas límite

**[REQ-M4-013]** El chat debe mantener contexto de:
- Usuario autenticado
- Departamento asignado
- Objetivos activos
- Historial de conversación (por sesión)

**[REQ-M4-014]** El chat no debe tener acceso a información de otros empleados ni permitir modificaciones a datos (solo lectura y recomendaciones).

### 3.5 Interacción por Voz

**[REQ-M4-015]** El sistema debe permitir al usuario interactuar con el asistente mediante voz, además de texto.

**[REQ-M4-016]** El sistema debe capturar el audio del usuario mediante el micrófono del dispositivo y convertirlo a texto (Speech-to-Text).

**[REQ-M4-017]** El sistema debe sintetizar las respuestas del asistente en audio (Text-to-Speech) y reproducirlas mediante el altavoz del dispositivo.

**[REQ-M4-018]** El sistema debe soportar el idioma español para reconocimiento de voz y síntesis de voz.

**[REQ-M4-019]** El sistema debe permitir al usuario alternar entre modo texto y modo voz en cualquier momento durante la conversación.

**[REQ-M4-020]** El sistema debe mostrar indicadores visuales durante:
- Captura de audio (micrófono activo, nivel de volumen)
- Procesamiento de speech-to-text
- Reproducción de respuesta de IA

**[REQ-M4-021]** El sistema debe permitir interrumpir la reproducción de audio cuando el usuario inicia una nueva grabación.

**[REQ-M4-022]** El sistema debe guardar la transcripción de voz como texto en el historial del chat para referencia futura.

**[REQ-M4-023]** El sistema debe detectar automáticamente el final del habla del usuario (silencio) para finalizar la grabación.

### 3.6 Configuración del Sistema

**[REQ-M4-024]** Los usuarios con permiso `ia.configure` deben poder:
- Ajustar el system prompt del modelo de IA
- Configurar umbrales de análisis (ej. % de aprobación)
- Habilitar/deshabilitar agentes específicos
- Establecer configuración por departamento

**[REQ-M4-025]** La configuración debe almacenarse en la base de datos y aplicarse sin necesidad de reiniciar el servidor.

---

## 4. Requerimientos No Funcionales

### 4.1 Performance

**[NFR-M4-001]** El análisis de una evidencia debe completarse en menos de 30 segundos para documentos de hasta 10 páginas.

**[NFR-M4-002]** El chat debe responder en menos de 5 segundos para preguntas comunes.

**[NFR-M4-003]** La generación de reportes de verificación debe completarse en menos de 60 segundos para objetivos con hasta 20 entregables.

### 4.2 Seguridad y Privacidad

**[NFR-M4-004]** Todas las llamadas a la API de IA deben registrarse en un log de auditoría con:
- Usuario solicitante
- Timestamp
- Tipo de análisis
- Resultado (éxito/error)

**[NFR-M4-005]** Las evidencias analizadas no deben ser almacenadas por el proveedor de IA más allá del tiempo necesario para el procesamiento.

**[NFR-M4-006]** El system prompt y la configuración de IA deben estar protegidos y solo accesibles por usuarios con permiso `ia.configure`.

### 4.3 Confiabilidad

**[NFR-M4-007]** El sistema debe manejar gracefully las fallas de la API de IA:
- Reintentos automáticos (máx. 3)
- Mensajes de error claros al usuario
- Degradación graceful (mostrar información disponible sin IA)

**[NFR-M4-008]** El sistema debe limitar el consumo de tokens de IA según presupuesto configurado.

### 4.4 Usabilidad

**[NFR-M4-009]** La interfaz debe mostrar indicadores de progreso durante análisis largos.

**[NFR-M4-010]** Los resultados de IA deben poder ser editados manualmente por el revisor humano (override).

---

## 5. Casos de Uso

### 5.1 Caso de Uso 1: Empleado Solicita Análisis de Evidencia

**Actor:** Empleado
**Precondiciones:**
- Usuario autenticado
- Tiene entregable asignado
- Ha subido al menos una evidencia

**Flujo Principal:**
1. Usuario accede a página del entregable
2. Click en "Analizar con IA"
3. Sistema verifica permiso `ia.analyze` (o `ia.view` para propia evidencia)
4. Sistema envía evidencia a IA
5. Usuario ve indicador de progreso
6. Sistema muestra resultado: resumen, calidad, calificación sugerida
7. Usuario puede aceptar sugerencia o rechazar

**Postcondiciones:**
- Análisis persiste en BD
- Usuario puede tomar decisión informada sobre evidencia

### 5.2 Caso de Uso 2: Gerente Verifica Objetivo

**Actor:** Gerente
**Precondiciones:**
- Usuario autenticado con rol gerente/admin
- Tiene permiso `ia.analyze`
- Existen objetivos en su departamento

**Flujo Principal:**
1. Gerente accede a dashboard de objetivos
2. Selecciona objetivo y click "Verificar con IA"
3. Sistema recopila: entregables, evidencias, fechas
4. Sistema genera reporte de verificación
5. Gerente revisa: % cumplimiento, riesgos, recomendaciones
6. Gerente puede aprobar objetivo o solicitar ajustes

**Postcondiciones:**
- Reporte de verificación persiste
- Objetivo marcado como verificado (si aprobado)

### 5.3 Caso de Uso 3: Empleado Chatea con Asistente

**Actor:** Empleado
**Precondiciones:**
- Usuario autenticado
- Tiene objetivos activos

**Flujo Principal:**
1. Usuario accede a módulo IA
2. Inicia chat o continúa sesión previa
3. Usuario pregunta: "¿Qué objetivos tengo pendientes?"
4. IA responde con lista personalizada
5. Usuario pregunta: "¿Qué evidencia debo subir para X?"
6. IA responde con instrucciones específicas

**Postcondiciones:**
- Historial de chat persiste por sesión
- Usuario obtiene información contextualizada

---

## 6. Restricciones y Suposiciones

### 6.1 Restricciones

**[CON-M4-001]** El sistema debe utilizar Anthropic Claude como proveedor de IA (no otros como OpenAI).

**[CON-M4-002]** El costo mensual de IA no debe exceder el presupuesto configurado por departamento.

**[CON-M4-003]** El sistema no debe almacenar datos personales sensibles en los prompts enviados a IA.

### 6.2 Suposiciones

**[ASM-M4-001]** Los empleados tienen acceso a internet para carga de documentos y chat.

**[ASM-M4-002]** Las evidencias subidas están en formatos soportados (PDF, JPG, PNG, DOCX).

**[ASM-M4-003]** El departamento de TI mantendrá las credenciales de API de IA actualizadas.

---

## 7. Dependencias

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| M0 (Roles) | Crítica | Permisos `ia.*` deben estar definidos |
| M1 (Objetivos) | Crítica | Objetivos y entregables deben existir |
| M7 (Capacitación) | Importante | Cursos para recomendaciones |
| Anthropic API | Externa | Claude 3.5 Sonnet access |
| Supabase Storage | Interna | Almacenamiento de evidencias |
