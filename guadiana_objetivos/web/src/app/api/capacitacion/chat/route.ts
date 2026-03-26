import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = (await req.json()) as { message?: unknown; history?: unknown }
  const { message, history } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  const aiUrl = process.env.PYTHON_AI_SERVICE_URL
  const aiKey = process.env.PYTHON_AI_SERVICE_API_KEY

  if (!aiUrl || !aiKey) {
    return NextResponse.json({ error: 'Servicio IA no configurado' }, { status: 503 })
  }

  try {
    const res = await fetch(`${aiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': aiKey,
      },
      body: JSON.stringify({
        message,
        history: Array.isArray(history) ? history : [],
        user_id: user.id,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Error del servicio IA' }, { status: 502 })
    }

    const data: unknown = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error al conectar con el servicio IA' }, { status: 502 })
  }
}
