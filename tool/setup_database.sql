-- Eliminar tablas anteriores si existen
DROP TABLE IF EXISTS inventory_movements;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS warehouses;

-- Crear tabla plana inventario
CREATE TABLE inventario (
  "Almacen"             text,
  "ProductId"           text,
  "Producto"            text,
  "Descripcion"         text,
  "Categoria"           text,
  "Subcategoria1"       text,
  "Linea"               text,
  "Sublinea"            text,
  "Marca"               text,
  "Modelo"              text,
  "Rango"               text,
  "Tipo"                text,
  "CostoEstandar"       numeric,
  "CostoPromedio"       numeric,
  "UltimoCosto"         numeric,
  "Existencia"          integer,
  "Por Surtir"          integer,
  "Orden Por Surtir"    integer,
  "Disponible"          integer,
  "Entrada"             integer,
  "Salida"              integer,
  "UMB"                 text,
  "ValorStock"          numeric,
  "StockMax"            integer,
  "StockMin"            integer,
  "StockReorden"        integer,
  "Inactivo"            boolean,
  "FechaUltimaCompra"   timestamp,
  "FechaUltimaVenta"    timestamp,
  "UPCCode"             text,
  "DiasSinCompra"       integer,
  "DiasSinVenta"        integer,
  "servidor_origen"     text,
  
  -- Clave primaria compuesta sugerida (o usar un ID autogenerado si se prefiere)
  PRIMARY KEY ("Almacen", "ProductId")
);

-- Índices para búsqueda rápida
CREATE INDEX idx_inventario_almacen ON inventario("Almacen");
CREATE INDEX idx_inventario_categoria ON inventario("Categoria");
CREATE INDEX idx_inventario_marca ON inventario("Marca");
-- Índice para búsqueda de texto (insensible a mayúsculas/minúsculas)
CREATE INDEX idx_inventario_descripcion_trgm ON inventario USING gin ("Descripcion" gin_trgm_ops);
