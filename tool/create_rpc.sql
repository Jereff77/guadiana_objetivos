-- Función para obtener almacenes únicos
-- Ejecuta esto en el SQL Editor de Supabase

CREATE OR REPLACE FUNCTION get_unique_warehouses()
RETURNS TABLE ("Almacen" text)
LANGUAGE sql
AS $$
  SELECT DISTINCT "Almacen"
  FROM inventario
  WHERE "Almacen" IS NOT NULL
  ORDER BY "Almacen";
$$;
