# Autenticación y Estado - Guadiana Objetivos

**Última actualización**: 2026-05-02

## Flujo de Autenticación Completo

### 1. Registro de Usuario

**Endpoint**: `POST /auth/v1/signup` (Supabase Auth)

**Frontend**: No implementado (solo admin puede crear usuarios)

**Backend**: Server Action `createUser()` en `user-actions.ts`
```typescript
'use server'

export async function createUser(formData: CreateUserFormData) {
  const supabase = await createClient()
  await requirePermission('users.edit')

  // 1. Crear usuario en auth.users (via admin client)
  const { data: authUser, error } = await adminClient.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true
  })

  // 2. Trigger handle_new_user() crea profile automáticamente
  // 3. Opcional: asignar rol por defecto
}
```

**Trigger**: `handle_new_user()` en Supabase
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    (SELECT id FROM roles WHERE name = 'Operario' LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 2. Inicio de Sesión

**Ruta**: `/login`

**Frontend**: Formulario nativo HTML (no React form)
```tsx
<form action="/auth/sign-in" method="post">
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Iniciar sesión</button>
</form>
```

**Server Action**: `/auth/sign-in`
```typescript
'use server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/inicio')
}
```

**Middleware**: Verifica autenticación en cada request
```typescript
// src/middleware.ts
const { data: { user } } = await supabase.auth.getUser()

if (!user && !isPublicRoute) {
  return NextResponse.redirect(`/login?redirectTo=${pathname}`)
}
```

---

### 3. Cierre de Sesión

**Server Action**: `/auth/sign-out`
```typescript
'use server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

---

### 4. Recuperación de Contraseña

**Ruta**: `/forgot-password`

**Frontend**: Formulario con email
```tsx
<form action={resetPassword}>
  <input name="email" type="email" required />
  <button>Enviar instrucciones</button>
</form>
```

**Server Action**: `resetPassword()`
```typescript
'use server'

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`
  })

  if (error) {
    return redirect(`/forgot-password?error=${error.message}`)
  }

  redirect('/forgot-password?sent=true')
}
```

**Callback**: `/auth/callback`
```typescript
'use server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return Response.redirect(new URL('/inicio', requestUrl))
}
```

---

## Sistema de Permisos Granular

### Arquitectura de Permisos

```
Usuario (auth.users)
  ↓ 1:1
Perfil (profiles.role_id)
  ↓ N:1
Rol (roles)
  ↓ N:N
Permisos (role_permissions ← platform_modules)
```

### Funciones SQL

#### `has_permission(key)`
Verifica si usuario tiene permiso específico.

```sql
CREATE OR REPLACE FUNCTION has_permission(permission_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_root() THEN RETURN true; END IF;

  RETURN EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN platform_modules pm ON rp.module_id = pm.id
    JOIN profiles p ON p.role_id = rp.role_id
    WHERE p.id = auth.uid()
    AND pm.key = permission_key
    AND pm.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### `is_root()`
Verifica si usuario es superadmin.

```sql
CREATE OR REPLACE FUNCTION is_root()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid()
    AND r.is_root = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Helpers TypeScript

#### `checkPermission(key)`
```typescript
export async function checkPermission(key: string): Promise<boolean> {
  const preview = await getPreviewPermissions()
  if (preview !== null) return preview.includes(key)

  const supabase = await createClient()
  const { data } = await supabase.rpc('has_permission', { permission_key: key })
  return data === true
}
```

#### `requirePermission(key)`
```typescript
export async function requirePermission(key: string): Promise<void> {
  if (!(await checkPermission(key))) {
    redirect('/sin-acceso')
  }
}
```

#### `requireRoot()`
```typescript
export async function requireRoot(): Promise<void> {
  if (!(await checkIsRoot())) {
    redirect('/sin-acceso')
  }
}
```

#### `getUserPermissions()`
```typescript
export async function getUserPermissions(): Promise<string[]> {
  const preview = await getPreviewPermissions()
  if (preview !== null) return preview

  const supabase = await createClient()
  const isRoot = await checkIsRoot()

  if (isRoot) {
    const { data: modules } = await supabase
      .from('platform_modules')
      .select('key')
      .eq('is_active', true)
    return modules.map(m => m.key)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .single()

  if (!profile?.role_id) return []

  const { data: perms } = await supabase
    .from('role_permissions')
    .select('platform_modules(key)')
    .eq('role_id', profile.role_id)

  return perms.map(p => p.platform_modules.key)
}
```

---

## Vista Previa de Rol

### Cookie de Preview
```typescript
// preview-actions.ts
'use server'

export async function startRolePreview(roleId: string) {
  const cookieStore = await cookies()
  cookieStore.set('guadiana_preview_role', roleId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 días
  })
}

export async function stopRolePreview() {
  const cookieStore = await cookies()
  cookieStore.delete('guadiana_preview_role')
}
```

### Intercepción de Permisos
```typescript
// permissions.ts
async function getPreviewPermissions(): Promise<string[] | null> {
  const cookieStore = await cookies()
  const previewRoleId = cookieStore.get('guadiana_preview_role')?.value
  if (!previewRoleId) return null

  const supabase = await createClient()

  // Si el rol de preview es root, dar todos los permisos
  const { data: role } = await supabase
    .from('roles')
    .select('is_root')
    .eq('id', previewRoleId)
    .single()

  if (role?.is_root) {
    const { data: modules } = await supabase
      .from('platform_modules')
      .select('key')
      .eq('is_active', true)
    return modules.map(m => m.key)
  }

  // De lo contrario, retornar permisos del rol
  const { data: perms } = await supabase
    .from('role_permissions')
    .select('platform_modules(key)')
    .eq('role_id', previewRoleId)

  return perms.map(p => p.platform_modules.key)
}
```

### Banner de Preview
```tsx
// preview-banner.tsx
'use client'

export function PreviewBanner({ roleName }: { roleName: string }) {
  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
      <span>
        Vista previa de rol: <strong>{roleName}</strong>
      </span>
      <form action={stopRolePreview}>
        <button type="submit">Salir de vista previa</button>
      </form>
    </div>
  )
}
```

---

## Middleware y Protección de Rutas

### Middleware (`src/middleware.ts`)

```typescript
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Rutas públicas
  const isPublicRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/health')

  // Redirigir no autenticados
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirigir autenticados fuera de /login
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/inicio', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Rutas Públicas
- `/login`
- `/forgot-password`
- `/auth/callback` (OAuth PKCE)
- `/api/health`

### Rutas Protegidas por Middleware
- Todas las demás rutas requieren autenticación

### Rutas Protegidas por Permisos
- `/objetivos/configurar` → `objetivos.manage`
- `/objetivos/[deptId]` → `objetivos.view`
- `/incentivos/configurar` → `incentivos.manage`
- `/formularios/[id]/editar` → `formularios.edit`
- `/resultados` → `resultados.view`
- `/usuarios` → `users.view`
- `/roles` → `roles.view`
- `/configuracion/sistema` → `config.edit`

---

## Estado de Sesión y Variables

### Server Components
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Client Components
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function UserProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      // ...
    }
    loadProfile()
  }, [])

  return <div>{profile?.name}</div>
}
```

---

## Cookies de Autenticación

### Cookie `guadiana_preview_role`
- **Tipo**: httpOnly
- **Duración**: 7 días
- **Uso**: Vista previa de rol
- **Valor**: `roleId` (UUID)

### Cookies Supabase (Managed)
- `sb-access-token`: JWT de acceso
- `sb-refresh-token`: Token de refresh
- Managed por Supabase, no manual

---

## Patrones de Uso

### Verificar permiso en Server Component
```typescript
import { requirePermission } from '@/lib/permissions'

export default async function Page() {
  await requirePermission('objetivos.manage')

  return <div>Contenido protegido</div>
}
```

### Verificar permiso en Server Action
```typescript
'use server'

import { requirePermission } from '@/lib/permissions'

export async function createObjective(data: FormData) {
  await requirePermission('objetivos.manage')

  // Lógica de creación
}
```

### Verificar permiso en Client Component
```typescript
'use client'

import { usePermissions } from '@/hooks/use-permissions'

export function ProtectedButton() {
  const { canManage } = usePermissions()

  if (!canManage) return null

  return <button>Acción restringida</button>
}
```

### Mostrar contenido condicional
```typescript
const canView = await checkPermission('objetivos.view')

return (
  <div>
    {canView && <SensitiveData />}
  </div>
)
```

---

## Seguridad

### Reglas de Oro
1. **Nunca confiar en el frontend para permisos**
2. **RLS es la única fuente de verdad**
3. **Siempre validar en Server Actions**
4. **Admin client solo con validación explícita**

### BYPASS RLS (Admin Client)
```typescript
// ⚠️ ADVERTENCIA: Esto bypasea RLS
const adminClient = createClient(
  supabaseUrl,
  serviceRoleKey // NUNCA exponer en frontend
)

// Solo usar si:
// 1. Estás en Server Action
// 2. Ya validaste permisos con requirePermission()
await requirePermission('users.edit')
const { data } = await adminClient.auth.admin.createUser({ ... })
```

### Auditoría de Cambios de Rol
Tabla `role_change_log` registra:
- `user_id`: Quién cambió de rol
- `changed_by`: Quién hizo el cambio
- `old_role_id`: Rol anterior
- `new_role_id`: Rol nuevo
- `reason`: Motivo del cambio
- `changed_at`: Timestamp
