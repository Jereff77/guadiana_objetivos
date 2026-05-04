/**
 * Extrae texto de un archivo buffer y lo sanitiza
 * @param buffer Buffer del archivo (ArrayBuffer)
 * @returns Texto limpio en UTF-8
 */
export function extractText(buffer: ArrayBuffer): string {
  // Decodificar como UTF-8
  const decoder = new TextDecoder('utf-8', { fatal: false })
  let text = decoder.decode(buffer)

  // Sanitizar caracteres no imprimibles (menos saltos de línea y tabs)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Normalizar saltos de línea a \n
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Eliminar espacios excesivos
  text = text.replace(/[ \t]+/g, ' ').replace(/ +\n/g, '\n')

  return text.trim()
}
