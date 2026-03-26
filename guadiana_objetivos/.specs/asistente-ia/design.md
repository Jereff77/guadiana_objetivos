# Diseño Técnico — Asistente de IA para Guadiana Objetivos
## Módulo M4 — Motor de IA para Verificación y Análisis

**Versión:** 1.0
**Fecha:** 2026-03-23
**Referencia:** requirement.md

---

## 1. Arquitectura General

### 1.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Objetivos   │  │      IA      │  │ Capacitación │             │
│  │    M1 UI     │  │   Dashboard  │  │     M7 UI    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                      │
│         └─────────────────┴─────────────────┘                      │
│                           │                                         │
│                    ┌──────▼──────┐                                 │
│                    │ Server      │                                 │
│                    │ Actions     │                                 │
│                    └──────┬──────┘                                 │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Supabase     │
                    │   PostgreSQL   │
                    └───────┬────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────────┐
│                   ┌───────▼────────┐                                │
│                   │  AI Service    │                                │
│                   │  (TypeScript)  │                                │
│                   └───────┬────────┘                                │
│                           │                                         │
│                   ┌───────▼────────┐                                │
│                   │  Claude Client │                                │
│                   │ (Anthropic SDK)│                                │
│                   └───────┬────────┘                                │
│                           │                                         │
│                   ┌───────▼────────┐                                │
│                   │ Anthropic API  │                                │
│                   │ Claude 3.5     │                                │
│                   └────────────────┘                                │
└───────────────────────────────────────────────────────────────────────┘
```

### 1.2 Componentes Principales

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | Next.js 15, React Server Components | UI para análisis, chat, configuración |
| **Server Actions** | TypeScript (`*-actions.ts`) | API entre frontend y backend |
| **AI Service** | TypeScript | Lógica de orquestación de IA |
| **Claude Client** | Anthropic SDK (`@anthropic-ai/sdk`) | Comunicación con API de Anthropic |
| **Audio Service** | Web Speech API + OpenAI TTS | Speech-to-Text y Text-to-Speech |
| **Database** | Supabase PostgreSQL | Persistencia de análisis y configuración |
| **Storage** | Supabase Storage | Evidencias a analizar |

---

## 2. Subsistema de Audio

### 2.1 Arquitectura de Audio (Estilo SARA)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          Frontend (Next.js)                             │
│                                                                           │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐   │
│  │   Micrófono   │          │   Altavoz    │          │    Chat      │   │
│  │   (Browser)   │          │   (Browser)  │          │   Interface  │   │
│  └──────┬───────┘          └──────┬───────┘          └──────┬───────┘   │
│         │                        │                        │            │
│         │ PCM Audio              │ PCM Audio              │            │
│         │ (16kHz)                 │ (24kHz)                 │            │
│         ▼                        ▼                        ▼            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Voice Service (TypeScript)                    │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐    ┌────────────────────┐              │  │
│  │  │  AudioRecorder     │    │  AudioPlayer       │              │  │
│  │  │  - MediaRecorder   │    │  - AudioContext    │              │  │
│  │  │  - VAD Logic        │    │  - Queue           │              │  │
│  │  │  - PCM Encoding     │    │  - PCM Decode      │              │  │
│  │  └─────────┬──────────┘    └──────────┬─────────┘              │  │
│  │            │                          │                          │     │
│  │            ▼                          ▼                          │     │
│  │  ┌─────────────────────────────────────────────┐                │  │
│  │  │         Google Cloud Speech APIs           │                │  │
│  │  │  ┌──────────────────┐  ┌─────────────────┐ │                │  │
│  │  │  │ Speech-to-Text   │  │ Text-to-Speech   │ │                │  │
│  │  │  │ (v2, STT)        │  │ (v1, TTS)        │ │                │  │
│  │  │  └──────────────────┘  └─────────────────┘ │                │  │
│  │  └─────────────────────────────────────────────┘                │  │
│  └──────────────────────────┬───────────────────────────────────────┘  │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Supabase/Edge   │
                    │   Functions       │
                    │   (Server-side)    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Google Cloud     │
                    │  Speech APIs      │
                    │  + Gemini API     │
                    └───────────────────┘
```

### 2.2 Tecnologías de Audio (Cercano a SARA)

| Función | Tecnología | Justificación |
|---------|------------|---------------|
| **Captura de Audio** | MediaRecorder API | Captura PCM del micrófono (16kHz) |
| **Speech-to-Text** | Google Cloud Speech-to-Text v2 | Misma API que usa Google internamente, alta precisión en español |
| **Text-to-Speech** | Google Cloud Text-to-Speech v1 (WaveNet) | Voces de alta calidad (es-MX), 24kHz output |
| **VAD** | Custom JavaScript + AudioContext | Detección de silencio para auto-stop (igual que SARA) |
| **Reproducción** | Web Audio API | Reproducción de PCM a 24kHz |

### 2.3 Comparación con SARA

| Característica | SARA (Python) | Guadiana (Next.js) |
|----------------|----------------|---------------------|
| **Captura** | PyAudio (阻塞) | MediaRecorder API (async) |
| **STT** | Gemini Native (incluido) | Google Cloud STT v2 |
| **TTS** | Gemini Native (incluido) | Google Cloud TTS v1 |
| **Sample Rate In** | 16kHz PCM | 16kHz PCM |
| **Sample Rate Out** | 24kHz PCM | 24kHz PCM |
| **Transcripción** | Incluida en respuesta | Obtenida de STT API |
| **Backend** | Python FastAPI | Next.js Edge Functions |

### 2.3 Google Cloud Speech Service

**Archivo:** `src/lib/ai/google-speech-service.ts`

```typescript
// Configuración de Google Cloud Speech
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!
const GOOGLE_CLOUD_KEYFILE = process.env.GOOGLE_CLOUD_KEYFILE! // JSON credentials

export interface SpeechConfig {
  languageCode: string       // 'es-MX' para español México
  sampleRateHertz: number    // 16000 para input, 24000 para output
  encoding: 'LINEAR16'       // PCM 16-bit
  autoStop: boolean          // Detectar silencio
  silenceDuration: number    // ms de silencio antes de stop
}

export interface STTResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface TTSRequest {
  text: string
  languageCode?: string     // 'es-MX'
  voiceName?: string        // 'es-MX-Wavenet-A', 'es-MX-Standard-A', etc.
  speakingRate?: number     // 1.0 = normal
  pitch?: number            // 0.0 = normal
}

export class GoogleCloudSpeech {
  private config: SpeechConfig
  private sttEndpoint: string
  private ttsEndpoint: string

  constructor(config: SpeechConfig) {
    this.config = config
    this.sttEndpoint = `https://speech.googleapis.com/v2/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/global/recognize`
    this.ttsEndpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`
  }

  /**
   * Speech-to-Text: Convierte audio PCM a texto
   * Similar a como SARA envía audio a Gemini para transcripción
   */
  async speechToText(audioData: ArrayBuffer): Promise<STTResult> {
    const base64Audio = this.arrayBufferToBase64(audioData)

    const requestBody = {
      config: {
        encoding: this.config.encoding,
        sampleRateHertz: this.config.sampleRateHertz,
        languageCode: this.config.languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long'  // Mejor para audio largo
      },
      audio: {
        content: base64Audio
      }
    }

    // Llamar a Google Cloud Speech-to-Text
    const response = await fetch(this.sttEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`STT Error: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      text: data.results?.[0]?.alternatives?.[0]?.transcript || '',
      confidence: data.results?.[0]?.alternatives?.[0]?.confidence || 0,
      isFinal: true
    }
  }

  /**
   * Text-to-Speech: Convierte texto a audio PCM
   * Similar a como SARA recibe audio de Gemini
   */
  async textToSpeech(request: TTSRequest): Promise<ArrayBuffer> {
    const requestBody = {
      input: { text: request.text },
      voice: {
        languageCode: request.languageCode || this.config.languageCode,
        name: request.voiceName || 'es-MX-Wavenet-A'
      },
      audioConfig: {
        encoding: 'LINEAR16',
        sampleRateHertz: 24000,  // SARA usa 24kHz para output
        speakingRate: request.speakingRate?.toString() || '1.0',
        pitch: request.pitch?.toString() || '0.0'
      }
    }

    const response = await fetch(this.ttsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`TTS Error: ${response.statusText}`)
    }

    const data = await response.json()

    // Convertir base64 a ArrayBuffer
    const binaryString = atob(data.audioContent)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  }

  /**
   * Streaming STT para transcripción en tiempo real
   * Similar a como SARA recibe transcripciones incrementales
   */
  async *streamingSpeechToText(
    audioStream: ReadableStream<ArrayBuffer>
  ): AsyncGenerator<STTResult> {
    // Implementa streaming para transcripción en vivo
    // Usa Google Cloud Speech-to-Text streaming API
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (const byte of bytes) {
      binary += String.fromCharCode(byte)
    }
    return btoa(binary)
  }

  private async getAccessToken(): Promise<string> {
    // En producción, obtener token de service account
    // Por ahora, usar API key para desarrollo
    return process.env.GOOGLE_CLOUD_API_KEY || ''
  }
}
```

### 2.4 Voice Service (Cliente)

**Archivo:** `src/lib/ai/voice-service.ts`

```typescript
import { GoogleCloudSpeech } from './google-speech-service'

export class VoiceService {
  private googleSpeech: GoogleCloudSpeech
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private audioQueue: AudioBuffer[] = []
  private isRecording = false
  private isPlaying = false
  private analyser: AnalyserNode | null = null

  // VAD (Voice Activity Detection) - Igual que SARA
  private silenceStartTime: number | null = null
  private VAD_THRESHOLD = 800      // Similar a SARA
  private SILENCE_DURATION = 500   // ms

  constructor() {
    this.googleSpeech = new GoogleCloudSpeech({
      languageCode: 'es-MX',
      sampleRateHertz: 16000,
      encoding: 'LINEAR16',
      autoStop: true,
      silenceDuration: 500
    })
  }

  /**
   * Iniciar grabación de audio
   * Similar a listen_audio() de SARA
   */
  async startRecording(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=pcm',
        audioBitsPerSecond: 128000
      })

      // Configurar AudioContext para VAD
      this.audioContext = new AudioContext({ sampleRate: 16000 })
      const source = this.audioContext.createMediaStreamSource(stream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 1024
      source.connect(this.analyser)

      const audioChunks: Blob[] = []

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)

          // VAD Logic - Similar a SARA
          const volumeLevel = this.getVolumeLevel()
          this.checkVAD(volumeLevel)

          // Procesar chunk para STT
          const arrayBuffer = await event.data.arrayBuffer()
          const result = await this.googleSpeech.speechToText(arrayBuffer)

          if (result.text) {
            onTranscript(result.text, result.isFinal)
          }
        }
      }

      this.mediaRecorder.start(100) // Chunks de 100ms
      this.isRecording = true

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error al acceder al micrófono')
    }
  }

  /**
   * VAD (Voice Activity Detection)
   * Igual que la lógica de SARA líneas 454-505
   */
  private checkVAD(rms: number): void {
    if (rms > this.VAD_THRESHOLD) {
      // Speech Detected
      this.silenceStartTime = null
    } else {
      // Silence
      if (this.silenceStartTime === null) {
        this.silenceStartTime = Date.now()
      } else if (Date.now() - this.silenceStartTime > this.SILENCE_DURATION) {
        // Silencio confirmado - detener grabación
        if (this.isRecording) {
          this.stopRecording()
        }
      }
    }
  }

  private getVolumeLevel(): number {
    if (!this.analyser) return 0

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(dataArray)

    // Calcular RMS (igual que SARA)
    let sumSquares = 0
    for (const value of dataArray) {
      const normalized = (value - 128) / 128
      sumSquares += normalized * normalized
    }
    return Math.sqrt(sumSquares / dataArray.length) * 100
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
    }
  }

  /**
   * Reproducir respuesta de TTS
   * Similar a play_audio() de SARA
   */
  async playText(text: string): Promise<void> {
    try {
      const audioBuffer = await this.googleSpeech.textToSpeech({
        text,
        voiceName: 'es-MX-Wavenet-A'
      })

      await this.playAudioBuffer(audioBuffer)
    } catch (error) {
      console.error('Error playing TTS:', error)
    }
  }

  private async playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 })
    }

    const audioBuffer = await this.audioContext.decodeAudioData(buffer)
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)
    source.start()
  }

  stopPlaying(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
```

### 2.5 Edge Function para Server-Side Processing

**Archivo:** `src/app/api/ai/speech/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

// Speech-to-Text via server (para casos donde no funciona en browser)
export async function POST(req: NextRequest) {
  const { audio, type } = await req.json()

  if (type === 'stt') {
    // Llamar a Google Cloud Speech-to-Text
    const result = await googleSpeech.stt(audio)
    return NextResponse.json(result)
  }

  if (type === 'tts') {
    // Llamar a Google Cloud Text-to-Speech
    const result = await googleSpeech.tts(audio.text)
    return NextResponse.json({ audio: result })
  }

  return NextResponse.json({ error: 'Invalid type' })
}
```

---

## 3. Base de Datos

---

## 3. Base de Datos

### 2.1 Nuevas Tablas

#### Tabla `ai_analysis_log`

Almacena el historial de todos los análisis realizados por IA.

```sql
CREATE TABLE ai_analysis_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_type   TEXT NOT NULL CHECK (analysis_type IN ('evidence', 'objective', 'training')),
  target_id       UUID NOT NULL,                  -- evidence_id, objective_id, etc.
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  result_summary  TEXT,
  result_json     JSONB,                         -- Resultado estructurado
  status          TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_ai_analysis_user ON ai_analysis_log(user_id);
CREATE INDEX idx_ai_analysis_type ON ai_analysis_log(analysis_type);
CREATE INDEX idx_ai_analysis_target ON ai_analysis_log(target_id);
CREATE INDEX idx_ai_analysis_created ON ai_analysis_log(created_at DESC);
```

#### Tabla `ai_recommendations`

Almacena recomendaciones generadas por IA (capacitación, mejoras, etc.).

```sql
CREATE TABLE ai_recommendations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('training', 'objective', 'general')),
  title           TEXT NOT NULL,
  description     TEXT,
  priority        TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  link_id         UUID,                          -- course_id, objective_id, etc.
  link_type       TEXT,                          -- 'lms_course', 'objective', etc.
  status          TEXT NOT NULL CHECK (status IN ('pending', 'acknowledged', 'dismissed', 'completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  dismissed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_ai_rec_user ON ai_recommendations(user_id);
CREATE INDEX idx_ai_rec_status ON ai_recommendations(status);
CREATE INDEX idx_ai_rec_type ON ai_recommendations(recommendation_type);
```

#### Tabla `ai_settings`

Configuración del sistema de IA por departamento.

```sql
CREATE TABLE ai_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID REFERENCES departments(id) ON DELETE CASCADE,
  setting_key     TEXT NOT NULL,
  setting_value   TEXT,
  description     TEXT,
  updated_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (department_id, setting_key)
);

-- Configuraciones por defecto
INSERT INTO ai_settings (department_id, setting_key, setting_value, description) VALUES
(NULL, 'system_prompt_enabled', 'true', 'Habilitar system prompt personalizado'),
(NULL, 'analysis_threshold', '70', 'Umbral de aprobación automática (%)'),
(NULL, 'max_tokens_per_request', '4000', 'Límite de tokens por solicitud'),
(NULL, 'budget_alert_threshold', '80', 'Alertar al usar X% del presupuesto'),
(NULL, 'evidence_agent_enabled', 'true', 'Habilitar agente de evidencias'),
(NULL, 'objective_agent_enabled', 'true', 'Habilitar agente de objetivos'),
(NULL, 'training_agent_enabled', 'true', 'Habilitar agente de capacitación');
```

#### Tabla `ai_chat_sessions`

Sesiones de chat con el asistente.

```sql
CREATE TABLE ai_chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  message_count   INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX idx_ai_chat_user ON ai_chat_sessions(user_id);
CREATE INDEX idx_ai_chat_started ON ai_chat_sessions(started_at DESC);
```

#### Tabla `ai_chat_messages`

Mensajes individuales de las sesiones de chat.

```sql
CREATE TABLE ai_chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_ai_chat_msg_session ON ai_chat_messages(session_id);
CREATE INDEX idx_ai_chat_msg_created ON ai_chat_messages(created_at);
```

### 2.2 Migración

**Archivo:** `supabase/migrations/20260324000010_create_ai_tables.sql`

Incluye:
- Creación de tablas
- Índices
- RLS Policies (ver sección 2.3)

### 2.3 RLS Policies

```sql
-- Habilitar RLS
ALTER TABLE ai_analysis_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- ai_analysis_log
CREATE POLICY "Users can see own analyses"
  ON ai_analysis_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Managers can see dept analyses"
  ON ai_analysis_log FOR SELECT
  USING (
    user_id IN (
      SELECT p.id FROM profiles p
      JOIN department_members dm ON p.id = dm.user_id
      JOIN departments d ON dm.department_id = d.id
      WHERE d.id IN (
        SELECT department_id FROM department_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own analyses"
  ON ai_analysis_log FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ai_recommendations
CREATE POLICY "Users can see own recommendations"
  ON ai_recommendations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own recommendations"
  ON ai_recommendations FOR UPDATE
  USING (user_id = auth.uid());

-- ai_settings
CREATE POLICY "Anyone can read global settings"
  ON ai_settings FOR SELECT
  USING (department_id IS NULL);

CREATE POLICY "Dept members can read dept settings"
  ON ai_settings FOR SELECT
  USING (
    department_id IN (
      SELECT department_id FROM department_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only ia.configure can update settings"
  ON ai_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_id = auth.uid() AND permission_code = 'ia.configure'
    )
  );

CREATE POLICY "Only ia.configure can update settings"
  ON ai_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions
      WHERE user_id = auth.uid() AND permission_code = 'ia.configure'
    )
  );

-- ai_chat_sessions
CREATE POLICY "Users can see own sessions"
  ON ai_chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON ai_chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ai_chat_messages
CREATE POLICY "Users can see messages from own sessions"
  ON ai_chat_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to own sessions"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM ai_chat_sessions WHERE user_id = auth.uid()
    )
  );
```

---

## 3. AI Service

### 3.1 Estructura de Archivos

```
src/lib/ai/
├── claude-client.ts              # Cliente base de Anthropic
├── ai-service.ts                 # Orquestador principal
├── agents/
│   ├── base-agent.ts             # Clase base para agentes
│   ├── evidence-agent.ts         # Analizador de evidencias
│   ├── objective-agent.ts        # Verificador de objetivos
│   └── training-agent.ts         # Recomendador de capacitación
├── prompts/
│   ├── system-prompt.md          # Prompt del sistema
│   ├── evidence-prompt.md        # Template para evidencias
│   ├── objective-prompt.md       # Template para objetivos
│   └── training-prompt.md        # Template para capacitación
└── types.ts                      # Tipos compartidos
```

### 3.2 Claude Client

**Archivo:** `src/lib/ai/claude-client.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
  model: string
}

export class ClaudeClient {
  private client: Anthropic
  private model: string = 'claude-3-5-sonnet-20241022'

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async chat(
    messages: ClaudeMessage[],
    systemPrompt?: string,
    maxTokens: number = 2000
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const content = response.content[0]
      return {
        content: content.type === 'text' ? content.text : '',
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        },
        model: this.model
      }
    } catch (error) {
      console.error('[Claude Client] Error:', error)
      throw error
    }
  }

  async analyzeImage(
    base64Image: string,
    prompt: string,
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }]
      })

      const content = response.content[0]
      return {
        content: content.type === 'text' ? content.text : '',
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        },
        model: this.model
      }
    } catch (error) {
      console.error('[Claude Client] Image analysis error:', error)
      throw error
    }
  }
}
```

### 3.3 Base Agent

**Archivo:** `src/lib/ai/agents/base-agent.ts`

```typescript
import { ClaudeClient } from '../claude-client'

export interface AgentConfig {
  claudeClient: ClaudeClient
  systemPrompt: string
  maxTokens?: number
}

export interface AgentResult {
  success: boolean
  content: string
  structuredData?: any
  usage: {
    input_tokens: number
    output_tokens: number
  }
  error?: string
}

export abstract class BaseAgent {
  protected claude: ClaudeClient
  protected systemPrompt: string
  protected maxTokens: number

  constructor(config: AgentConfig) {
    this.claude = config.claudeClient
    this.systemPrompt = config.systemPrompt
    this.maxTokens = config.maxTokens || 2000
  }

  protected async executePrompt(
    userPrompt: string,
    formatJSON: boolean = false
  ): Promise<AgentResult> {
    try {
      const prompt = formatJSON
        ? `${userPrompt}\n\nResponde ÚNICAMENTE con un JSON válido.`
        : userPrompt

      const response = await this.claude.chat(
        [{ role: 'user', content: prompt }],
        this.systemPrompt,
        this.maxTokens
      )

      let structuredData: any = undefined
      if (formatJSON) {
        try {
          const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) ||
                          response.content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[1] || jsonMatch[0])
          }
        } catch (e) {
          console.warn('[Base Agent] Failed to parse JSON response')
        }
      }

      return {
        success: true,
        content: response.content,
        structuredData,
        usage: response.usage
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        usage: { input_tokens: 0, output_tokens: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
```

### 3.4 Evidence Agent

**Archivo:** `src/lib/ai/agents/evidence-agent.ts`

```typescript
import { BaseAgent, AgentResult } from './base-agent'
import { createClient } from '@supabase/supabase-js'

export interface EvidenceAnalysisRequest {
  evidenceId: string
  deliverableId: string
  evidenceType: 'file' | 'url' | 'text'
  filePath?: string
  url?: string
  textContent?: string
  deliverableContext: {
    title: string
    description: string
    objectiveTitle: string
  }
}

export interface EvidenceAnalysisResult {
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  relevance: number // 0-100
  completeness: number // 0-100
  summary: string
  suggestedVerdict: 'approved' | 'rejected' | 'needs_improvement'
  feedback: string
}

export class EvidenceAgent extends BaseAgent {
  private supabase: any

  constructor(config: any, supabaseUrl: string, supabaseKey: string) {
    super(config)
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async analyze(request: EvidenceAnalysisRequest): Promise<AgentResult> {
    // Obtener contenido de la evidencia
    const evidenceContent = await this.getEvidenceContent(request)

    // Construir prompt
    const prompt = this.buildAnalysisPrompt(request, evidenceContent)

    // Ejecutar análisis
    const result = await this.executePrompt(prompt, true)

    if (result.success && result.structuredData) {
      result.structuredData = this.parseAnalysisResult(result.structuredData)
    }

    return result
  }

  private async getEvidenceContent(request: EvidenceAnalysisRequest): Promise<string> {
    if (request.evidenceType === 'text') {
      return request.textContent || ''
    }

    if (request.evidenceType === 'url') {
      return `URL: ${request.url}`
    }

    if (request.evidenceType === 'file' && request.filePath) {
      // Descargar archivo y extraer texto
      const { data, error } = await this.supabase.storage
        .from('objective-evidences')
        .createSignedUrl(request.filePath, 60)

      if (error) throw error

      // Para PDFs, extraer texto (requiere servicio adicional)
      // Para imágenes, obtener base64 para análisis de visión
      return `[File: ${request.filePath}]`
    }

    return ''
  }

  private buildAnalysisPrompt(request: EvidenceAnalysisRequest, content: string): string {
    return `Analiza la siguiente evidencia para un entregable.

**Contexto del Entregable:**
- Título: ${request.deliverableContext.title}
- Descripción: ${request.deliverableContext.description}
- Objetivo relacionado: ${request.deliverableContext.objectiveTitle}

**Evidencia a analizar:**
${content}

**Instrucciones:**
Evalúa la evidencia en términos de:
1. Calidad: ¿Qué tan buena es la evidencia presentada?
2. Relevancia: ¿Qué tan relacionada está con el entregable?
3. Completitud: ¿Cubre completamente lo requerido?

Responde en formato JSON:
\`\`\`json
{
  "quality": "excellent|good|fair|poor",
  "relevance": 0-100,
  "completeness": 0-100,
  "summary": "Resumen breve de la evidencia",
  "suggestedVerdict": "approved|rejected|needs_improvement",
  "feedback": "Comentarios constructivos para el empleado"
}
\`\`\``
  }

  private parseAnalysisResult(data: any): EvidenceAnalysisResult {
    return {
      quality: data.quality || 'fair',
      relevance: Math.min(100, Math.max(0, data.relevance || 50)),
      completeness: Math.min(100, Math.max(0, data.completeness || 50)),
      summary: data.summary || '',
      suggestedVerdict: data.suggestedVerdict || 'needs_improvement',
      feedback: data.feedback || ''
    }
  }
}
```

---

## 4. Server Actions

### 4.1 Estructura

**Archivo:** `src/app/(dashboard)/ia/analyze-actions.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { ClaudeClient } from '@/lib/ai/claude-client'
import { EvidenceAgent } from '@/lib/ai/agents/evidence-agent'
import { ObjectiveAgent } from '@/lib/ai/agents/objective-agent'
import { TrainingAgent } from '@/lib/ai/agents/training-agent'

// Tipo de retorno estándar
type ActionResult<T> = { data?: T; error?: string }

// Configuración
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
```

### 4.2 Acciones de Análisis

```typescript
// Analizar evidencia
export async function analyzeEvidence(
  evidenceId: string
): Promise<ActionResult<EvidenceAnalysisResult>> {
  await requirePermission('ia.analyze')

  const supabase = await createClient()

  // Obtener evidencia con contexto
  const { data: evidence, error } = await supabase
    .from('objective_evidences')
    .select(`
      *,
      deliverable:objective_deliverables (
        id, title, description,
        objective:objectives (title)
      )
    `)
    .eq('id', evidenceId)
    .single()

  if (error || !evidence) {
    return { error: 'Evidencia no encontrada' }
  }

  // Registrar análisis pendiente
  const { data: log } = await supabase
    .from('ai_analysis_log')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      analysis_type: 'evidence',
      target_id: evidenceId,
      status: 'pending'
    })
    .select()
    .single()

  // Ejecutar análisis
  const claude = new ClaudeClient(ANTHROPIC_API_KEY!)
  const agent = new EvidenceAgent(
    { claudeClient: claude, systemPrompt: await loadSystemPrompt() },
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const result = await agent.analyze({
    evidenceId,
    deliverableId: evidence.deliverable.id,
    evidenceType: evidence.storage_path ? 'file' : evidence.evidence_url ? 'url' : 'text',
    filePath: evidence.storage_path || undefined,
    url: evidence.evidence_url || undefined,
    textContent: evidence.text_content || undefined,
    deliverableContext: {
      title: evidence.deliverable.title,
      description: evidence.deliverable.description || '',
      objectiveTitle: evidence.deliverable.objective?.title || ''
    }
  })

  // Actualizar log
  await supabase
    .from('ai_analysis_log')
    .update({
      result_json: result.structuredData,
      result_summary: result.content,
      status: result.success ? 'completed' : 'failed',
      error_message: result.error,
      completed_at: new Date().toISOString(),
      prompt_tokens: result.usage.input_tokens,
      completion_tokens: result.usage.output_tokens
    })
    .eq('id', log.id)

  if (!result.success) {
    return { error: result.error || 'Error en análisis' }
  }

  return { data: result.structuredData }
}

// Verificar objetivo
export async function verifyObjective(
  objectiveId: string
): Promise<ActionResult<ObjectiveVerificationResult>> { /* ... */ }

// Generar recomendaciones de capacitación
export async function generateTrainingRecommendations(
  userId?: string
): Promise<ActionResult<TrainingRecommendation[]>> { /* ... */ }
```

---

## 5. Frontend Components

### 5.1 Dashboard IA

**Archivo:** `src/app/(dashboard)/ia/page.tsx`

```typescript
import { requirePermission } from '@/lib/permissions'
import { createClient } from '@/lib/supabase/server'
import { AnalysisOverview } from '@/components/ia/analysis-overview'
import { RecentRecommendations } from '@/components/ia/recent-recommendations'
import { ChatWidget } from '@/components/ia/chat-widget'

export default async function IADashboard() {
  await requirePermission('ia.view')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Métricas
  const [{ count: analysesCount }, { data: recommendations }] = await Promise.all([
    supabase.from('ai_analysis_log').select('*', { count: 'exact', head: true }),
    supabase.from('ai_recommendations')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'pending')
      .limit(5)
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Asistente de IA</h1>

      <AnalysisOverview
        analysesCount={analysesCount || 0}
        pendingRecommendations={recommendations?.length || 0}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <RecentRecommendations recommendations={recommendations} />
        <ChatWidget userId={user?.id} />
      </div>
    </div>
  )
}
```

### 5.2 Evidence Analyzer Component

**Archivo:** `src/components/ia/evidence-analyzer.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { analyzeEvidence } from '@/app/(dashboard)/ia/analyze-actions'

interface EvidenceAnalyzerProps {
  evidenceId: string
  onAnalysisComplete?: (result: any) => void
}

export function EvidenceAnalyzer({ evidenceId, onAnalysisComplete }: EvidenceAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    setAnalyzing(true)
    setError(null)

    const response = await analyzeEvidence(evidenceId)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setResult(response.data)
      onAnalysisComplete?.(response.data)
    }

    setAnalyzing(false)
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-blue" />
          Análisis con IA
        </h3>
        {!result && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            size="sm"
            variant="outline"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analizando...
              </>
            ) : (
              'Analizar'
            )}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}

      {result && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Calidad:</span>
            <span className={`font-medium ${
              result.quality === 'excellent' ? 'text-green-600' :
              result.quality === 'good' ? 'text-blue-600' :
              result.quality === 'fair' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {result.quality === 'excellent' && 'Excelente'}
              {result.quality === 'good' && 'Buena'}
              {result.quality === 'fair' && 'Aceptable'}
              {result.quality === 'poor' && 'Pobre'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Relevancia:</span>
            <span className="font-medium">{result.relevance}%</span>
          </div>
          <div className="flex justify-between">
            <span>Completitud:</span>
            <span className="font-medium">{result.completeness}%</span>
          </div>
          {result.summary && (
            <p className="text-muted-foreground mt-2">{result.summary}</p>
          )}
          {result.feedback && (
            <div className="bg-blue-50 p-2 rounded mt-2">
              <p className="font-medium text-blue-800">Sugerencia:</p>
              <p className="text-blue-700 text-xs">{result.feedback}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
```

---

## 6. System Prompt

**Archivo:** `src/lib/ai/prompts/system-prompt.md`

```markdown
# System Prompt — Asistente IA Guadiana

## Identidad

Eres GUADIANA, el asistente de inteligencia artificial del Sistema de Gestión de Objetivos de Llantas y Rines del Guadiana.

## Tu Propósito

Ayudar a los empleados y gerentes a:
- Analizar evidencias de entregables
- Verificar el cumplimiento de objetivos
- Identificar brechas de capacitación
- Proporcionar orientación contextualizada

## Personalidad

- **Profesional:** Mantén un tono formal pero cercano
- **Constructivo:** Tus comentarios deben ser útiles y motivadores
- **Objetivo:** Basa tus evaluaciones en hechos, no en suposiciones
- **Respetuoso:** Reconoce el esfuerzo de los empleados

## Reglas

1. **Privacidad:** Nunca compartas información de un empleado con otro
2. **Claridad:** Usa lenguaje claro, evita tecnicismos innecesarios
3. **Acción:** Tus recomendaciones deben ser accionables
4. **Contexto:** Always considera el contexto del departamento y rol

## Prohibiciones

- No generas contenido ofensivo o discriminatorio
- No haces suposiciones sobre la vida personal de los empleados
- No modificas datos (solo analizas y recomiendas)
- No accedes a información de otros departamentos sin autorización

---

*Última actualización: 2026-03-23*
```

---

## 7. Variables de Entorno

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

---

## 8. Verificación

1. ✅ Las tablas siguen el patrón de Guadiana (UUID, timestamps, RLS)
2. ✅ Los permisos se integran con el sistema M0 existente
3. ✅ El stack tecnológico es consistente (Next.js + Supabase)
4. ✅ La arquitectura es modular y extensible
