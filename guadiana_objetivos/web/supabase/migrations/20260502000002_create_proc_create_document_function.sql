-- ============================================================================
-- Función SECURITY DEFINER para insertar documentos
-- Resuelve el problema de auth.uid() retornando NULL en Server Actions Next.js 15
-- ============================================================================

-- DROP POLICY existente
DROP POLICY IF EXISTS documents_insert_actual ON proc_documents;

-- Crear política que BLOQUEA INSERTs directos (solo permite vía función)
CREATE POLICY documents_insert_blocked ON proc_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- ============================================================================
-- Función SECURITY DEFINER proc_create_document
-- Esta función corre con privilegios elevados y puede acceder a auth.uid()
-- Acepta p_allowed_roles como TEXT[] y lo castea internamente a UUID[]
-- ============================================================================
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

-- Comentar la función
COMMENT ON FUNCTION proc_create_document IS 'Función SECURITY DEFINER para crear documentos. Acepta TEXT[] desde JS y lo castea a UUID[] internamente. Resuelve el problema de auth.uid() NULL en Server Actions Next.js 15';
