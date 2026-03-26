-- ── Permiso para gestión de departamentos ────────────────────────────────────
-- Agrega el permiso departamentos.manage a platform_modules.
-- El módulo Departamentos permite crear, editar y desactivar departamentos
-- independientemente del permiso objetivos.manage.

INSERT INTO platform_modules (key, label, module, sort_order)
VALUES
  ('departamentos.manage', 'Crear / editar / eliminar departamentos', 'Departamentos', 55)
ON CONFLICT (key) DO NOTHING;
