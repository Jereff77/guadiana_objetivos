-- ============================================================
-- T-001: Sistema de Roles Granular (M0)
-- Tablas: platform_modules, roles, role_permissions, role_change_log
-- ============================================================

-- 1. platform_modules — Áreas de permiso
CREATE TABLE platform_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  module      TEXT NOT NULL,
  sort_order  SMALLINT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);

-- Seed completo de todas las áreas (27 permisos)
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

-- 2. roles — Roles personalizables
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

-- 3. role_permissions — Permisos por rol
CREATE TABLE role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module_id   UUID NOT NULL REFERENCES platform_modules(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (role_id, module_id)
);

-- 4. role_change_log — Auditoría de cambios de rol
CREATE TABLE role_change_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  changed_by   UUID NOT NULL REFERENCES auth.users(id),
  old_role_id  UUID REFERENCES roles(id),
  new_role_id  UUID REFERENCES roles(id),
  reason       TEXT,
  changed_at   TIMESTAMPTZ DEFAULT now()
);
