-- Función para búsqueda vectorial de chunks relevantes
-- Usa pgvector cosine distance (<=>)
-- Hace JOIN con proc_documents para retornar el título del documento
-- SECURITY DEFINER para que la búsqueda no esté limitada por RLS del usuario

DROP FUNCTION IF EXISTS proc_match_chunks(vector, UUID, INTEGER, FLOAT);

CREATE OR REPLACE FUNCTION proc_match_chunks(
  p_embedding vector(768),
  p_exclude_document_id UUID,
  p_match_count INTEGER DEFAULT 5,
  p_min_similarity FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS chunk_id,
    c.document_id,
    d.title AS document_title,
    c.content,
    1 - (c.embedding <=> p_embedding) AS similarity
  FROM proc_document_chunks c
  JOIN proc_documents d ON d.id = c.document_id
  WHERE c.document_id != p_exclude_document_id
  AND c.embedding IS NOT NULL
  AND 1 - (c.embedding <=> p_embedding) > p_min_similarity
  ORDER BY c.embedding <=> p_embedding ASC
  LIMIT p_match_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION proc_match_chunks TO authenticated, service_role;
