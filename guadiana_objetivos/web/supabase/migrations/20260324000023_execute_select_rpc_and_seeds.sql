-- ============================================================================
-- RPC execute_select + Seeds: herramienta execute_query + skill de schema
-- YA APLICADO via MCP — este archivo es referencia histórica
-- ============================================================================

-- ── 1. Función RPC execute_select ────────────────────────────────────────────
-- Nota: \b (word boundary) NO funciona en PostgreSQL regex.
-- Usar ^\s*SELECT[\s\(] en su lugar.
CREATE OR REPLACE FUNCTION execute_select(query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  clean_query TEXT;
BEGIN
  clean_query := trim(query);

  -- Validar que empiece con SELECT (no usar \b — no soportado en PG regex)
  IF NOT (clean_query ~* '^SELECT[\s\(]') AND NOT (clean_query ~* '^SELECT$') THEN
    RAISE EXCEPTION 'Solo se permiten consultas SELECT';
  END IF;

  -- Bloquear keywords peligrosos
  IF clean_query ~* '\y(DROP|DELETE|INSERT|UPDATE|ALTER|TRUNCATE|GRANT|REVOKE|COPY|VACUUM|REINDEX)\y' THEN
    RAISE EXCEPTION 'La consulta contiene operaciones no permitidas';
  END IF;

  -- Ejecutar la consulta de forma segura
  BEGIN
    EXECUTE format(
      'SELECT COALESCE(jsonb_agg(row_to_json(t)), %L::jsonb) FROM (%s) t',
      '[]',
      clean_query
    ) INTO result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error al ejecutar la consulta: %', SQLERRM;
  END;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION execute_select(TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION execute_select(TEXT) FROM anon;


-- ── 2. Seed: herramienta execute_query ───────────────────────────────────────
INSERT INTO ai_tools (name, title, description, parameters_schema, python_code, is_active, priority)
VALUES (
  'execute_query',
  'Consultar Base de Datos',
  'Ejecuta una consulta SQL SELECT en la base de datos de GUADIANA y retorna los resultados. Usar cuando se necesiten datos: entregables, objetivos, departamentos, progreso en cursos.',
  '{"type":"object","properties":{"sql":{"type":"string","description":"Consulta SQL SELECT a ejecutar"}},"required":["sql"]}',
  $pycode$#!/usr/bin/env python3
"""execute_query - Consultar Base de Datos GUADIANA"""
import sys, json, os, re

try:
    from supabase import create_client
except ImportError:
    print(json.dumps({"error": "Modulo supabase no instalado. Ejecutar: pip install supabase"}))
    sys.exit(0)

INPUT    = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
SUPA_URL = os.environ.get('SUPABASE_URL', '')
SUPA_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

sql = INPUT.get('sql', '').strip()

if not sql:
    print(json.dumps({"error": "Parametro 'sql' requerido"}))
    sys.exit(0)

if not re.match(r'^\s*SELECT\b', sql, re.IGNORECASE):
    print(json.dumps({"error": "Solo se permiten consultas SELECT"}))
    sys.exit(0)

dangerous = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'TRUNCATE', 'GRANT', 'EXEC', 'COPY']
for kw in dangerous:
    if re.search(r'\b' + kw + r'\b', sql, re.IGNORECASE):
        print(json.dumps({"error": f"Keyword no permitido: {kw}"}))
        sys.exit(0)

try:
    supabase = create_client(SUPA_URL, SUPA_KEY)
    result = supabase.rpc('execute_select', {'query': sql}).execute()
    data = result.data if result.data else []
    print(json.dumps({"rows": data, "count": len(data) if isinstance(data, list) else 0}, default=str))
except Exception as e:
    print(json.dumps({"error": str(e)}))
$pycode$,
  true,
  90
)
ON CONFLICT (name) DO NOTHING;


-- ── 3. Seed: skill de esquema de base de datos ───────────────────────────────
INSERT INTO ai_skills (title, skill_type, content, trigger_keywords, is_active, priority)
VALUES (
  'Esquema de Base de Datos GUADIANA',
  'knowledge',
  $content$## Tablas disponibles para consulta SQL

### objective_deliverables — Entregables asignados a usuarios
- id, title, description, status (pending|submitted|approved|rejected)
- due_date (DATE), assignee_id (UUID→profiles), objective_id (UUID→objectives)

### objectives — Objetivos departamentales
- id, title, description, department_id (UUID→departments)
- month (1-12), year, weight, status (active|closed)

### departments — Departamentos
- id, name, description, manager_id (UUID→profiles)

### profiles — Usuarios del sistema
- id, full_name, role, branch_id (UUID→departments), email

### lms_courses — Cursos de capacitación
- id, title, description, category, is_published (BOOLEAN)

### lms_course_topics — Temas de cursos
- id, course_id, title, content_type (video|pdf|text|quiz), order_index

### lms_course_progress — Progreso en cursos
- user_id, course_id, topic_id, completed_at, quiz_score

## Uso
Usa la herramienta execute_query con SQL SELECT para obtener datos reales del sistema.
$content$,
  '{}',
  true,
  95
);
