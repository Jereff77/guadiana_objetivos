import { SupabaseClient } from 'supabase'

/**
 * Detecta enlaces manuales [[Nombre Documento]] en el texto
 * @param text Texto del documento
 * @param supabase Cliente Supabase
 * @returns Array de document IDs encontrados
 */
export async function detectLinks(
  text: string,
  supabase: SupabaseClient
): Promise<string[]> {
  // Regex para encontrar [[Nombre Documento]]
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const matches = text.match(linkRegex)

  if (!matches) return []

  // Extraer los nombres de los enlaces (sin los corchetes)
  const linkNames = matches.map(match => match.replace(/[\[\]]/g, '').trim())

  // Buscar documentos por título (case insensitive)
  const uniqueNames = [...new Set(linkNames)]

  const { data: documents, error } = await supabase
    .from('proc_documents')
    .select('id')
    .in('title', uniqueNames)

  if (error) {
    console.error('Error detectando enlaces:', error)
    return []
  }

  return documents?.map(d => d.id) || []
}
