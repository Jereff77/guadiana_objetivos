'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Hook de auto-guardado con debounce.
 * Llama a `saveFn` después de `delay` ms sin que cambien los `deps`.
 * Expone el estado del guardado para mostrarlo en la UI.
 */
export function useAutoSave<T>(
  saveFn: (value: T) => Promise<void>,
  value: T,
  delay = 1000
): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    // No guardar en el primer render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')

    timerRef.current = setTimeout(async () => {
      try {
        await saveFn(value)
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } catch {
        setStatus('error')
      }
    }, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay])

  return status
}

/**
 * Hook de estado de guardado global para el editor.
 * Permite que componentes hijos notifiquen cuando comienzan/terminan de guardar.
 */
export function useEditorSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const pendingRef = useRef(0)

  const onSaveStart = useCallback(() => {
    pendingRef.current += 1
    setStatus('saving')
  }, [])

  const onSaveEnd = useCallback((success: boolean) => {
    pendingRef.current = Math.max(0, pendingRef.current - 1)
    if (pendingRef.current === 0) {
      setStatus(success ? 'saved' : 'error')
      if (success) setTimeout(() => setStatus('idle'), 2000)
    }
  }, [])

  return { status, onSaveStart, onSaveEnd }
}
