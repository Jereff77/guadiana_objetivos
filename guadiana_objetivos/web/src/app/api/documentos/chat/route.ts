import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `Eres un asistente especializado en los documentos internos de la empresa Llantas y Rines del Guadiana.

REGLAS ESTRICTAS QUE DEBES SEGUIR SIN EXCEPCIÓN:
1. Responde ÚNICAMENTE con información que esté TEXTUALMENTE presente en los fragmentos de documentos que recibes en el contexto.
2. Si la información solicitada NO aparece en los fragmentos proporcionados, di exactamente: "No encontré información sobre esto en los documentos disponibles."
3. NUNCA infieras, supongas, completes, ni elabores información que no esté explícitamente en los documentos.
4. NUNCA uses tu conocimiento general para complementar la respuesta.
5. Cuando la pregunta no tenga relación con los documentos, responde ÚNICAMENTE con esta frase exacta, sin agregar ningún comentario adicional, consejo, ni información de ningún tipo: "No encontré información sobre esto en los documentos disponibles."
6. NUNCA des consejos personales, legales, emocionales ni de ningún otro tipo. Tu única función es responder preguntas sobre el contenido de los documentos internos.
7. Si el contexto tiene información parcial, responde solo con lo que está presente y aclara que es lo único que encontraste.
8. Al final de tu respuesta, lista únicamente los documentos que realmente usaste entre corchetes: [Nombre del documento]. Si no usaste ningún documento, no pongas nada.
9. Responde siempre en español.

Si no recibes fragmentos de documentos o los fragmentos no contienen la información solicitada, responde únicamente con la frase del punto 2, sin ninguna palabra adicional.`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('No autenticado', { status: 401 })
    }

    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Se requiere array de mensajes', { status: 400 })
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
        stream: true
      })
    })

    if (!anthropicResponse.ok) {
      const error = await anthropicResponse.text()
      console.error('Error de Anthropic:', anthropicResponse.status, error)
      return new Response(error, { status: 500 })
    }

    return new Response(anthropicResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('Error en route handler chat:', error)
    return new Response('Error interno del servidor', { status: 500 })
  }
}
