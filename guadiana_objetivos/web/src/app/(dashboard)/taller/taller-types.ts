// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface DecisionEntry {
  decision: string
  tipo: string
  quien_decide: string
  consulta_a: string
  frecuencia: string
  observaciones: string
}

export interface TallerFormData {
  departamento: string
  puesto: string
  decisiones: DecisionEntry[]
  reflexion_1: string
  reflexion_2: string
  reflexion_3: string
  reflexion_4: string
}

export interface TallerRecord extends TallerFormData {
  id: string
  user_id: string
  fecha_creacion: string | null
  fecha_actualizacion: string | null
}

export interface TallerUser {
  id: string
  full_name: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const TIPO_OPTIONS = [
  '1 - Operativas',
  '2 - Tácticas',
  '3 - Estratégicas',
  '4 - Compartidas',
] as const

export const EMPTY_DECISION: DecisionEntry = {
  decision: '',
  tipo: '',
  quien_decide: '',
  consulta_a: '',
  frecuencia: '',
  observaciones: '',
}
