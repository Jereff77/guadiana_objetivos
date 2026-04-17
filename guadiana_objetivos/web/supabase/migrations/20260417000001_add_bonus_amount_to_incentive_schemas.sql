-- Agrega bonus_amount a incentive_schemas
-- base_amount = sueldo base del empleado (informativo)
-- bonus_amount = monto máximo del bono al 100% de cumplimiento
-- Formula: calculated_amount = bonus_amount * (tier.bonus_pct / 100)

ALTER TABLE incentive_schemas
  ADD COLUMN bonus_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
