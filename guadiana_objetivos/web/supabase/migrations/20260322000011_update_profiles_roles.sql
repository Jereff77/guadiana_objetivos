-- ============================================================
-- T-002: Actualizar tabla profiles para M0
-- Agregar: role_id, phone, whatsapp, avatar_url, last_seen
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN role_id    UUID REFERENCES roles(id),
  ADD COLUMN phone      TEXT,
  ADD COLUMN whatsapp   TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN last_seen  TIMESTAMPTZ;

-- Validación formato WhatsApp E.164: +[1-9] seguido de 7-14 dígitos
ALTER TABLE profiles
  ADD CONSTRAINT profiles_whatsapp_e164
  CHECK (whatsapp IS NULL OR whatsapp ~ '^\+[1-9]\d{7,14}$');

-- Índice para búsquedas por rol
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
