'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const result = await requestPasswordReset(new FormData(e.currentTarget))
    setPending(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white font-bold text-xl mb-3"
            style={{ backgroundColor: '#004B8D' }}
          >
            G
          </div>
          <h1 className="text-xl font-bold text-gray-900">Guadiana Checklists</h1>
          <p className="text-sm text-gray-500 mt-1">Llantas y Rines del Guadiana</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar contraseña</CardTitle>
            <CardDescription>
              {sent
                ? 'Revisa tu bandeja de entrada'
                : 'Te enviaremos un enlace para restablecer tu contraseña'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-sm text-center text-gray-600">
                  Si el correo está registrado, recibirás un enlace para restablecer tu contraseña
                  en los próximos minutos. Revisa también tu carpeta de spam.
                </p>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      required
                      autoComplete="email"
                      className="pl-9"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ backgroundColor: '#004B8D' }}
                  disabled={pending}
                >
                  {pending ? 'Enviando…' : 'Enviar enlace de recuperación'}
                </Button>

                <Link href="/login">
                  <Button variant="ghost" className="w-full text-gray-500">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
