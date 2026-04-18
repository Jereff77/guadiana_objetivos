ALTER TABLE org_departments
  ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
