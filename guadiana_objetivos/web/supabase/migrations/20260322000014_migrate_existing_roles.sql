-- ============================================================
-- T-005: Migración de roles hardcodeados a sistema granular
-- ============================================================

-- Crear roles equivalentes a los hardcodeados actuales
INSERT INTO roles (name, description) VALUES
  ('Administrador',   'Acceso completo a todos los módulos excepto root'),
  ('Jefe de Área',    'Gestión de su área, revisión de entregables y resultados'),
  ('Auditor',         'Lectura y exportación de resultados y reportes'),
  ('Asesor',          'Acceso a sus objetivos y checklists asignados'),
  ('Operario',        'Acceso básico a sus checklists asignados');

-- Asignar TODOS los permisos al rol Administrador
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Administrador';

-- Asignar permisos al rol Jefe de Área
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Jefe de Área'
  AND pm.key IN (
    'formularios.view', 'formularios.create', 'formularios.edit', 'formularios.assign',
    'resultados.view', 'resultados.export',
    'objetivos.view', 'objetivos.manage', 'objetivos.review',
    'dashboard.view', 'dashboard.export',
    'incentivos.view',
    'mentoring.view', 'mentoring.manage',
    'capacitacion.view'
  );

-- Asignar permisos al rol Auditor
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Auditor'
  AND pm.key IN (
    'formularios.view',
    'resultados.view', 'resultados.export',
    'objetivos.view',
    'dashboard.view', 'dashboard.export',
    'incentivos.view',
    'capacitacion.view'
  );

-- Asignar permisos al rol Asesor
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Asesor'
  AND pm.key IN (
    'formularios.view',
    'resultados.view',
    'objetivos.view',
    'dashboard.view',
    'capacitacion.view'
  );

-- Asignar permisos al rol Operario
INSERT INTO role_permissions (role_id, module_id)
SELECT r.id, pm.id
FROM roles r, platform_modules pm
WHERE r.name = 'Operario'
  AND pm.key IN (
    'formularios.view',
    'capacitacion.view'
  );

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
