import { supabase } from '../lib/supabase'

interface BackupData {
  metadata: {
    exportDate: string
    tenantId: string
    version: string
    tables: Record<string, number>
  }
  preco_km: any[]
  preco_kg: any[]
  preco_entrega: any[]
  taxa_arrancada: any[]
  lancamentos: any[]
}

async function fetchAllTenantData(tenantId: string): Promise<BackupData> {
  const [precoKm, precoKg, precoEntrega, taxaArrancada, lancamentos] = await Promise.all([
    supabase.from('preco_km').select('*').eq('tenant_id', tenantId),
    supabase.from('preco_kg').select('*').eq('tenant_id', tenantId),
    supabase.from('preco_entrega').select('*').eq('tenant_id', tenantId),
    supabase.from('taxa_arrancada').select('*').eq('tenant_id', tenantId),
    supabase.from('lancamentos').select('*').eq('tenant_id', tenantId).order('data', { ascending: true }),
  ])

  const errors = [precoKm, precoKg, precoEntrega, taxaArrancada, lancamentos]
    .filter(r => r.error)
    .map(r => r.error!.message)

  if (errors.length > 0) {
    throw new Error(`Erro ao buscar dados: ${errors.join(', ')}`)
  }

  const data: BackupData = {
    metadata: {
      exportDate: new Date().toISOString(),
      tenantId,
      version: '1.0',
      tables: {
        preco_km: precoKm.data?.length ?? 0,
        preco_kg: precoKg.data?.length ?? 0,
        preco_entrega: precoEntrega.data?.length ?? 0,
        taxa_arrancada: taxaArrancada.data?.length ?? 0,
        lancamentos: lancamentos.data?.length ?? 0,
      },
    },
    preco_km: precoKm.data ?? [],
    preco_kg: precoKg.data ?? [],
    preco_entrega: precoEntrega.data ?? [],
    taxa_arrancada: taxaArrancada.data ?? [],
    lancamentos: lancamentos.data ?? [],
  }

  return data
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function exportJSON(tenantId: string): Promise<number> {
  const data = await fetchAllTenantData(tenantId)
  const json = JSON.stringify(data, null, 2)
  triggerDownload(json, `backup-${getDateString()}.json`, 'application/json')

  return Object.values(data.metadata.tables).reduce((sum, n) => sum + n, 0)
}

function escapeSQL(value: any): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

function rowToInsert(table: string, row: Record<string, any>): string {
  const columns = Object.keys(row).join(', ')
  const values = Object.values(row).map(escapeSQL).join(', ')
  return `INSERT INTO public.${table} (${columns}) VALUES (${values});`
}

export async function exportSQL(tenantId: string): Promise<number> {
  const data = await fetchAllTenantData(tenantId)
  const tables = ['preco_km', 'preco_kg', 'preco_entrega', 'taxa_arrancada', 'lancamentos'] as const

  const lines: string[] = [
    '-- ============================================================',
    `-- BACKUP COMPLETO — ${new Date().toLocaleString('pt-BR')}`,
    `-- Tenant: ${tenantId}`,
    '-- ============================================================',
    `-- Para restaurar, execute este script no Supabase SQL Editor.`,
    '-- ============================================================',
    '',
  ]

  for (const table of tables) {
    const rows = data[table]
    if (rows.length === 0) continue
    lines.push(`-- ${table} (${rows.length} registros)`)
    for (const row of rows) {
      lines.push(rowToInsert(table, row))
    }
    lines.push('')
  }

  const sql = lines.join('\n')
  triggerDownload(sql, `backup-${getDateString()}.sql`, 'text/plain')

  return Object.values(data.metadata.tables).reduce((sum, n) => sum + n, 0)
}
