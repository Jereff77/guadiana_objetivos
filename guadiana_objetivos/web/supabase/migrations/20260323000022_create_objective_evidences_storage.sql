-- Crear bucket de Storage para evidencias de objetivos
INSERT INTO storage.buckets (id, name, public)
VALUES ('objective-evidences', 'Evidencias de objetivos', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para el bucket
-- Solo usuarios autenticados pueden subir
CREATE POLICY "Auth users can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'objective-evidences');

-- Solo usuarios autenticados pueden leer
CREATE POLICY "Auth users can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'objective-evidences');
