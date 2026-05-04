# Integración con Supabase - Guadiana Objetivos

**Última actualización**: 2026-05-02
**Proyecto Supabase**: mhdswebflviruafdlkvb
**URL**: https://mhdswebflviruafdlkvb.supabase.co

## Proyecto Supabase

### Configuración
- **Project URL**: `https://mhdswebflviruafdlkvb.supabase.co`
- **Anon Key**: (ver `.env.local`)
- **Service Role Key**: (ver `.env.local`) - NUNCA exponer en frontend

### Entorno
- **Región**: US East (por defecto)
- **PostgreSQL Version**: 15.x
- **RLS Habilitado**: Sí, en todas las tablas

## Tablas Principales

### Auth y Usuarios

#### `auth.users` (Tabla del sistema Supabase)
- Gestiona autenticación (email/password, OAuth)
- No modificar directamente

#### `profiles` (Tabla personalizada)
```sql
id              UUID PRIMARY KEY REFERENCES auth.users(id)
email           TEXT
name            TEXT
role_id         UUID REFERENCES roles(id)
phone           TEXT
whatsapp        TEXT CHECK (whatsapp ~ '^\+\d{1,3}\d{7,15}$')
avatar_url      TEXT
last_seen       TIMESTAMPTZ
```
- **RLS**: Auto-acceso + `users.edit` + root

#### `app_profiles` (Flutter app - inventarios)
- ⚠️ No confundir con `profiles` (web)
- Usada por app Flutter de inventarios

### Sistema de Roles (M0)

#### `platform_modules`
```sql
id          UUID PRIMARY KEY
key         TEXT UNIQUE (ej: 'objetivos.view')
label       TEXT
module      TEXT
sort_order  SMALLINT
is_active   BOOLEAN
```
- **Seed**: 27 permisos predefinidos
- **RLS**: SELECT público, INSERT solo root

#### `roles`
```sql
id          UUID PRIMARY KEY
name        TEXT UNIQUE
description TEXT
is_root     BOOLEAN
is_active   BOOLEAN
created_by  UUID REFERENCES auth.users(id)
```
- **Seed**: Un rol `root` predefinido
- **RLS**: `roles.view` para ver, `roles.manage` para editar

#### `role_permissions`
```sql
id          UUID PRIMARY KEY
role_id     UUID REFERENCES roles(id)
module_id   UUID REFERENCES platform_modules(id)
UNIQUE (role_id, module_id)
```
- **RLS**: Solo root y roles.manage

### Objetivos (M1)

#### `departments`
```sql
id          UUID PRIMARY KEY
name        TEXT
description TEXT
manager_id  UUID REFERENCES profiles(id)
is_active   BOOLEAN
```
- ⚠️ **OBSOLETA**: Reemplazada por `org_departments` del organigrama

#### `objectives`
```sql
id              UUID PRIMARY KEY
department_id   UUID REFERENCES departments(id)
title           TEXT
description     TEXT
month           SMALLINT
year            SMALLINT
weight          NUMERIC(5,2)
target_value    NUMERIC(10,2)
evidence_type   TEXT
checklist_id    UUID REFERENCES form_surveys(id)
status          TEXT
created_by      UUID REFERENCES profiles(id)
assignee_id     UUID REFERENCES profiles(id)
```
- **RLS**: `objetivos.view` para ver, `objetivos.manage` para editar

#### `objective_deliverables`
```sql
id            UUID PRIMARY KEY
objective_id  UUID REFERENCES objectives(id)
title         TEXT
description   TEXT
due_date      DATE
assignee_id   UUID REFERENCES profiles(id)
status        TEXT (pending|submitted|approved|rejected)
submitted_at  TIMESTAMPTZ
late_approved_by UUID REFERENCES profiles(id)
late_approved_at TIMESTAMPTZ
```
- **RLS**: Auto-acceso para asignado + `objetivos.view` + `objetivos.manage`

#### `objective_evidences`
```sql
id              UUID PRIMARY KEY
deliverable_id  UUID REFERENCES objective_deliverables(id)
submitted_by    UUID REFERENCES profiles(id)
storage_path    TEXT (Supabase Storage)
evidence_url    TEXT (URL externa)
text_content    TEXT
run_id          UUID REFERENCES resp_survey_runs(id)
submitted_at    TIMESTAMPTZ
notes           TEXT
```
- **RLS**: Auto-acceso para submitter + `objetivos.view` + `objetivos.review`

#### `objective_reviews`
```sql
id              UUID PRIMARY KEY
deliverable_id  UUID REFERENCES objective_deliverables(id)
reviewer_id     UUID REFERENCES profiles(id)
verdict         TEXT (approved|rejected)
comment         TEXT
reviewed_at     TIMESTAMPTZ
```
- **RLS**: `objetivos.review` para crear, `objetivos.view` para ver

### Incentivos (M3)

#### `incentive_schemas`
```sql
id              UUID PRIMARY KEY
org_dept_id     UUID REFERENCES org_departments(id)
org_area_id     UUID REFERENCES org_areas(id)
name            TEXT
base_amount     NUMERIC(10,2)
bonus_amount    NUMERIC(10,2)
period_type     TEXT (monthly|annual|custom)
valid_from      DATE
valid_to        DATE
```
- **RLS**: Scoped a depto/área del usuario + `incentivos.view` + root

#### `incentive_records`
```sql
id                  UUID PRIMARY KEY
schema_id           UUID REFERENCES incentive_schemas(id)
user_id             UUID REFERENCES profiles(id)
period_month        SMALLINT
period_year         SMALLINT
base_amount         NUMERIC(10,2)
calculated_amount   NUMERIC(10,2)
tier_pct            NUMERIC(5,2)
```
- **RLS**: Scoped a depto/área del usuario + `incentivos.view` + root

### Formularios (Checklists)

#### `form_surveys`
```sql
id          UUID PRIMARY KEY
name        TEXT
description TEXT
status      TEXT (draft|published|archived)
version     INTEGER
created_by  UUID REFERENCES profiles(id)
```
- **RLS**: `formularios.view` para ver, `formularios.manage` para editar

#### `form_sections`
```sql
id          UUID PRIMARY KEY
survey_id   UUID REFERENCES form_surveys(id)
title       TEXT
order       SMALLINT
```

#### `form_questions`
```sql
id          UUID PRIMARY KEY
section_id  UUID REFERENCES form_sections(id)
title       TEXT
type        TEXT (boolean|single_choice|multiple_choice|text|number|date)
required    BOOLEAN
order       SMALLINT
```

#### `form_question_options`
```sql
id          UUID PRIMARY KEY
question_id UUID REFERENCES form_questions(id)
label       TEXT
value       TEXT
order       SMALLINT
```

#### `form_conditions` (Flujo Condicional)
```sql
id                  UUID PRIMARY KEY
survey_id           UUID REFERENCES form_surveys(id)
source_question_id  UUID REFERENCES form_questions(id)
source_option_id    UUID REFERENCES form_question_options(id)
target_section_id   UUID REFERENCES form_sections(id)
target_question_id  UUID REFERENCES form_questions(id)
action              TEXT (jump_to_section|jump_to_question|jump_to_end)
```

#### `form_assignments`
```sql
id              UUID PRIMARY KEY
survey_id       UUID REFERENCES form_surveys(id)
branch_id       UUID
role_id         UUID REFERENCES roles(id)
user_id         UUID REFERENCES profiles(id)
frequency       TEXT
valid_from      DATE
valid_to        DATE
is_active       BOOLEAN
```

### Resultados

#### `resp_survey_runs`
```sql
id          UUID PRIMARY KEY
survey_id   UUID REFERENCES form_surveys(id)
submitted_by UUID REFERENCES profiles(id)
branch_id   UUID
status      TEXT (in_progress|completed)
submitted_at TIMESTAMPTZ
```

#### `resp_answers`
```sql
id          UUID PRIMARY KEY
run_id      UUID REFERENCES resp_survey_runs(id)
question_id UUID REFERENCES form_questions(id)
option_id   UUID REFERENCES form_question_options(id)
text_value  TEXT
number_value NUMERIC(10,2)
date_value  DATE
```

### Organigrama

#### `org_direction`
```sql
id          UUID PRIMARY KEY
name        TEXT
color_hex   TEXT
responsible_id UUID REFERENCES profiles(id)
position_id UUID REFERENCES org_positions(id)
```

#### `org_departments`
```sql
id          UUID PRIMARY KEY
name        TEXT
color_hex   TEXT
parent_dept_id UUID REFERENCES org_departments(id)
responsible_id UUID REFERENCES profiles(id)
position_id UUID REFERENCES org_positions(id)
```

#### `org_areas`
```sql
id              UUID PRIMARY KEY
department_id   UUID REFERENCES org_departments(id)
direction_id    UUID REFERENCES org_direction(id)
name            TEXT
color_hex       TEXT
responsible_id  UUID REFERENCES profiles(id)
position_id     UUID REFERENCES org_positions(id)
```

#### `org_positions`
```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL UNIQUE
```

#### `org_members`
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES profiles(id)
department_id UUID REFERENCES org_departments(id)
area_id     UUID REFERENCES org_areas(id)
direction_id UUID REFERENCES org_direction(id)
position_id UUID REFERENCES org_positions(id)
```

### Chat (M5)

#### `chat_rooms`
```sql
id          UUID PRIMARY KEY
name        TEXT
is_group    BOOLEAN
created_by  UUID REFERENCES profiles(id)
```

#### `chat_room_members`
```sql
id          UUID PRIMARY KEY
room_id     UUID REFERENCES chat_rooms(id)
user_id     UUID REFERENCES profiles(id)
is_admin    BOOLEAN
```

#### `chat_messages`
```sql
id          UUID PRIMARY KEY
room_id     UUID REFERENCES chat_rooms(id)
sender_id   UUID REFERENCES profiles(id)
content     TEXT
file_path   TEXT
created_at  TIMESTAMPTZ
edited_at   TIMESTAMPTZ
```

### LMS (M7)

#### `lms_courses`
```sql
id          UUID PRIMARY KEY
title       TEXT
description TEXT
category    TEXT
is_published BOOLEAN
created_by  UUID REFERENCES profiles(id)
```

#### `lms_course_topics`
```sql
id          UUID PRIMARY KEY
course_id   UUID REFERENCES lms_courses(id)
title       TEXT
type        TEXT (video|pdf|text|survey)
content_id  UUID
order       SMALLINT
```

## Funciones SQL Importantes

### `has_permission(permission_key TEXT)`
Retorna `true` si el usuario actual tiene el permiso.

```sql
CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Root bypasea todo
  IF is_root() THEN RETURN true; END IF;

  -- Verificar si existe role_permission
  RETURN EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN platform_modules pm ON rp.module_id = pm.id
    JOIN profiles p ON p.role_id = rp.role_id
    WHERE p.id = auth.uid()
    AND pm.key = permission_key
    AND pm.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `is_root()`
Retorna `true` si el usuario tiene rol `root`.

```sql
CREATE OR REPLACE FUNCTION is_root()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.is_root = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### `current_user_role_id()`
Retorna el `role_id` del usuario actual.

### `handle_new_user()`
Trigger que crea perfil automáticamente al registrar usuario.

## Políticas RLS

### Patrones Comunes

#### Auto-acceso
```sql
CREATE POLICY "profile_self_access" ON profiles
FOR SELECT USING (auth.uid() = id);
```

#### Por permiso
```sql
CREATE POLICY "obj_view" ON objectives
FOR SELECT USING (has_permission('objetivos.view') OR is_root());
```

#### Por asignación
```sql
CREATE POLICY "deliv_assignee" ON objective_deliverables
FOR SELECT USING (assignee_id = auth.uid());
```

### Funciones SECURITY DEFINER
Usadas para romper recursión en RLS:
- `_org_my_dept_ids()`: Deptos donde soy miembro
- `_org_my_member_dept_ids()`: Deptos donde soy miembro del depto
- `_org_my_member_area_ids()`: Áreas donde soy miembro

## Buckets de Storage

### `objective-evidences`
- **Tipo**: Privado
- **RLS**: Solo usuarios con `objetivos.view` o el submitter
- **Uso**: Archivos subidos como evidencia

### `lms-content`
- **Tipo**: Privado
- **RLS**: Solo usuarios con `capacitacion.view`
- **Uso**: PDFs y contenido de cursos

### `chat-files`
- **Tipo**: Privado
- **RLS**: Solo miembros del room
- **Uso**: Archivos adjuntos en chat

### `system-assets`
- **Tipo**: Público
- **RLS**: SELECT público, INSERT solo `config.edit`
- **Uso**: Logo de empresa

## Convenciones SQL

### Nomenclatura
- Tablas: `snake_case`
- Columnas: `snake_case`
- Índices: `idx_{tabla}_{columnas}`
- Foreign keys: `{tabla}_{columna}_fkey`
- Políticas: `{tabla}_{acción}`

### Timestamps
- Usar `TIMESTAMPTZ` (siempre con zona horaria)
- Default: `now()`
- No soft deletes (DELETE directo)

### IDs
- Siempre `UUID PRIMARY KEY DEFAULT gen_random_uuid()`

### Foreign Keys
- `ON DELETE CASCADE` para relaciones dependientes
- `ON DELETE SET NULL` para referencias opcionales

## Patrones de Cliente

### Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll, setAll } }
  )
}
```

### Browser Client (`src/lib/supabase/client.ts`)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Admin Client (`src/lib/supabase/admin.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})
```

⚠️ **ADVERTENCIA**: Admin client bypasea RLS. Solo usar en Server Actions con validación de permisos explícita.

## Consultas Frecuentes

### Obtener perfil con rol
```typescript
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('*, roles(*)')
  .eq('id', user.id)
  .single()
```

### Verificar permiso (Server Component)
```typescript
import { requirePermission } from '@/lib/permissions'

export default async function Page() {
  await requirePermission('objetivos.view')
  // ...
}
```

### Insert con返回 ID
```typescript
const { data, error } = await supabase
  .from('objectives')
  .insert({ title: 'Nuevo objetivo' })
  .select('id')
  .single()
```

### Upsert
```typescript
await supabase
  .from('profiles')
  .upsert({ id: userId, name: 'Juan' })
  .select()
```
