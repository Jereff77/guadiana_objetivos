// ============================================================================
// Edge Function: execute-scheduled-tasks
// Ejecuta las tareas programadas de IA cuyo next_run_at ya venció.
// Se dispara via pg_cron cada minuto o puede llamarse manualmente.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL           = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ── Tipos mínimos ─────────────────────────────────────────────────────────

interface ScheduledTask {
  id: string
  user_id: string
  title: string
  prompt: string
  cron_expression: string
  timezone: string
  profiles: { email: string; full_name: string } | null
}

interface AISettings {
  ai_provider?: string
  anthropic_api_key?: string
  google_api_key?: string
  email_resend_api_key?: string
  email_from_name?: string
  email_from_address?: string
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Calcula el próximo timestamp para una expresión cron dada.
 */
function calculateNextRun(cronExpr: string, timezone: string): string {
  const parts = cronExpr.trim().split(/\s+/)
  if (parts.length !== 5) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString()
  }

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts
  const now = new Date()

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
  const p = formatter.formatToParts(now)
  const localYear  = parseInt(p.find(x => x.type === 'year')!.value)
  const localMonth = parseInt(p.find(x => x.type === 'month')!.value)
  const localDay   = parseInt(p.find(x => x.type === 'day')!.value)

  const targetHour   = hour   === '*' ? new Date().getHours()   : parseInt(hour)
  const targetMinute = minute === '*' ? new Date().getMinutes() : parseInt(minute)

  const candidate = new Date(
    `${localYear}-${String(localMonth).padStart(2, '0')}-${String(localDay).padStart(2, '0')}` +
    `T${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}:00`
  )
  const utcOffset = now.getTime() - new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime()
  let nextRun = new Date(candidate.getTime() + utcOffset)

  if (nextRun <= now) {
    if (dayOfWeek !== '*') {
      nextRun = new Date(nextRun.getTime() + 7 * 24 * 60 * 60 * 1000)
    } else if (dayOfMonth !== '*') {
      nextRun.setMonth(nextRun.getMonth() + 1)
    } else if (hour === '*') {
      nextRun = new Date(nextRun.getTime() + 60 * 60 * 1000)
    } else {
      nextRun = new Date(nextRun.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  return nextRun.toISOString()
}

/**
 * Llama a la IA (Anthropic o Google) con el prompt de la tarea.
 */
async function callAI(
  prompt: string,
  settings: AISettings
): Promise<{ content: string; tokens: number }> {
  const providerSetting = settings.ai_provider || 'auto'
  const isGoogle = providerSetting.startsWith('google')

  if (isGoogle && settings.google_api_key) {
    const model = providerSetting.includes('/') ? providerSetting.split('/')[1] : 'gemini-2.0-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.google_api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000 },
        }),
      }
    )
    if (!response.ok) throw new Error(`Gemini error: ${response.status}`)
    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const tokens = (data.usageMetadata?.totalTokenCount as number) || 0
    return { content, tokens }
  }

  // Anthropic (default)
  const apiKey = settings.anthropic_api_key || Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) throw new Error('No hay API key de Anthropic configurada')

  const model = (providerSetting.includes('/') && !isGoogle)
    ? providerSetting.split('/')[1]
    : 'claude-3-haiku-20240307'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`)
  const data = await response.json()
  const content = data.content?.[0]?.text || ''
  const tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
  return { content, tokens }
}

/**
 * Envía el resultado por email via Resend.
 */
async function sendEmail(params: {
  apiKey: string
  from: string
  to: string
  subject: string
  content: string
}): Promise<boolean> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #004B8D; border-bottom: 2px solid #004B8D; padding-bottom: 8px;">
            ${params.subject}
          </h2>
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
            ${params.content.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;" />
          <p style="color: #999; font-size: 12px;">
            Generado automáticamente por GUADIANA · Plataforma de Gestión de Objetivos
          </p>
        </div>
      `,
    }),
  })
  return response.ok
}

// ── Handler principal ─────────────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
  const now = new Date().toISOString()

  // 1. Obtener tareas vencidas
  const { data: tasks, error: tasksError } = await supabase
    .from('ai_scheduled_tasks')
    .select('*, profiles(email, full_name)')
    .lte('next_run_at', now)
    .eq('is_active', true)
    .limit(20)

  if (tasksError) {
    console.error('[scheduler] Error fetching tasks:', tasksError)
    return new Response('error', { status: 500 })
  }

  if (!tasks || tasks.length === 0) {
    return new Response('ok', { status: 200 })
  }

  console.log(`[scheduler] ${tasks.length} tarea(s) para ejecutar`)

  // 2. Obtener configuración global
  const { data: rawSettings } = await supabase
    .from('ai_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['ai_provider', 'anthropic_api_key', 'google_api_key', 'email_resend_api_key', 'email_from_name', 'email_from_address'])
    .is('department_id', null)

  const settings: AISettings = {}
  for (const s of rawSettings || []) {
    (settings as Record<string, string>)[
      s.setting_key === 'ai_provider'          ? 'ai_provider'          :
      s.setting_key === 'anthropic_api_key'    ? 'anthropic_api_key'    :
      s.setting_key === 'google_api_key'       ? 'google_api_key'       :
      s.setting_key === 'email_resend_api_key' ? 'email_resend_api_key' :
      s.setting_key === 'email_from_name'      ? 'email_from_name'      :
      s.setting_key === 'email_from_address'   ? 'email_from_address'   :
      s.setting_key
    ] = s.setting_value
  }

  // 3. Ejecutar cada tarea
  for (const task of tasks as ScheduledTask[]) {
    console.log(`[scheduler] Ejecutando tarea: ${task.title}`)

    // Marcar como running
    await supabase
      .from('ai_scheduled_tasks')
      .update({ last_status: 'running', last_run_at: now })
      .eq('id', task.id)

    // Crear registro de ejecución
    const { data: execution } = await supabase
      .from('ai_task_executions')
      .insert({ task_id: task.id, status: 'running' })
      .select('id')
      .single()

    const execId = execution?.id

    try {
      // Llamar a IA
      const aiResult = await callAI(task.prompt, settings)

      // Enviar email
      let emailSent = false
      const userEmail = task.profiles?.email
      if (userEmail && settings.email_resend_api_key && settings.email_from_address) {
        const fromLine = `${settings.email_from_name || 'Plataforma Guadiana'} <${settings.email_from_address}>`
        emailSent = await sendEmail({
          apiKey: settings.email_resend_api_key,
          from:    fromLine,
          to:      userEmail,
          subject: task.title,
          content: aiResult.content,
        })
      }

      // Guardar resultado exitoso
      const emailAt = emailSent ? new Date().toISOString() : null
      if (execId) {
        await supabase
          .from('ai_task_executions')
          .update({
            status:         'success',
            finished_at:    new Date().toISOString(),
            result_content: aiResult.content,
            tokens_used:    aiResult.tokens,
            email_sent_to:  emailSent ? (task.profiles?.email ?? null) : null,
            email_sent_at:  emailAt,
          })
          .eq('id', execId)
      }

      // Actualizar tarea con próxima ejecución
      const nextRun = calculateNextRun(task.cron_expression, task.timezone)
      await supabase
        .from('ai_scheduled_tasks')
        .update({ last_status: 'success', next_run_at: nextRun })
        .eq('id', task.id)

      console.log(`[scheduler] ✓ Tarea "${task.title}" completada. Próxima: ${nextRun}`)

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error(`[scheduler] ✗ Error en tarea "${task.title}":`, errorMsg)

      if (execId) {
        await supabase
          .from('ai_task_executions')
          .update({
            status:        'error',
            finished_at:   new Date().toISOString(),
            error_message: errorMsg,
          })
          .eq('id', execId)
      }

      const nextRun = calculateNextRun(task.cron_expression, task.timezone)
      await supabase
        .from('ai_scheduled_tasks')
        .update({ last_status: 'error', next_run_at: nextRun })
        .eq('id', task.id)
    }
  }

  return new Response('ok', { status: 200 })
})
