'use client'

import { useState, useTransition } from 'react'
import {
  updateAiPrompt,
  createAiPrompt,
  type AiPrompt,
} from '@/app/(dashboard)/ia-verificacion/ia-actions'

const CONTEXT_LABELS: Record<string, string> = {
  verification: 'Verificación de objetivos',
  lms_chat: 'Chat LMS',
}

interface PromptEditorProps {
  prompts: AiPrompt[]
  canConfigure: boolean
}

export function PromptEditor({ prompts, canConfigure }: PromptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Estado del formulario de edición
  const [editName, setEditName] = useState('')
  const [editPrompt, setEditPrompt] = useState('')

  // Estado del formulario de creación
  const [newName, setNewName] = useState('')
  const [newContext, setNewContext] = useState<'verification' | 'lms_chat'>('verification')
  const [newPrompt, setNewPrompt] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)

  function startEdit(p: AiPrompt) {
    setEditingId(p.id)
    setEditName(p.name)
    setEditPrompt(p.system_prompt)
    setErrors({})
  }

  function handleUpdate(id: string) {
    setErrors({})
    startTransition(async () => {
      const result = await updateAiPrompt(id, { name: editName.trim(), system_prompt: editPrompt.trim() })
      if (!result.success) {
        setErrors((prev) => ({ ...prev, [id]: result.error ?? 'Error al actualizar.' }))
      } else {
        setEditingId(null)
      }
    })
  }

  function handleToggleActive(id: string, current: boolean) {
    startTransition(async () => {
      await updateAiPrompt(id, { is_active: !current })
    })
  }

  function handleCreate() {
    setCreateError(null)
    if (!newName.trim() || !newPrompt.trim()) {
      setCreateError('Nombre y prompt son requeridos.')
      return
    }
    startTransition(async () => {
      const result = await createAiPrompt({ name: newName.trim(), context: newContext, system_prompt: newPrompt.trim() })
      if (!result.success) {
        setCreateError(result.error ?? 'Error al crear.')
      } else {
        setShowCreate(false)
        setNewName('')
        setNewPrompt('')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Lista de prompts */}
      {prompts.map((p) => (
        <div key={p.id} className="rounded-lg border bg-card p-4">
          {editingId === p.id ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm mt-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prompt del sistema</label>
                <textarea
                  rows={12}
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm font-mono mt-1 resize-y"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                />
              </div>
              {errors[p.id] && <p className="text-xs text-red-600">{errors[p.id]}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(p.id)}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-xs px-3 py-1.5 rounded border hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {CONTEXT_LABELS[p.context] ?? p.context}
                    {' · '}
                    Actualizado: {new Date(p.updated_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${p.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  {canConfigure && (
                    <>
                      <button
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                        disabled={isPending}
                        className="text-xs px-2 py-1 rounded border hover:bg-muted disabled:opacity-50"
                      >
                        {p.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        className="text-xs px-2 py-1 rounded border hover:bg-muted"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <pre className="text-xs text-muted-foreground bg-muted/40 rounded p-2 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {p.system_prompt.slice(0, 300)}{p.system_prompt.length > 300 ? '…' : ''}
              </pre>
            </div>
          )}
        </div>
      ))}

      {/* Crear nuevo prompt */}
      {canConfigure && (
        <div>
          {showCreate ? (
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <h3 className="font-semibold text-sm">Nuevo prompt</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                  <input
                    type="text"
                    className="w-full rounded border bg-background px-2 py-1.5 text-sm mt-1"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej: Verificación de ventas"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Contexto</label>
                  <select
                    className="w-full rounded border bg-background px-2 py-1.5 text-sm mt-1"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value as 'verification' | 'lms_chat')}
                  >
                    <option value="verification">Verificación de objetivos</option>
                    <option value="lms_chat">Chat LMS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prompt del sistema</label>
                <textarea
                  rows={10}
                  className="w-full rounded border bg-background px-2 py-1.5 text-sm font-mono mt-1 resize-y"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="Escribe aquí el prompt del sistema..."
                />
              </div>
              {createError && <p className="text-xs text-red-600">{createError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isPending ? 'Creando...' : 'Crear prompt'}
                </button>
                <button onClick={() => setShowCreate(false)} className="text-xs px-3 py-1.5 rounded border hover:bg-muted">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm text-primary hover:underline"
            >
              + Agregar nuevo prompt
            </button>
          )}
        </div>
      )}
    </div>
  )
}
