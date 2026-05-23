'use server'

import { createClient } from '@/lib/supabase/server'
import { checkPermission, checkIsRoot } from '@/lib/permissions'
import { redirect } from 'next/navigation'

export interface InventorySession {
  id: string
  name: string
  warehouse_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  creator_name: string | null
  item_count: number
}

export interface SessionCountRow {
  product_id: string
  quantity: number
  system_stock: number
  notes: string | null
  difference: number
  codigo: string | null
  producto: string | null
  descripcion: string | null
  categoria: string | null
}

export interface SessionDetail {
  session: {
    id: string
    name: string
    warehouse_id: string
    status: 'active' | 'closed'
    created_at: string
    closed_at: string | null
    creator_name: string | null
  }
  counts: SessionCountRow[]
}

export async function getInventorySessions(filters?: {
  warehouse_id?: string
  status?: string
}): Promise<{ success: boolean; data?: InventorySession[]; error?: string; canViewAll?: boolean }> {
  const canView = await checkPermission('inventarios.view')
  if (!canView) redirect('/sin-acceso')

  const supabase = await createClient()

  // Determinar si puede ver todo o solo lo suyo
  const [canViewAll, isRoot] = await Promise.all([
    checkPermission('inventarios.view_all'),
    checkIsRoot(),
  ])
  const seeAll = canViewAll || isRoot

  // Obtener usuario actual si no puede ver todo
  let currentUserId: string | null = null
  if (!seeAll) {
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId = user?.id ?? null
  }

  let query = supabase
    .from('inventory_sessions')
    .select('id, name, warehouse_id, status, created_at, closed_at, created_by')
    .order('created_at', { ascending: false })

  // Filtrar por usuario si no tiene permiso de ver todos
  if (!seeAll && currentUserId) {
    query = query.eq('created_by', currentUserId)
  }

  if (filters?.warehouse_id) {
    query = query.eq('warehouse_id', filters.warehouse_id)
  }
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) return { success: false, error: error.message }

  const sessionList = data ?? []

  // Obtener conteos por sesión
  const sessionIds = sessionList.map((s: any) => s.id)
  let countMap: Record<string, number> = {}
  if (sessionIds.length > 0) {
    const { data: countRows } = await supabase
      .from('conteo_inventario')
      .select('session_id')
      .in('session_id', sessionIds)
    for (const row of countRows ?? []) {
      countMap[row.session_id] = (countMap[row.session_id] ?? 0) + 1
    }
  }

  // Obtener nombres de creadores desde profiles del sistema web
  const creatorIds = [...new Set(sessionList.map((s: any) => s.created_by).filter(Boolean))]
  const nameMap: Record<string, string> = {}
  if (creatorIds.length > 0) {
    const { data: webProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds)
    for (const p of webProfiles ?? []) {
      nameMap[p.id] = p.full_name ?? p.id
    }
  }

  const sessions: InventorySession[] = sessionList.map((s: any) => ({
    id: s.id,
    name: s.name,
    warehouse_id: s.warehouse_id,
    status: s.status,
    created_at: s.created_at,
    closed_at: s.closed_at,
    creator_name: nameMap[s.created_by] ?? null,
    item_count: countMap[s.id] ?? 0,
  }))

  return { success: true, data: sessions, canViewAll: seeAll }
}

export async function getSessionDetail(sessionId: string): Promise<{ success: boolean; data?: SessionDetail; error?: string }> {
  const canView = await checkPermission('inventarios.view')
  if (!canView) redirect('/sin-acceso')

  const supabase = await createClient()

  // Obtener sesión
  const { data: session, error: sessionError } = await supabase
    .from('inventory_sessions')
    .select('id, name, warehouse_id, status, created_at, closed_at, created_by')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    return { success: false, error: sessionError?.message ?? 'Sesión no encontrada' }
  }

  // Obtener nombre del creador
  let creatorName: string | null = null
  if (session.created_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.created_by)
      .single()
    creatorName = profile?.full_name ?? null
  }

  // Obtener conteos con datos del producto
  const { data: counts, error: countsError } = await supabase
    .from('conteo_inventario')
    .select('product_id, quantity, system_stock, notes, warehouse_id')
    .eq('session_id', sessionId)
    .order('product_id')

  if (countsError) return { success: false, error: countsError.message }

  // Obtener datos de productos desde inventario
  const productIds = (counts ?? []).map((c: any) => c.product_id)
  const warehouseId = session.warehouse_id

  let productMap: Record<string, { Codigo: string; Producto: string; Descripcion: string; Categoria: string }> = {}

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('inventario')
      .select('"ProductId", "Codigo", "Producto", "Descripcion", "Categoria"')
      .in('"ProductId"', productIds)
      .eq('"Almacen"', warehouseId)

    productMap = Object.fromEntries(
      (products ?? []).map((p: any) => [p.ProductId, p])
    )
  }

  const countRows: SessionCountRow[] = (counts ?? []).map((c: any) => {
    const prod = productMap[c.product_id]
    return {
      product_id: c.product_id,
      quantity: c.quantity ?? 0,
      system_stock: c.system_stock ?? 0,
      notes: c.notes ?? null,
      difference: (c.quantity ?? 0) - (c.system_stock ?? 0),
      codigo: prod?.Codigo ?? c.product_id,
      producto: prod?.Producto ?? null,
      descripcion: prod?.Descripcion ?? null,
      categoria: prod?.Categoria ?? null,
    }
  })

  return {
    success: true,
    data: {
      session: {
        id: session.id,
        name: session.name,
        warehouse_id: session.warehouse_id,
        status: session.status,
        created_at: session.created_at,
        closed_at: session.closed_at,
        creator_name: creatorName,
      },
      counts: countRows,
    },
  }
}

export async function getWarehouses(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_unique_warehouses')
  return (data ?? []) as string[]
}
