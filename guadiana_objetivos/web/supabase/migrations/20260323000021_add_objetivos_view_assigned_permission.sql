-- Agregar permiso para ver solo objetivos asignados al usuario
INSERT INTO platform_modules (key, label, module, sort_order)
VALUES (
  'objetivos.view.assigned',
  'Ver solo objetivos asignados',
  'Objetivos',
  53
) ON CONFLICT (key) DO NOTHING;
