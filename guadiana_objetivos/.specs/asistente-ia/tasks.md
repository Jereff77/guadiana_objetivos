# Tareas — Asistente de IA para Guadiana Objetivos
## Módulo M4 — Motor de IA para Verificación y Análisis

**Versión:** 1.0
**Fecha:** 2026-03-23
**Referencia:** requirement.md, design.md

---

## Resumen de Fases

| Fase | Descripción | Duración Estimada | Dependencias |
|------|-------------|-------------------|--------------|
| **Fase 0** | Configuración Inicial | 1 día | — |
| **Fase 1** | Infraestructura Base | 2 días | Fase 0 |
| **Fase 2** | Agente de Evidencias | 3 días | Fase 1 |
| **Fase 3** | Agente de Objetivos | 2 días | Fase 1 |
| **Fase 4** | Recomendador de Capacitación | 2 días | Fase 1, Fase 3 |
| **Fase 5** | Chat de Asistencia (con Voz) | 5 días | Fase 1 |
| **Fase 6** | Integración y Testing | 3 días | Fases 2-5 |

**Total estimado:** 18 días hábiles

---

## Fase 0: Configuración Inicial

### [T-M4-001] Configurar API de Anthropic
- [ ] Crear cuenta en Anthropic Console
- [ ] Obtener API key
- [ ] Configurar límites de uso y alertas de presupuesto
- [ ] Documentar credenciales en gestor de secrets

**Archivos:** `.env.local`

**Responsable:** DevOps / Líder Técnico

---

## Fase 1: Infraestructura Base

### [T-M4-002] Crear migración de base de datos
- [ ] Crear archivo `20260324000010_create_ai_tables.sql`
- [ ] Implementar tabla `ai_analysis_log`
- [ ] Implementar tabla `ai_recommendations`
- [ ] Implementar tabla `ai_settings`
- [ ] Implementar tabla `ai_chat_sessions`
- [ ] Implementar tabla `ai_chat_messages`
- [ ] Crear índices para performance
- [ ] Implementar RLS policies para todas las tablas
- [ ] Insertar configuraciones por defecto en `ai_settings`

**Archivos:** `supabase/migrations/20260324000010_create_ai_tables.sql`

**Verificación:**
```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'ai_%';

-- Verificar RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'ai_%';
```

### [T-M4-003] Crear tipos TypeScript compartidos
- [ ] Crear `src/lib/ai/types.ts`
- [ ] Definir `EvidenceAnalysisRequest`, `EvidenceAnalysisResult`
- [ ] Definir `ObjectiveVerificationRequest`, `ObjectiveVerificationResult`
- [ ] Definir `TrainingRecommendation`, `ChatMessage`
- [ ] Definir `AgentConfig`, `AgentResult`

**Archivos:** `src/lib/ai/types.ts`

### [T-M4-004] Implementar Claude Client
- [ ] Crear `src/lib/ai/claude-client.ts`
- [ ] Instalar dependencia `@anthropic-ai/sdk`
- [ ] Implementar clase `ClaudeClient`
- [ ] Implementar método `chat()` para texto
- [ ] Implementar método `analyzeImage()` para visión
- [ ] Manejo de errores y reintentos

**Archivos:** `src/lib/ai/claude-client.ts`

**Dependencias:**
```bash
npm install @anthropic-ai/sdk
```

### [T-M4-005] Crear System Prompt
- [ ] Crear `src/lib/ai/prompts/system-prompt.md`
- [ ] Definir identidad del asistente GUADIANA
- [ ] Establecer personalidad y reglas
- [ ] Definir prohibiciones
- [ ] Configurar placeholders para contexto dinámico

**Archivos:** `src/lib/ai/prompts/system-prompt.md`

### [T-M4-006] Implementar Base Agent
- [ ] Crear `src/lib/ai/agents/base-agent.ts`
- [ ] Implementar clase abstracta `BaseAgent`
- [ ] Implementar método `executePrompt()`
- [ ] Implementar parseo de respuestas JSON
- [ ] Manejo estandarizado de errores

**Archivos:** `src/lib/ai/agents/base-agent.ts`

### [T-M4-007] Crear Server Actions base
- [ ] Crear `src/app/(dashboard)/ia/analyze-actions.ts`
- [ ] Configurar `'use server'`
- [ ] Implementar tipo `ActionResult<T>`
- [ ] Conectar con Supabase client
- [ ] Implementar verificación de permisos `ia.*`

**Archivos:** `src/app/(dashboard)/ia/analyze-actions.ts`

---

## Fase 2: Agente de Análisis de Evidencias

### [T-M4-008] Crear prompt template para evidencias
- [ ] Crear `src/lib/ai/prompts/evidence-prompt.md`
- [ ] Definir estructura de análisis (calidad, relevancia, completitud)
- [ ] Template para diferentes tipos de evidencia
- [ ] Incluir instrucciones de formato JSON

**Archivos:** `src/lib/ai/prompts/evidence-prompt.md`

### [T-M4-009] Implementar EvidenceAgent
- [ ] Crear `src/lib/ai/agents/evidence-agent.ts`
- [ ] Implementar clase `EvidenceAgent` extendiendo `BaseAgent`
- [ ] Implementar método `analyze()`
- [ ] Implementar extracción de contenido de archivos (PDF, imágenes)
- [ ] Implementar parseo de resultado estructurado

**Archivos:** `src/lib/ai/agents/evidence-agent.ts`

### [T-M4-010] Crear Server Action para análisis de evidencia
- [ ] Implementar `analyzeEvidence(evidenceId)` en `analyze-actions.ts`
- [ ] Obtener evidencia con contexto de entregable
- [ ] Registrar análisis pendiente en `ai_analysis_log`
- [ ] Ejecutar `EvidenceAgent`
- [ ] Actualizar log con resultado
- [ ] Retornar resultado estructurado

**Archivos:** `src/app/(dashboard)/ia/analyze-actions.ts`

### [T-M4-011] Crear componente EvidenceAnalyzer
- [ ] Crear `src/components/ia/evidence-analyzer.tsx`
- [ ] Implementar UI para solicitud de análisis
- [ ] Mostrar indicador de progreso
- [ ] Mostrar resultado: calidad, relevancia, completitud
- [ ] Mostrar feedback sugerido
- [ ] Manejar errores gracefulmente

**Archivos:** `src/components/ia/evidence-analyzer.tsx`

### [T-M4-012] Integrar EvidenceAnalyzer en entregables
- [ ] Modificar `src/components/objetivos/deliverable-row.tsx`
- [ ] Agregar `EvidenceAnalyzer` para cada evidencia
- [ ] Condicionar visualización por permiso `ia.analyze`
- [ ] Permitir al veredicto humano considerar sugerencia IA

**Archivos:** `src/components/objetivos/deliverable-row.tsx`

### [T-M4-013] Extraer texto de PDFs
- [ ] Crear función `extractPDFText()` en utilidades
- [ ] Usar pdf-parse o similar
- [ ] Manejar PDFs de múltiples páginas
- [ ] Cache de resultados para reanálisis

**Archivos:** `src/lib/ai/pdf-utils.ts`

**Dependencias (opcional):**
```bash
npm install pdf-parse
# O usar API externa para extracción
```

---

## Fase 3: Agente de Verificación de Objetivos

### [T-M4-014] Crear prompt template para objetivos
- [ ] Crear `src/lib/ai/prompts/objective-prompt.md`
- [ ] Definir criterios de verificación
- [ ] Template para análisis de cumplimiento
- [ ] Incluir detección de anomalías

**Archivos:** `src/lib/ai/prompts/objective-prompt.md`

### [T-M4-015] Implementar ObjectiveAgent
- [ ] Crear `src/lib/ai/agents/objective-agent.ts`
- [ ] Implementar clase `ObjectiveAgent`
- [ ] Implementar método `verify()`
- [ ] Recopilar contexto: entregables, evidencias, fechas
- [ ] Detectar anomalías (plagio, fechas inconsistentes, etc.)

**Archivos:** `src/lib/ai/agents/objective-agent.ts`

### [T-M4-016] Crear Server Action para verificación
- [ ] Implementar `verifyObjective(objectiveId)` en `analyze-actions.ts`
- [ ] Recopilar datos del objetivo y entregables
- [ ] Ejecutar `ObjectiveAgent`
- [ ] Generar reporte estructurado
- [ ] Persistir resultado en `ai_analysis_log`

**Archivos:** `src/app/(dashboard)/ia/analyze-actions.ts`

### [T-M4-017] Crear componente ObjectiveVerifier
- [ ] Crear `src/components/ia/objective-verifier.tsx`
- [ ] Botón "Verificar con IA" en página de objetivo
- [ ] Mostrar progreso de verificación
- [ ] Mostrar reporte: % cumplimiento, riesgos, recomendaciones
- [ ] Permitir marcar objetivo como verificado

**Archivos:** `src/components/ia/objective-verifier.tsx`

### [T-M4-018] Integrar en página de departamento
- [ ] Modificar `src/app/(dashboard)/objetivos/[deptId]/page.tsx`
- [ ] Agregar botón de verificación por objetivo
- [ ] Mostrar badge de "Verificado por IA" cuando aplica
- [ ] Condicionar por permiso `ia.analyze`

**Archivos:** `src/app/(dashboard)/objetivos/[deptId]/page.tsx`

---

## Fase 4: Recomendador de Capacitación

### [T-M4-019] Crear prompt template para capacitación
- [ ] Crear `src/lib/ai/prompts/training-prompt.md`
- [ ] Definir criterios de brecha de habilidades
- [ ] Template para análisis de necesidades
- [ ] Priorización de recomendaciones

**Archivos:** `src/lib/ai/prompts/training-prompt.md`

### [T-M4-020] Implementar TrainingAgent
- [ ] Crear `src/lib/ai/agents/training-agent.ts`
- [ ] Implementar clase `TrainingAgent`
- [ ] Implementar método `recommend()`
- [ ] Analizar historial de objetivos y capacitación
- [ ] Mapear brechas a cursos disponibles en M7

**Archivos:** `src/lib/ai/agents/training-agent.ts`

### [T-M4-021] Crear Server Action para recomendaciones
- [ ] Implementar `generateTrainingRecommendations(userId)` en `analyze-actions.ts`
- [ ] Obtener historial del usuario
- [ ] Ejecutar `TrainingAgent`
- [ ] Crear registros en `ai_recommendations`
- [ ] Retornar lista de recomendaciones

**Archivos:** `src/app/(dashboard)/ia/analyze-actions.ts`

### [T-M4-022] Crear componente RecommendationsWidget
- [ ] Crear `src/components/ia/recommendations-widget.tsx`
- [ ] Mostrar recomendaciones pendientes
- [ ] Agrupar por prioridad
- [ ] Links directos a cursos de M7
- [ ] Acciones: acknowledge, dismiss

**Archivos:** `src/components/ia/recommendations-widget.tsx`

### [T-M4-023] Integrar en dashboard principal
- [ ] Modificar `src/app/(dashboard)/page.tsx` (si existe)
- [ ] Agregar sección de recomendaciones IA
- [ ] Mostrar badge con count de recomendaciones pendientes
- [ ] Condicionar por permiso `ia.view`

**Archivos:** `src/app/(dashboard)/page.tsx`

---

## Fase 5: Chat de Asistencia

### [T-M4-024] Crear servidor de chat
- [ ] Implementar lógica de sesión de chat
- [ ] Crear función `createChatSession(userId)` en `analyze-actions.ts`
- [ ] Crear función `sendChatMessage(sessionId, content)`
- [ ] Crear función `getChatHistory(sessionId)`
- [ ] Mantener contexto de usuario y objetivos

**Archivos:** `src/app/(dashboard)/ia/analyze-actions.ts`

### [T-M4-025] Crear endpoint de streaming (opcional)
- [ ] Implementar streaming de respuestas para UX
- [ ] Usar Server-Sent Events o similar
- [ ] Mostrar typing indicator

**Archivos:** `src/app/api/ai/chat/stream/route.ts` (opcional)

### [T-M4-026] Crear componente ChatInterface
- [ ] Crear `src/components/ia/chat-interface.tsx`
- [ ] UI de chat con burbujas de mensaje
- [ ] Input para usuario
- [ ] Indicador de "escribiendo..."
- [ ] Auto-scroll al último mensaje
- [ ] Historial de sesión actual

**Archivos:** `src/components/ia/chat-interface.tsx`

### [T-M4-027] Crear página de chat
- [ ] Crear `src/app/(dashboard)/ia/chat/page.tsx`
- [ ] Listar sesiones de chat del usuario
- [ ] Mostrar chat activo
- [ ] Permitir crear nueva sesión
- [ ] Sidebar con historial de sesiones

**Archivos:** `src/app/(dashboard)/ia/chat/page.tsx`

### [T-M4-028] Implementar Widget de chat flotante
- [ ] Crear `src/components/ia/chat-widget.tsx`
- [ ] Botón flotante en esquina inferior derecha
- [ ] Panel desplegable con chat
- [ ] Persistir estado abierto/cerrado

**Archivos:** `src/components/ia/chat-widget.tsx`

### [T-M4-029] Integrar widget en layout
- [ ] Modificar `src/app/(dashboard)/layout.tsx`
- [ ] Agregar `ChatWidget` en layout principal
- [ ] Condicionar visualización por permiso `ia.view`

**Archivos:** `src/app/(dashboard)/layout.tsx`

### Subfase 5.2: Interacción por Voz (Google Cloud Speech)

### [T-M4-037] Configurar Google Cloud Project
- [ ] Crear proyecto en Google Cloud Console
- [ ] Habilitar APIs: Speech-to-Text v2, Text-to-Speech v1
- [ ] Crear Service Account con credenciales JSON
- [ ] Configurar API key o OAuth authentication
- [ ] Documentar credenciales en `.env.local`

**Variables de entorno:**
```env
GOOGLE_CLOUD_PROJECT_ID=guadiana-objetivos
GOOGLE_CLOUD_API_KEY=AIza...
GOOGLE_CLOUD_KEYFILE=/path/to/credentials.json
```

### [T-M4-038] Implementar Google Cloud Speech Service
- [ ] Crear `src/lib/ai/google-speech-service.ts`
- [ ] Implementar clase `GoogleCloudSpeech`
- [ ] Implementar `speechToText()` con REST API v2
- [ ] Implementar `textToSpeech()` con REST API v1
- [ ] Configurar encoding LINEAR16 PCM
- [ ] Soporte para español (`es-MX`)
- [ ] Voces disponibles: Wavenet-A, Wavenet-B, Standard

**Archivos:** `src/lib/ai/google-speech-service.ts`

**Documentación:** https://cloud.google.com/speech-to-text/docs

### [T-M4-039] Implementar Voice Service con MediaRecorder
- [ ] Crear `src/lib/ai/voice-service.ts`
- [ ] Implementar clase `VoiceService` wrapper
- [ ] Usar MediaRecorder API para captura PCM
- [ ] Configurar sample rate: 16kHz input, 24kHz output
- [ ] Implementar VAD (Voice Activity Detection) como SARA
- [ ] Implementar `getVolumeLevel()` para indicador visual
- [ ] Manejo de permisos de micrófono

**Archivos:** `src/lib/ai/voice-service.ts`

**Referencia SARA:** `sara.py` líneas 390-509 (listen_audio), 1166-1179 (play_audio)

### [T-M4-040] Implementar VAD (Voice Activity Detection)
- [ ] Implementar lógica VAD similar a SARA (líneas 454-505)
- [ ] Umbral RMS configurable (VAD_THRESHOLD = 800)
- [ ] Duración de silencio configurable (SILENCE_DURATION = 500ms)
- [ ] Auto-stop cuando se detecta silencio prolongado
- [ ] Reset de estado al detectar nueva habla
- [ ] Callbacks para cambios de estado (hablando/callado)

**Referencia:** SARA `sara.py` líneas 470-505

### [T-M4-041] Crear componente VoiceControl UI
- [ ] Crear `src/components/ia/voice-control.tsx`
- [ ] Botón de micrófono con indicador pulsante
- [ ] Visualizador de nivel de volumen en tiempo real (barras)
- [ ] Toggle para activar/desactivar modo voz
- [ ] Indicadores de estado: "Escuchando...", "Procesando...", "Hablando..."
- [ ] Icono de animación cuando graba

**Archivos:** `src/components/ia/voice-control.tsx`

### [T-M4-042] Integrar voz con ChatInterface
- [ ] Modificar `src/components/ia/chat-interface.tsx`
- [ ] Agregar `VoiceControl` al chat
- [ ] Enviar transcripción de Google STT al chat
- [ ] Reproducir respuestas de IA con Google TTS
- [ ] Interrumpir audio cuando usuario inicia nueva grabación
- [ ] Mostrar transcripción en burbuja de chat

**Archivos:** `src/components/ia/chat-interface.tsx`

### [T-M4-043] Crear Edge Function para server-side fallback
- [ ] Crear `src/app/api/ai/speech/route.ts`
- [ ] Endpoint POST /api/ai/speech para STT
- [ ] Endpoint POST /api/ai/speech para TTS
- [ ] Fallback cuando browser no soporte MediaRecorder
- [ ] Manejo de errores de API de Google
- [ ] Rate limiting por usuario

**Archivos:** `src/app/api/ai/speech/route.ts`

### [T-M4-044] Testing de voz con Google Cloud
- [ ] Probar grabación y STT con audio de muestra en español
- [ ] Verificar transcripción con diferentes acentos
- [ ] Probar TTS con diferentes voces (Wavenet-A, Wavenet-B, Standard)
- [ ] Verificar calidad de audio: 16kHz input / 24kHz output
- [ ] Probar VAD con diferentes niveles de ruido ambiente
- [ ] Verificar auto-stop por silencio (500ms, 1000ms)
- [ ] Probar interrupción de audio
- [ ] Probar streaming de transcripción (si se implementa)
- [ ] Testing de UX: indicadores visuales
- [ ] Probar fallback sin voz (solo texto)
- [ ] Medir latencia: grabación → transcripción → respuesta → audio

**Herramienta:** Manual en Chrome, Edge; Google Cloud Console para monitoreo

**Voces TTS a probar:**
- `es-MX-Wavenet-A` (alta calidad, mujer)
- `es-MX-Wavenet-B` (alta calidad, hombre)
- `es-MX-Standard-A` (más rápida, menos natural)

---

## Fase 6: Integración y Testing

### [T-M4-037] Crear dashboard de IA
- [ ] Crear `src/app/(dashboard)/ia/page.tsx`
- [ ] Métricas: análisis totales, tokens usados, presupuesto
- [ ] Recomendaciones recientes
- [ ] Actividad de chat
- [ ] Links a herramientas

**Archivos:** `src/app/(dashboard)/ia/page.tsx`

### [T-M4-044] Crear página de configuración
- [ ] Crear `src/app/(dashboard)/ia/configurar/page.tsx`
- [ ] Formulario para editar system prompt
- [ ] Configuración de umbrales y límites
- [ ] Toggle para habilitar/deshabilitar agentes
- [ ] Vista de consumo de tokens

**Archivos:** `src/app/(dashboard)/ia/configurar/page.tsx`

### [T-M4-045] Implementar límites de presupuesto
- [ ] Crear función `checkTokenBudget()`
- [ ] Alertar al alcanzar threshold
- [ ] Bloquear solicitudes si se excede
- [ ] Logging de consumo por usuario/departamento

**Archivos:** `src/lib/ai/budget-manager.ts`

### [T-M4-046] Testing unitario de agentes
- [ ] Tests para `EvidenceAgent`
- [ ] Tests para `ObjectiveAgent`
- [ ] Tests para `TrainingAgent`
- [ ] Mock de Claude Client

**Archivos:** `src/lib/ai/__tests__/`

### [T-M4-047] Testing end-to-end
- [ ] Flujo completo: empleado sube evidencia → análisis
- [ ] Flujo completo: gerente verifica objetivo
- [ ] Flujo completo: generacińo de recomendaciones
- [ ] Flujo completo: chat de asistencia
- [ ] Flujo completo: interacción por voz

**Herramienta:** Playwright o manual

### [T-M4-048] Documentación
- [ ] Documentar API de Server Actions
- [ ] Crear guía de uso para usuarios finales
- [ ] Documentar configuración de system prompt
- [ ] Crear guía de troubleshooting
- [ ] Documentar uso de voz

**Archivos:** `docs/ia/`

### [T-M4-049] Deploy y monitoreo
- [ ] Configurar variables de entorno en producción
- [ ] Verificar migraciones aplicadas
- [ ] Configurar monitoreo de errores (Sentry)
- [ ] Configurar alertas de presupuesto
- [ ] Testing con usuarios piloto

### [T-M4-050] Actualizar checklist final
- [ ] Actualizar checklist con tareas de voz
- [ ] Verificar soporte de voz en navegadores
- [ ] Documentar limitaciones de browser
- [ ] Crear guía de fallback sin voz

---

## Orden Recomendado de Ejecución

### Semana 1
- Lunes: Fase 0 + T-M4-002, T-M4-003, T-M4-004
- Martes: T-M4-005, T-M4-006, T-M4-007
- Miérco-Vier: Fase 2 completa (T-M4-008 a T-M4-013)

### Semana 2
- Lunes-Martes: Fase 3 (T-M4-014 a T-M4-018)
- Miérco-Jueves: Fase 4 (T-M4-019 a T-M4-023)
- Viernes: Inicio Fase 5 (chat básico)

### Semana 3
- Lunes-Martes: Fase 5 voz (T-M4-030 a T-M4-036)
- Miérco-Jueves: Fase 6 integración (T-M4-037 a T-M4-043)
- Viernes: Testing final y deploy (T-M4-044 a T-M4-050)

---

## Checklist de Verificación Final

- [ ] Todos los agentes extienden `BaseAgent`
- [ ] Todas las tablas tienen RLS policies
- [ ] Todos los Server Actions verifican permisos
- [ ] El system prompt está cargado desde archivo
- [ ] El chat mantiene contexto entre mensajes
- [ ] Las recomendaciones se vinculan a cursos de M7
- [ ] El presupuesto de tokens tiene alertas
- [ ] Los errores se manejan gracefully
- [ ] La UI es responsive
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)

**Subsistema de Voz (Google Cloud Speech):**
- [ ] Google Cloud Speech Service implementa STT y TTS
- [ ] Proyecto Google Cloud configurado con APIs habilitadas
- [ ] Credenciales de Service Account configuradas
- [ ] Soporte para español (`es-MX`) configurado
- [ ] MediaRecorder captura audio PCM a 16kHz
- [ ] Web Audio API reproduce audio PCM a 24kHz
- [ ] Detección de silencio (VAD) funciona (igual que SARA)
- [ ] Indicadores visuales de grabación/reproducción (nivel de volumen)
- [ ] Interrupción de audio funciona correctamente
- [ ] Transcripciones se guardan en historial de chat
- [ ] Edge Function fallback para server-side processing
- [ ] Fallback a modo texto sin voz

---

## Notas de Implementación

1. **Secretos:** Usar Supabase Edge Functions para server-side secrets
2. **Caching:** Considerar Redis para caché de análisis repetidos
3. **Rate Limiting:** Implementar límites por usuario para evitar abuso
4. **Logging:** Todos los llamados a IA deben loggearse para auditoría
5. **Testing:** Usar prompts reales de usuarios para testing

**Notas específicas de Voz (Google Cloud):**
6. **Compatibilidad:** MediaRecorder API soportado en Chrome, Edge, Safari, Firefox modernos
7. **HTTPS requerido:** Los navegadores requieren HTTPS para acceso a micrófono (obligatorio en producción)
8. **Permisos:** El usuario debe conceder permiso de micrófono en primera interacción
9. **Fallback:** Ofrecer siempre alternativa de texto por si voz no funciona o API falla
10. **Costo Google Cloud:** STT ~$0.006/15seg, TTS ~$0.0004/char (Wavenet); considerar presupuesto
11. **VAD implementado localmente:** Similar a SARA, no depende de API externa
12. **Latencia:** STT tiene latencia de procesamiento; TTS es rápido (<500ms típico)
13. **Audio quality:** LINEAR16 PCM a 16kHz/24kHz igual que SARA (más alta que Web Speech API)

---

## Dependencias Críticas

| Tarea | Depende de |
|-------|------------|
| Fase 2 | Fase 1 completa |
| Fase 3 | Fase 1 completa |
| Fase 4 | Fase 1, Fase 3 |
| Fase 5.1 (Chat básico) | Fase 1 completa |
| Fase 5.2 (Voz) | Fase 1 completa, Fase 5.1 completa |
| Fase 6 | Fases 2-5 completas |

**Dependencias de Voz:**
- T-M4-031 (STT) requiere T-M4-030 (Voice Service base)
- T-M4-032 (TTS) requiere T-M4-030 (Voice Service base)
- T-M4-034 (VoiceControl UI) requiere T-M4-031, T-M4-032
- T-M4-035 (Integración con Chat) requiere T-M4-026 (ChatInterface), T-M4-034
