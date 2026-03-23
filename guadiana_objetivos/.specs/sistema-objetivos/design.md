# Diseño Técnico — Sistema de Objetivos e Incentivos
## Llantas y Rines del Guadiana — Módulos M0, M1, M2, M3, M4, M6, M7

**Versión:** 3.0
**Fecha:** 2026-03-22

---

## 1. Estado Real de la Base de Datos en Supabase

> Verificado directamente contra el proyecto Supabase. Las tablas marcadas con ✅ ya existen.

### Tablas existentes relevantes

| Tabla | RLS | Uso |
|-------|-----|-----|
| ✅ `profiles` | ✓ | Usuarios del sistema web (checklist/objetivos) |
| ✅ `app_profiles` | ✓ | Perfiles de la app móvil Flutter (first_name, last_name) |
| ✅ `users` | ✗ | Módulo de inventarios (roles: admin/operator/viewer) — **NO tocar** |
| ✅ `form_surveys` | ✓ | M5 — Formularios |
| ✅ `form_sections` | ✓ | M5 — Secciones |
| ✅ `form_questions` | ✓ | M5 — Preguntas |
| ✅ `form_question_options` | ✓ | M5 — Opciones |
| ✅ `form_conditions` | ✓ | M5 — Flujo condicional |
| ✅ `form_assignments` | ✓ | M5 — Asignaciones |
| ✅ `resp_survey_runs` | ✓ | M5 — Ejecuciones de checklists |
| ✅ `resp_answers` | ✓ | M5 — Respuestas individuales |
| ✅ `sync_logs` | ✗ | Logs de sincronización OkCar |
| ✅ `okcar_*` (13 tablas) | ✓ | ERP — **NO tocar** |
| ✅ `inventario`, `conteo_inventario`, etc. | ✓/✗ | Módulo inventarios — **NO tocar** |

### Funciones existentes a PRESERVAR y EXTENDER

| Función | Comportamiento actual | Acción |
|---------|----------------------|--------|
| `current_user_role()` | `SELECT role FROM profiles WHERE id = auth.uid()` | Mantener; agregar `current_user_role_id()` |
| `current_user_branch()` | `SELECT branch_id FROM profiles WHERE id = auth.uid()` | Mantener sin cambios |
| `handle_new_user()` | Crea registro en `profiles` con role='asesor' | Actualizar para asignar `role_id` al rol por defecto |
| `get_user_name()` | Lee de `app_profiles` (app móvil) | **NO modificar** |
| `update_updated_at()` | Trigger genérico de timestamp | Reutilizar en tablas nuevas |

### Estructura actual de `profiles`

```
profiles (✅ existe)
├── id          UUID PK → auth.users
├── full_name   TEXT
├── role        TEXT default 'asesor'   ← rol hardcodeado actual
├── branch_id   UUID (nullable)
├── is_active   BOOLEAN default true
├── created_at  TIMESTAMPTZ
└── updated_at  TIMESTAMPTZ
```

---

## 2. Arquitectura General

```
┌────────────────────────────────────────────────────────┐
│                  Next.js 15 (Web)                      │
│  App Router + Server Components + Server Actions        │
│  Rutas: /usuarios /roles /objetivos /dashboard          │
│         /incentivos /ia-verificacion /mentoring          │
│         /capacitacion                                   │
└──────────────────────┬─────────────────────────────────┘
                       │ Supabase Client (SSR)
                       ▼
┌────────────────────────────────────────────────────────┐
│              Supabase (Backend-as-a-Service)            │
│  PostgreSQL + Auth + Storage + RLS                      │
│  Funciones: is_root(), has_permission()                 │
│             current_user_role() [existente]             │
└──────────┬────────────────────────┬────────────────────┘
           │                        │ Storage URLs firmadas
           │                        ▼
           │            ┌───────────────────────┐
           │            │  Python AI Service    │
           │            │  FastAPI (separado)   │
           │            │  POST /analyze        │
           │            │  POST /chat           │
           │            └───────────────────────┘
           │
           ▼
    [Flutter App] — M5 Checklists (usa app_profiles, no profiles)
```

---

## 3. Schema M0 — Sistema de Roles Granular

### 3.1 Nuevas tablas (a crear)

#### `platform_modules` — Áreas de permiso

```sql
CREATE TABLE platform_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  module      TEXT NOT NULL,
  sort_order  SMALLINT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);

-- Seed completo de todas las áreas
INSERT INTO platform_modules (key, label, module, sort_order) VALUES
  ('users.view',          'Ver lista de usuarios',          'Usuarios',     10),
  ('users.edit',          'Editar perfil de usuarios',      'Usuarios',     11),
  ('users.activate',      'Activar / desactivar usuarios',  'Usuarios',     12),
  ('users.change_role',   'Cambiar rol de un usuario',      'Usuarios',     13),
  ('roles.view',          'Ver roles existentes',           'Roles',        20),
  ('roles.manage',        'Crear / editar / eliminar roles','Roles',        21),
  ('formularios.view',    'Ver formularios',                'Formularios',  30),
  ('formularios.create',  'Crear formularios',              'Formularios',  31),
  ('formularios.edit',    'Editar formularios',             'Formularios',  32),
  ('formularios.delete',  'Eliminar formularios',           'Formularios',  33),
  ('formularios.assign',  'Asignar formularios',            'Formularios',  34),
  ('resultados.view',     'Ver resultados',                 'Resultados',   40),
  ('resultados.export',   'Exportar resultados',            'Resultados',   41),
  ('objetivos.view',      'Ver objetivos',                  'Objetivos',    50),
  ('objetivos.manage',    'Crear y editar objetivos',       'Objetivos',    51),
  ('objetivos.review',    'Aprobar/rechazar entregables',   'Objetivos',    52),
  ('dashboard.view',      'Ver tablero de control',         'Dashboard',    60),
  ('dashboard.export',    'Exportar datos del tablero',     'Dashboard',    61),
  ('incentivos.view',     'Ver incentivos',                 'Incentivos',   70),
  ('incentivos.manage',   'Configurar esquemas',            'Incentivos',   71),
  ('incentivos.approve',  'Aprobar cálculos',               'Incentivos',   72),
  ('ia.view',             'Ver análisis IA',                'IA',           80),
  ('ia.configure',        'Configurar prompts IA',          'IA',           81),
  ('mentoring.view',      'Ver programa de mentoring',      'Mentoring',    90),
  ('mentoring.manage',    'Gestionar pares y sesiones',     'Mentoring',    91),
  ('capacitacion.view',   'Ver contenidos LMS',             'Capacitación', 100),
  ('capacitacion.manage', 'Crear y publicar contenidos',    'Capacitación', 101);
```

#### `roles` — Roles personalizables

```sql
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_root     BOOLEAN NOT NULL DEFAULT false,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Seed: único rol predefinido
INSERT INTO roles (name, description, is_root)
VALUES ('root', 'Control total del sistema. Bypasea todos los permisos.', true);
```

#### `role_permissions` — Permisos por rol

```sql
CREATE TABLE role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES platform_modules(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role_id, module_id)
);
```

#### `role_change_log` — Auditoría de cambios de rol

```sql
CREATE TABLE role_change_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  changed_by   UUID NOT NULL REFERENCES auth.users(id),
  old_role_id  UUID REFERENCES roles(id),
  new_role_id  UUID REFERENCES roles(id),
  reason       TEXT,
  changed_at   TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Modificar tabla existente `profiles`

> Solo se AGREGAN columnas. No se elimina ni modifica nada existente.

```sql
ALTER TABLE profiles
  ADD COLUMN role_id    UUID REFERENCES roles(id),
  ADD COLUMN phone      TEXT,
  ADD COLUMN whatsapp   TEXT,   -- formato E.164: +521234567890
  ADD COLUMN avatar_url TEXT;

-- Restricción de formato WhatsApp (opcional, validación suave)
-- La validación estricta se hace en la capa de aplicación Next.js

CREATE INDEX idx_profiles_role_id ON profiles(role_id);
```

> **Nota:** `profiles.role` (TEXT) se mantiene durante el período de migración.
> Una vez migrados todos los usuarios a `role_id`, se puede deprecar en una migración futura.

### 3.3 Nuevas funciones SQL

```sql
-- Verificar si el usuario actual tiene rol root
CREATE OR REPLACE FUNCTION is_root()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.is_root = true
  );
$$;

-- Verificar un permiso específico (root bypasea todo)
CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT is_root() OR EXISTS (
    SELECT 1
    FROM profiles p
    JOIN role_permissions rp ON rp.role_id = p.role_id
    JOIN platform_modules pm ON pm.id = rp.module_id
    WHERE p.id = auth.uid()
      AND pm.key = permission_key
      AND pm.is_active = true
  );
$$;

-- Obtener el role_id del usuario actual (complementa current_user_role())
CREATE OR REPLACE FUNCTION current_user_role_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role_id FROM profiles WHERE id = auth.uid();
$$;
```

### 3.4 Actualizar función `handle_new_user()`

```sql
-- Reemplazar el trigger existente para también asignar role_id por defecto
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  default_role_id UUID;
BEGIN
  -- Obtener el rol por defecto (el primer rol no-root activo, si existe)
  SELECT id INTO default_role_id
  FROM roles
  WHERE is_root = false AND is_active = true
  ORDER BY created_at ASC
  LIMIT 1;

  INSERT INTO profiles (id, full_name, role, role_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    'asesor',        -- mantener el campo legacy durante migración
    default_role_id  -- nuevo campo
  );
  RETURN NEW;
END;
$$;
```

### 3.5 RLS para tablas M0

```sql
-- platform_modules: lectura pública (necesario para UI de permisos)
ALTER TABLE platform_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read modules" ON platform_modules FOR SELECT USING (true);
CREATE POLICY "manage modules" ON platform_modules FOR ALL USING (is_root());

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read roles" ON roles FOR SELECT
  USING (has_permission('roles.view') OR is_root());
CREATE POLICY "manage roles" ON roles FOR ALL
  USING (has_permission('roles.manage') OR is_root());

-- role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read role_permissions" ON role_permissions FOR SELECT
  USING (has_permission('roles.view') OR is_root());
CREATE POLICY "manage role_permissions" ON role_permissions FOR ALL
  USING (has_permission('roles.manage') OR is_root());

-- role_change_log
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read log" ON role_change_log FOR SELECT USING (is_root());
CREATE POLICY "insert log" ON role_change_log FOR INSERT WITH CHECK (true);

-- profiles: agregar nuevas policies (las existentes se conservan)
CREATE POLICY "users.view can read all" ON profiles FOR SELECT
  USING (has_permission('users.view') OR is_root());
CREATE POLICY "users.edit can update all" ON profiles FOR UPDATE
  USING (id = auth.uid() OR has_permission('users.edit') OR is_root());
```

### 3.6 Migración de roles existentes

```sql
-- Crear roles equivalentes a los hardcodeados actuales
INSERT INTO roles (name, description) VALUES
  ('Administrador',   'Acceso completo a todos los módulos excepto root'),
  ('Jefe de Área',    'Gestión de su área, revisión de entregables y resultados'),
  ('Auditor',         'Lectura y exportación de resultados y reportes'),
  ('Asesor',          'Acceso a sus objetivos y checklists asignados'),
  ('Operario',        'Acceso básico a sus checklists asignados');

-- Asignar permisos al rol Administrador (todos excepto roles.manage restringido)
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Administrador';

-- Asignar role_id en profiles según el role TEXT actual
UPDATE profiles p
SET role_id = r.id
FROM roles r
WHERE
  (p.role = 'admin_global'   AND r.name = 'Administrador') OR
  (p.role = 'jefe_sucursal'  AND r.name = 'Jefe de Área')  OR
  (p.role = 'auditor'        AND r.name = 'Auditor')        OR
  (p.role = 'asesor'         AND r.name = 'Asesor')         OR
  (p.role = 'operario'       AND r.name = 'Operario');
```

---

## 4. Schema M1–M3: Objetivos e Incentivos

### 4.1 Departamentos y objetivos (tablas nuevas)

```sql
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  manager_id  UUID REFERENCES profiles(id),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view departments" ON departments FOR SELECT
  USING (has_permission('objetivos.view') OR is_root());
CREATE POLICY "manage departments" ON departments FOR ALL
  USING (has_permission('objetivos.manage') OR is_root());
```

```sql
CREATE TABLE objectives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  month           SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            SMALLINT NOT NULL,
  weight          NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  target_value    NUMERIC(10,2),
  evidence_type   TEXT NOT NULL DEFAULT 'document', -- document|photo|text|checklist
  checklist_id    UUID REFERENCES form_surveys(id),  -- reutiliza M5
  status          TEXT NOT NULL DEFAULT 'active',    -- active|closed|cancelled
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (department_id, month, year, title)
);

CREATE TABLE objective_deliverables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id  UUID NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  due_date      DATE,
  assignee_id   UUID REFERENCES profiles(id),
  status        TEXT NOT NULL DEFAULT 'pending', -- pending|submitted|approved|rejected
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE objective_evidences (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id) ON DELETE CASCADE,
  submitted_by    UUID NOT NULL REFERENCES profiles(id),
  storage_path    TEXT,
  evidence_url    TEXT,
  text_content    TEXT,
  run_id          UUID REFERENCES resp_survey_runs(id), -- vincula con M5
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  notes           TEXT
);

CREATE TABLE objective_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id),
  reviewer_id     UUID NOT NULL REFERENCES profiles(id),
  verdict         TEXT NOT NULL,  -- approved|rejected
  comment         TEXT,
  reviewed_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE objective_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id    UUID NOT NULL REFERENCES objectives(id),
  department_id   UUID NOT NULL REFERENCES departments(id),
  month           SMALLINT NOT NULL,
  year            SMALLINT NOT NULL,
  completion_pct  NUMERIC(5,2) DEFAULT 0,
  calculated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (objective_id, month, year)
);
```

### 4.2 Alertas del sistema

```sql
CREATE TABLE system_alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT NOT NULL,   -- low_completion|deadline_approaching|period_closed
  entity_type    TEXT NOT NULL,   -- objective|deliverable|department
  entity_id      UUID NOT NULL,
  message        TEXT NOT NULL,
  severity       TEXT NOT NULL DEFAULT 'warning',  -- info|warning|critical
  is_read        BOOLEAN DEFAULT false,
  target_role_id UUID REFERENCES roles(id),
  target_user    UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### 4.3 Incentivos

```sql
CREATE TABLE incentive_schemas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id   UUID REFERENCES departments(id),
  role_id         UUID REFERENCES roles(id),  -- NULL = todos los roles del depto
  base_amount     NUMERIC(10,2) NOT NULL,
  tiers           JSONB NOT NULL,
  -- [{"min_pct": 80, "max_pct": 89, "bonus_pct": 50}, ...]
  valid_from      DATE NOT NULL,
  valid_to        DATE,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE incentive_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id),
  department_id     UUID NOT NULL REFERENCES departments(id),
  schema_id         UUID REFERENCES incentive_schemas(id),
  month             SMALLINT NOT NULL,
  year              SMALLINT NOT NULL,
  completion_pct    NUMERIC(5,2) NOT NULL,
  base_amount       NUMERIC(10,2) NOT NULL,
  bonus_pct         NUMERIC(5,2) NOT NULL,
  calculated_amount NUMERIC(10,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'draft',  -- draft|approved|paid
  approved_by       UUID REFERENCES profiles(id),
  approved_at       TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, month, year)
);
```

---

## 5. Schema M4: IA

```sql
CREATE TABLE ai_analysis_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id  UUID NOT NULL REFERENCES objective_deliverables(id),
  evidence_ids    UUID[] NOT NULL,
  verdict         TEXT NOT NULL,    -- approved|rejected|needs_review
  confidence      NUMERIC(3,2),
  summary         TEXT,
  findings        JSONB,            -- {"positive": [...], "negative": [...]}
  prompt_used     TEXT,
  model_used      TEXT,
  human_verdict   TEXT,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  context       TEXT NOT NULL DEFAULT 'verification',  -- verification|lms_chat
  system_prompt TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_by    UUID REFERENCES profiles(id),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Schema M6–M7: Mentoring y LMS

```sql
-- Mentoring
CREATE TABLE mentoring_pairs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   UUID NOT NULL REFERENCES profiles(id),
  mentee_id   UUID NOT NULL REFERENCES profiles(id),
  start_date  DATE NOT NULL,
  end_date    DATE,
  is_active   BOOLEAN DEFAULT true,
  objectives  TEXT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (mentor_id, mentee_id)
);

CREATE TABLE mentoring_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id         UUID NOT NULL REFERENCES mentoring_pairs(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  completed_at    TIMESTAMPTZ,
  modality        TEXT DEFAULT 'presencial',
  agenda          TEXT,
  topics_covered  TEXT[],
  commitments     TEXT,
  mentor_rating   SMALLINT CHECK (mentor_rating BETWEEN 1 AND 5),
  mentor_notes    TEXT,
  mentee_rating   SMALLINT CHECK (mentee_rating BETWEEN 1 AND 5),
  mentee_feedback TEXT,
  status          TEXT DEFAULT 'scheduled',  -- scheduled|completed|cancelled
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- LMS
CREATE TABLE lms_content (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  content_type  TEXT NOT NULL,  -- pdf|video|text|quiz
  storage_path  TEXT,           -- PDFs en bucket 'lms-content'
  video_url     TEXT,           -- URL externa YouTube/Vimeo
  text_body     TEXT,
  is_published  BOOLEAN DEFAULT false,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lms_quizzes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  UUID NOT NULL REFERENCES lms_content(id) ON DELETE CASCADE,
  questions   JSONB NOT NULL,
  -- [{"question": "...", "options": ["A","B","C","D"], "correct": 0}]
  min_score   SMALLINT DEFAULT 70,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lms_paths (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  content_ids   UUID[] NOT NULL,
  cert_title    TEXT,
  created_by    UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lms_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id),
  content_id    UUID REFERENCES lms_content(id),
  path_id       UUID REFERENCES lms_paths(id),
  started_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  quiz_score    NUMERIC(5,2),
  certified     BOOLEAN DEFAULT false,
  UNIQUE (user_id, content_id)
);
```

---

## 7. Resumen: tablas nuevas vs existentes

| Tabla | Acción | Módulo |
|-------|--------|--------|
| `profiles` | ✏️ ALTER — agregar role_id, phone, whatsapp, avatar_url | M0 |
| `platform_modules` | ➕ CREATE | M0 |
| `roles` | ➕ CREATE | M0 |
| `role_permissions` | ➕ CREATE | M0 |
| `role_change_log` | ➕ CREATE | M0 |
| `departments` | ➕ CREATE | M1 |
| `objectives` | ➕ CREATE | M1 |
| `objective_deliverables` | ➕ CREATE | M1 |
| `objective_evidences` | ➕ CREATE | M1 |
| `objective_reviews` | ➕ CREATE | M1 |
| `objective_progress` | ➕ CREATE | M1 |
| `system_alerts` | ➕ CREATE | M2 |
| `incentive_schemas` | ➕ CREATE | M3 |
| `incentive_records` | ➕ CREATE | M3 |
| `ai_analysis_results` | ➕ CREATE | M4 |
| `ai_prompts` | ➕ CREATE | M4 |
| `mentoring_pairs` | ➕ CREATE | M6 |
| `mentoring_sessions` | ➕ CREATE | M6 |
| `lms_content` | ➕ CREATE | M7 |
| `lms_quizzes` | ➕ CREATE | M7 |
| `lms_paths` | ➕ CREATE | M7 |
| `lms_progress` | ➕ CREATE | M7 |
| `form_*`, `resp_*`, `users`, `okcar_*`, `inventario` | 🚫 NO MODIFICAR | — |

---

## 8. Helper de permisos en Next.js

**Archivo:** `web/src/lib/permissions.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function checkPermission(key: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: key })
  return data === true
}

export async function checkIsRoot(): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('is_root')
  return data === true
}

export async function requirePermission(key: string) {
  if (!(await checkPermission(key))) redirect('/sin-acceso')
}
```

---

## 9. Nuevas Rutas Next.js

| Ruta | Permiso | Descripción |
|------|---------|-------------|
| `/usuarios` | `users.view` | Lista de todos los usuarios |
| `/usuarios/[id]` | propio o `users.edit` | Perfil editable (incl. WhatsApp) |
| `/roles` | `roles.view` | Lista de roles |
| `/roles/nuevo` | `roles.manage` | Crear rol con permisos |
| `/roles/[id]` | `roles.manage` | Editar rol y permisos |
| `/sin-acceso` | — | Página de acceso denegado |
| `/objetivos` | `objetivos.view` | Objetivos por departamento |
| `/objetivos/[deptId]` | `objetivos.view` | Detalle de departamento |
| `/objetivos/configurar` | `objetivos.manage` | Configurar objetivos del mes |
| `/dashboard` | `dashboard.view` | Tablero ejecutivo de KPIs |
| `/incentivos` | `incentivos.view` | Incentivos y esquemas |
| `/incentivos/configurar` | `incentivos.manage` | Configurar esquemas |
| `/ia-verificacion` | `ia.view` | Log IA y prompts |
| `/mentoring` | `mentoring.view` | Pares y sesiones |
| `/mentoring/[pairId]` | `mentoring.view` | Detalle de par |
| `/capacitacion` | `capacitacion.view` | Catálogo LMS |
| `/capacitacion/[contentId]` | `capacitacion.view` | Reproducir contenido |
| `/capacitacion/chat` | `capacitacion.view` | Asistente IA |

---

## 10. Servicio Python de IA

```
ai-service/
├── main.py
├── routers/
│   ├── analyze.py        # POST /analyze
│   └── chat.py           # POST /chat
├── services/
│   ├── ai_client.py      # Claude API / OpenAI
│   ├── supabase_client.py
│   ├── storage.py        # descarga desde Supabase Storage
│   └── whatsapp.py       # WhatsApp Business API (usa profiles.whatsapp)
├── models.py
├── config.py
└── requirements.txt
```

**Variables de entorno nuevas:**

```env
# .env.local (Next.js)
PYTHON_AI_SERVICE_URL=http://localhost:8000
PYTHON_AI_SERVICE_API_KEY=secret_key_here

# ai-service/.env (Python)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
AI_API_KEY=...
API_SECRET_KEY=secret_key_here
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

---

## 11. Sidebar actualizado

**Archivo a modificar:** `web/src/components/layout/app-sidebar.tsx`

El Server Component del layout consulta permisos y renderiza solo las secciones accesibles:

```
Administración        (si has_permission users.* o roles.*)
  ├── Usuarios        /usuarios
  └── Roles           /roles

Checklists            (M5 existente — migrar a has_permission)
  ├── Formularios     /formularios
  ├── Asignaciones    /asignaciones
  └── Resultados      /resultados

Objetivos
  ├── Objetivos       /objetivos
  ├── Dashboard       /dashboard
  └── Incentivos      /incentivos

IA y Verificación
  └── Análisis IA     /ia-verificacion

Desarrollo Humano
  ├── Mentoring       /mentoring
  └── Capacitación    /capacitacion
```
