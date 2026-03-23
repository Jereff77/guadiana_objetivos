-- Permisos para el módulo Asignaciones (faltan en platform_modules)
INSERT INTO platform_modules (key, label, module, sort_order)
VALUES
  ('asignaciones.view',   'Ver asignaciones de formularios',    'Asignaciones', 35),
  ('asignaciones.manage', 'Crear / editar / eliminar asignaciones', 'Asignaciones', 36)
ON CONFLICT (key) DO NOTHING;
