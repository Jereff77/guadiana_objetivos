INSERT INTO platform_modules (key, label, module, sort_order)
VALUES
  ('capacitacion.edit',   'Editar contenidos LMS',   'Capacitación', 102),
  ('capacitacion.delete', 'Eliminar contenidos LMS',  'Capacitación', 103)
ON CONFLICT (key) DO NOTHING;
