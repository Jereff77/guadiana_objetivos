/**
 * T-501: Prueba de integración – Supabase client
 *
 * Verifica que el cliente de Supabase se inicializa correctamente
 * con las variables de entorno y expone los métodos necesarios.
 */

// Supabase SSR depends on cookies in server context; mock for unit scope
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
  })),
}))

// Provide env vars before importing the module under test
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

import { createClient } from '../supabase/client'
import { createBrowserClient } from '@supabase/ssr'

describe('Supabase browser client', () => {
  it('calls createBrowserClient with env vars', () => {
    createClient()
    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
  })

  it('returns an object with auth and from properties', () => {
    const client = createClient()
    expect(client).toHaveProperty('auth')
    expect(client).toHaveProperty('from')
  })

  it('auth.getUser resolves without throwing', async () => {
    const client = createClient()
    const result = await client.auth.getUser()
    expect(result).toHaveProperty('data')
    expect(result.data).toHaveProperty('user')
  })

  it('from() returns a query builder with select method', () => {
    const client = createClient()
    const qb = client.from('form_surveys')
    expect(qb).toHaveProperty('select')
  })
})
