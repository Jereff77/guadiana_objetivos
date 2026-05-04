-- ============================================================
-- Fase 1: Schema BD - Módulo M8: Repositorio de Procesos
-- Tablas: proc_categories, proc_documents, proc_document_relations,
--          proc_document_chunks, proc_chat_sessions, proc_chat_messages
-- ============================================================

-- 1. Habilitar extensión pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla proc_categories - Categorías de documentos
CREATE TABLE proc_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  color_hex   TEXT NOT NULL DEFAULT '#6366f1',
  icon        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla proc_documents - Documentos principales
CREATE TABLE proc_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  description         TEXT,
  storage_path        TEXT NOT NULL,
  file_type           TEXT NOT NULL CHECK (file_type IN ('txt', 'md')),
  file_size           INTEGER,
  category_id         UUID REFERENCES proc_categories(id) ON DELETE SET NULL,
  uploaded_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  access_type         TEXT NOT NULL DEFAULT 'public' CHECK (access_type IN ('public', 'private', 'roles')),
  allowed_roles       UUID[] DEFAULT '{}',
  processing_status   TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  processing_error    TEXT,
  word_count          INTEGER,
  tags                TEXT[] DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla proc_document_relations - Relaciones entre documentos
CREATE TABLE proc_document_relations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_doc_id     UUID NOT NULL REFERENCES proc_documents(id) ON DELETE CASCADE,
  target_doc_id     UUID NOT NULL REFERENCES proc_documents(id) ON DELETE CASCADE,
  relation_type     TEXT NOT NULL CHECK (relation_type IN ('manual', 'automatic')),
  similarity_score  NUMERIC(5,4),
  created_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (source_doc_id, target_doc_id)
);

-- 5. Tabla proc_document_chunks - Fragmentos vectorizados
CREATE TABLE proc_document_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES proc_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(768),
  token_count INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla proc_chat_sessions - Sesiones de chat
CREATE TABLE proc_chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla proc_chat_messages - Mensajes de chat
CREATE TABLE proc_chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES proc_chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  sources     JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 8. Índices para rendimiento
CREATE INDEX idx_proc_documents_category ON proc_documents(category_id);
CREATE INDEX idx_proc_documents_uploaded_by ON proc_documents(uploaded_by);
CREATE INDEX idx_proc_documents_access_type ON proc_documents(access_type);
CREATE INDEX idx_proc_documents_status ON proc_documents(processing_status);
CREATE INDEX idx_proc_chunks_document ON proc_document_chunks(document_id);
CREATE INDEX idx_proc_chunks_embedding ON proc_document_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX idx_proc_chat_sessions_user ON proc_chat_sessions(user_id);
CREATE INDEX idx_proc_chat_messages_session ON proc_chat_messages(session_id);

-- 9. Funciones auxiliares con SET search_path (para contexto RLS)
CREATE OR REPLACE FUNCTION is_root()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.is_root = true
  );
$$;

CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  IF (SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() AND r.is_root = true
  )) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.platform_modules pm ON rp.module_id = pm.id
    JOIN public.profiles p ON p.role_id = rp.role_id
    WHERE p.id = auth.uid()
    AND pm.key = permission_key
    AND pm.is_active = true
  );
END;
$$;

-- 10. Función SECURITY DEFINER para control de acceso a documentos
CREATE OR REPLACE FUNCTION proc_user_can_access_document(doc_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  doc proc_documents%ROWTYPE;
  user_role_id UUID;
BEGIN
  SELECT * INTO doc FROM proc_documents WHERE id = doc_id;
  IF NOT FOUND THEN RETURN false; END IF;

  IF doc.access_type = 'public' THEN RETURN true; END IF;

  IF doc.access_type = 'private' THEN
    RETURN doc.uploaded_by = auth.uid() OR is_root();
  END IF;

  IF doc.access_type = 'roles' THEN
    SELECT role_id INTO user_role_id FROM profiles WHERE id = auth.uid();
    RETURN user_role_id = ANY(doc.allowed_roles) OR is_root();
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 11. Función SECURITY DEFINER proc_create_document
-- Acepta TEXT[] desde JavaScript y lo castea a UUID[] internamente
-- Resuelve el problema de auth.uid() retornando NULL en Server Actions Next.js 15
DROP FUNCTION IF EXISTS public.proc_create_document CASCADE;

CREATE OR REPLACE FUNCTION proc_create_document(
  p_title TEXT,
  p_description TEXT,
  p_storage_path TEXT,
  p_file_type TEXT,
  p_file_size INTEGER,
  p_category_id UUID,
  p_access_type TEXT,
  p_allowed_roles TEXT[],
  p_tags TEXT[]
)
RETURNS proc_documents AS $$
DECLARE
  current_user_id UUID;
  is_user_root BOOLEAN;
  has_upload_perm BOOLEAN;
  new_doc proc_documents;
  v_allowed_roles UUID[];
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No autenticado';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.id = p.role_id
    WHERE p.id = current_user_id AND r.is_root = true
  ) INTO is_user_root;

  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.platform_modules pm ON rp.module_id = pm.id
    JOIN public.profiles p ON p.role_id = rp.role_id
    WHERE p.id = current_user_id
    AND pm.key = 'documentos.upload'
    AND pm.is_active = true
  ) INTO has_upload_perm;

  IF NOT is_user_root AND NOT has_upload_perm THEN
    RAISE EXCEPTION 'No tienes permiso para subir documentos';
  END IF;

  IF p_access_type NOT IN ('public', 'private', 'roles') THEN
    RAISE EXCEPTION 'access_type inválido: %', p_access_type;
  END IF;

  -- Castear text[] a uuid[] explícitamente
  IF p_allowed_roles IS NULL OR array_length(p_allowed_roles, 1) IS NULL THEN
    v_allowed_roles := '{}'::UUID[];
  ELSE
    v_allowed_roles := p_allowed_roles::UUID[];
  END IF;

  INSERT INTO public.proc_documents (
    title,
    description,
    storage_path,
    file_type,
    file_size,
    category_id,
    uploaded_by,
    access_type,
    allowed_roles,
    tags,
    processing_status
  ) VALUES (
    p_title,
    p_description,
    p_storage_path,
    p_file_type,
    p_file_size,
    p_category_id,
    current_user_id,
    p_access_type,
    v_allowed_roles,
    COALESCE(p_tags, '{}'::TEXT[]),
    'pending'
  )
  RETURNING * INTO new_doc;

  RETURN new_doc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION proc_create_document TO authenticated;

-- 12. RLS - Row Level Security
ALTER TABLE proc_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_view" ON proc_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "categories_manage" ON proc_categories
  FOR ALL USING (has_permission('documentos.manage') OR is_root());

ALTER TABLE proc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_select" ON proc_documents
  FOR SELECT TO authenticated
  USING (
    -- Documentos públicos: cualquier autenticado los ve
    access_type = 'public'
    -- Documentos privados: solo el dueño
    OR (access_type = 'private' AND uploaded_by = auth.uid())
    -- Documentos por roles: el usuario tiene un rol permitido
    OR (
      access_type = 'roles'
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role_id = ANY(allowed_roles)
      )
    )
    -- Root ve todo
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid() AND r.is_root = true
    )
  );
-- Bloquear INSERTs directos, solo permitir vía función proc_create_document
CREATE POLICY "documents_insert_blocked" ON proc_documents
  FOR INSERT TO authenticated
  WITH CHECK (false);
CREATE POLICY "documents_update" ON proc_documents
  FOR UPDATE USING (uploaded_by = auth.uid() OR has_permission('documentos.manage') OR is_root());
CREATE POLICY "documents_delete" ON proc_documents
  FOR DELETE USING (uploaded_by = auth.uid() OR has_permission('documentos.manage') OR is_root());

ALTER TABLE proc_document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chunks_select" ON proc_document_chunks
  FOR SELECT USING (proc_user_can_access_document(document_id));
CREATE POLICY "chunks_manage" ON proc_document_chunks
  FOR ALL USING (has_permission('documentos.manage') OR is_root());

ALTER TABLE proc_document_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "relations_select" ON proc_document_relations
  FOR SELECT USING (proc_user_can_access_document(source_doc_id));
CREATE POLICY "relations_manage" ON proc_document_relations
  FOR ALL USING (has_permission('documentos.upload') OR is_root());

ALTER TABLE proc_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_all" ON proc_chat_sessions
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE proc_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_own" ON proc_chat_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM proc_chat_sessions WHERE id = session_id AND user_id = auth.uid()
  ));
CREATE POLICY "messages_insert_own" ON proc_chat_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM proc_chat_sessions WHERE id = session_id AND user_id = auth.uid()
  ));

-- 13. Storage bucket policies para process-documents
-- Insert bucket (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'process-documents',
  'process-documents',
  false,
  10485760, -- 10MB
  ARRAY['text/plain', 'text/markdown', 'application/octet-stream']
)
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas RLS para storage.objects
CREATE POLICY "process_documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'process-documents' AND
    auth.uid() IS NOT NULL AND
    (auth.role() = 'authenticated')
  );

CREATE POLICY "process_documents_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'process-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "process_documents_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'process-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "process_documents_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'process-documents' AND
    auth.uid() IS NOT NULL
  );

-- 14. Insertar permisos en platform_modules
INSERT INTO platform_modules (key, label, module, sort_order, is_active)
VALUES
  ('documentos.view', 'Ver repositorio de documentos', 'Documentos', 80, true),
  ('documentos.upload', 'Subir documentos', 'Documentos', 81, true),
  ('documentos.manage', 'Gestionar repositorio completo', 'Documentos', 82, true),
  ('documentos.chat', 'Usar chat de documentos', 'Documentos', 83, true)
ON CONFLICT (key) DO NOTHING;
