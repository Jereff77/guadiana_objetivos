// ============================================================================
// Tipos compartidos para el Módulo M4 - Asistente de IA
// Referencia: .specs/asistente-ia/design.md
// ============================================================================

// ============================================================================
// Tipos de Cliente Claude
// ============================================================================

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

// ============================================================================
// Tipos de Configuración de Agentes
// ============================================================================

export interface AgentConfig {
  claudeClient: any // ClaudeClient - importado para evitar dependencia circular
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

// ============================================================================
// Tipos de Análisis de Evidencias
// ============================================================================

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

// ============================================================================
// Tipos de Verificación de Objetivos
// ============================================================================

export interface ObjectiveVerificationRequest {
  objectiveId: string
  objectiveTitle: string
  objectiveDescription: string
  departmentId: string
  weight: number
  deadline?: string
  deliverables: {
    id: string
    title: string
    description?: string
    status: string
    evidencesCount: number
    reviews: Array<{
      verdict: string
      reviewedAt: string
    }>
  }[]
}

export interface ObjectiveVerificationResult {
  compliancePercentage: number // 0-100
  status: 'on_track' | 'at_risk' | 'behind' | 'complete'
  summary: string
  findings: {
    positive: string[]
    negative: string[]
    warnings: string[]
  }
  risks: Array<{
    level: 'high' | 'medium' | 'low'
    description: string
    deliverableId?: string
  }>
  recommendations: string[]
  anomalies?: Array<{
    type: 'generic_evidence' | 'plagiarism' | 'date_inconsistency' | 'missing_critical'
    description: string
    deliverableId?: string
  }>
}

// ============================================================================
// Tipos de Recomendaciones de Capacitación
// ============================================================================

export interface TrainingRecommendationRequest {
  userId?: string
  context?: {
    objectivesNotMet?: string[]
    recurringRejections?: string[]
    improvementAreas?: string[]
    requiredSkills?: string[]
  }
}

export interface TrainingRecommendation {
  id?: string
  userId: string
  recommendationType: 'training' | 'objective' | 'general'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  linkId?: string // course_id, objective_id, etc.
  linkType?: string // 'lms_course', 'objective', etc.
  reason: string // Por qué se hace esta recomendación
  estimatedImpact?: string // Qué impacto se espera
}

// ============================================================================
// Tipos de Chat
// ============================================================================

export interface ChatSession {
  id: string
  userId: string
  title?: string
  startedAt: string
  endedAt?: string
  messageCount: number
}

export interface ChatMessage {
  id?: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  createdAt: string
}

export interface ChatContext {
  userId: string
  userRole?: string
  departmentId?: string
  activeObjectives?: Array<{
    id: string
    title: string
    status: string
    deadline?: string
  }>
  recentActivity?: {
    pendingDeliverables: number
    overdueCount: number
    upcomingDeadlines: Array<{
      title: string
      dueDate: string
      daysRemaining: number
    }>
  }
}

// ============================================================================
// Tipos de Configuración de IA
// ============================================================================

export interface AISetting {
  id?: string
  departmentId?: string | null
  settingKey: string
  settingValue: string
  description?: string
  updatedBy?: string
  updatedAt: string
}

export type AISettingKey =
  | 'system_prompt_enabled'
  | 'analysis_threshold'
  | 'max_tokens_per_request'
  | 'budget_alert_threshold'
  | 'evidence_agent_enabled'
  | 'objective_agent_enabled'
  | 'training_agent_enabled'
  | 'chat_agent_enabled'

// ============================================================================
// Tipos de Log de Análisis
// ============================================================================

export interface AIAnalysisLog {
  id?: string
  userId: string
  analysisType: 'evidence' | 'objective' | 'training'
  targetId: string
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  resultSummary?: string
  resultJson?: any
  status: 'pending' | 'completed' | 'failed'
  errorMessage?: string
  createdAt: string
  completedAt?: string
}

// ============================================================================
// Tipos de Server Actions (ActionResult)
// ============================================================================

export type ActionResult<T> = {
  data?: T
  error?: string
}

// ============================================================================
// Tipos para Speech-to-Text y Text-to-Speech
// ============================================================================

export interface SpeechConfig {
  languageCode: string // 'es-MX' para español México
  sampleRateHertz: number // 16000 para input, 24000 para output
  encoding: 'LINEAR16' // PCM 16-bit
  autoStop: boolean // Detectar silencio
  silenceDuration: number // ms de silencio antes de stop
}

export interface STTResult {
  text: string
  confidence: number
  isFinal: boolean
}

export interface TTSRequest {
  text: string
  languageCode?: string // 'es-MX'
  voiceName?: string // 'es-MX-Wavenet-A', 'es-MX-Standard-A', etc.
  speakingRate?: number // 1.0 = normal
  pitch?: number // 0.0 = normal
}
