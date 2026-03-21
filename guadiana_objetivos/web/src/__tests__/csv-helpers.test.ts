/**
 * T-501: Prueba de integración – Lógica de generación CSV
 *
 * Extrae y prueba las funciones puras del route handler de exportación
 * de forma aislada (sin HTTP ni Supabase).
 */

// ── Funciones copiadas del route handler (lógica pura sin imports de Next) ──

function escapeCell(value: string | number | boolean | null | undefined): string {
  const str = value == null ? '' : String(value)
  return `"${str.replace(/"/g, '""')}"`
}

function toRow(cells: (string | number | boolean | null | undefined)[]) {
  return cells.map(escapeCell).join(',')
}

type Answer = {
  value_text: string | null
  value_number: number | null
  value_bool: boolean | null
  value_date: string | null
  value_json: unknown
  not_applicable: boolean
  option_id: string | null
}

function formatAnswer(answer: Answer, optionLabel: string | null): string {
  if (answer.not_applicable) return 'No aplica'
  if (answer.option_id && optionLabel) return optionLabel
  if (answer.value_bool !== null) return answer.value_bool ? 'Sí' : 'No'
  if (answer.value_text) return answer.value_text
  if (answer.value_number !== null) return String(answer.value_number)
  if (answer.value_date) return answer.value_date
  if (answer.value_json) return JSON.stringify(answer.value_json)
  return ''
}

const BLANK: Answer = {
  value_text: null, value_number: null, value_bool: null,
  value_date: null, value_json: null, not_applicable: false, option_id: null,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('escapeCell()', () => {
  it('wraps values in double quotes', () => {
    expect(escapeCell('hello')).toBe('"hello"')
  })

  it('escapes internal double quotes (RFC 4180)', () => {
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('converts null to empty string', () => {
    expect(escapeCell(null)).toBe('""')
  })

  it('converts undefined to empty string', () => {
    expect(escapeCell(undefined)).toBe('""')
  })

  it('converts numbers to string', () => {
    expect(escapeCell(42)).toBe('"42"')
    expect(escapeCell(3.14)).toBe('"3.14"')
  })

  it('converts booleans to string', () => {
    expect(escapeCell(true)).toBe('"true"')
    expect(escapeCell(false)).toBe('"false"')
  })
})

describe('toRow()', () => {
  it('joins cells with commas', () => {
    expect(toRow(['a', 'b', 'c'])).toBe('"a","b","c"')
  })

  it('produces a valid CSV row with mixed types', () => {
    expect(toRow(['ID', 42, null, true])).toBe('"ID","42","","true"')
  })
})

describe('formatAnswer()', () => {
  it('returns "No aplica" when not_applicable is true', () => {
    expect(formatAnswer({ ...BLANK, not_applicable: true }, null)).toBe('No aplica')
  })

  it('returns option label for option_id answers', () => {
    expect(formatAnswer({ ...BLANK, option_id: 'opt-1' }, 'Aprobado')).toBe('Aprobado')
  })

  it('returns "Sí" for value_bool true', () => {
    expect(formatAnswer({ ...BLANK, value_bool: true }, null)).toBe('Sí')
  })

  it('returns "No" for value_bool false', () => {
    expect(formatAnswer({ ...BLANK, value_bool: false }, null)).toBe('No')
  })

  it('returns text value', () => {
    expect(formatAnswer({ ...BLANK, value_text: 'Observación' }, null)).toBe('Observación')
  })

  it('returns number as string', () => {
    expect(formatAnswer({ ...BLANK, value_number: 95 }, null)).toBe('95')
  })

  it('returns zero correctly', () => {
    expect(formatAnswer({ ...BLANK, value_number: 0 }, null)).toBe('0')
  })

  it('returns date value', () => {
    expect(formatAnswer({ ...BLANK, value_date: '2026-03-20' }, null)).toBe('2026-03-20')
  })

  it('returns JSON stringified for value_json', () => {
    const json = { items: [1, 2] }
    expect(formatAnswer({ ...BLANK, value_json: json }, null)).toBe(JSON.stringify(json))
  })

  it('returns empty string when all fields are null', () => {
    expect(formatAnswer(BLANK, null)).toBe('')
  })
})
