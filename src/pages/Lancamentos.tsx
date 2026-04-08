import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Calculator, TruckIcon, Filter, X } from 'lucide-react'
import { formatDateBR, formatDateShortBR } from '../utils/dateUtils'
import { formatKm, formatPeso, formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import { subMonths, subYears, isAfter, parseISO } from 'date-fns'

interface Lancamento {
  id: string
  data: string
  carga: number | null
  km_inicial: number
  km_final: number
  km_total: number
  peso: number
  valor_km: number
  valor_peso: number
  taxa_arrancada: number
  valor_entrega: number
  preco_total: number
  tenant_id: string
  created_at: string
}

type PeriodFilter = '1month' | '3months' | '6months' | '1year' | 'all'

const Lancamentos = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('1month')
  const [data, setData] = useState('')
  const [carga, setCarga] = useState('')
  const [kmInicial, setKmInicial] = useState('')
  const [kmFinal, setKmFinal] = useState('')
  const [peso, setPeso] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Cache de preços (carregados uma vez)
  const [cachedPrecoKm, setCachedPrecoKm] = useState<number>(0)
  const [cachedPrecoKg, setCachedPrecoKg] = useState<number>(0)
  const [cachedPrecoEntrega, setCachedPrecoEntrega] = useState<number>(0)
  const [cachedTaxas, setCachedTaxas] = useState<{ km_inicial: number; km_final: number; valor: number }[]>([])
  const [pricingLoaded, setPricingLoaded] = useState(false)

  // Valores calculados
  const [kmTotal, setKmTotal] = useState(0)
  const [precoTotal, setPrecoTotal] = useState(0)
  const [valorKm, setValorKm] = useState(0)
  const [valorPeso, setValorPeso] = useState(0)
  const [taxaArrancada, setTaxaArrancada] = useState(0)
  const [valorEntrega, setValorEntrega] = useState(0)

  // Estado da modal de edição
  const [editModal, setEditModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState('')
  const [editCarga, setEditCarga] = useState('')
  const [editKmInicial, setEditKmInicial] = useState('')
  const [editKmFinal, setEditKmFinal] = useState('')
  const [editPeso, setEditPeso] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editKmTotal, setEditKmTotal] = useState(0)
  const [editPrecoTotal, setEditPrecoTotal] = useState(0)
  const [editValorKm, setEditValorKm] = useState(0)
  const [editValorPeso, setEditValorPeso] = useState(0)
  const [editTaxaArrancada, setEditTaxaArrancada] = useState(0)
  const [editValorEntrega, setEditValorEntrega] = useState(0)

  // Snapshot dos preços originais do lançamento sendo editado
  const [snapshotValorKm, setSnapshotValorKm] = useState(0)
  const [snapshotValorPeso, setSnapshotValorPeso] = useState(0)
  const [snapshotTaxaArrancada, setSnapshotTaxaArrancada] = useState(0)
  const [snapshotValorEntrega, setSnapshotValorEntrega] = useState(0)

  useEffect(() => {
    if (user) {
      fetchLancamentos()
      fetchPricing()
    }
  }, [user])

  // Recarregar preços quando o usuário voltar à aba
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchPricing()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user])

  useEffect(() => {
    if (user && pricingLoaded) {
      calcularValores()
    }
  }, [kmInicial, kmFinal, peso, pricingLoaded])

  // Calcular valores da modal de edição
  useEffect(() => {
    if (user && editModal) {
      calcularValoresEdit()
    }
  }, [editKmInicial, editKmFinal, editPeso, editModal, snapshotValorKm, snapshotValorPeso, snapshotTaxaArrancada, snapshotValorEntrega])

  // Filtrar lançamentos por período
  const filteredLancamentos = useMemo(() => {
    if (periodFilter === 'all') return lancamentos

    const now = new Date()
    let cutoffDate: Date

    switch (periodFilter) {
      case '1month':
        cutoffDate = subMonths(now, 1)
        break
      case '3months':
        cutoffDate = subMonths(now, 3)
        break
      case '6months':
        cutoffDate = subMonths(now, 6)
        break
      case '1year':
        cutoffDate = subYears(now, 1)
        break
      default:
        return lancamentos
    }

    return lancamentos.filter(lanc => {
      const lancDate = parseISO(lanc.data)
      return isAfter(lancDate, cutoffDate)
    })
  }, [lancamentos, periodFilter])

  const fetchLancamentos = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar lançamentos:', error)
      toast.error('Erro ao carregar lançamentos')
    } else {
      setLancamentos(data || [])
    }
    setFetching(false)
  }

  // Buscar preços uma vez e cachear
  const fetchPricing = async () => {
    if (!user) return

    try {
      const [kmRes, kgRes, entregaRes, taxaRes] = await Promise.all([
        supabase
          .from('preco_km')
          .select('valor')
          .eq('ativo', true)
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('preco_kg')
          .select('valor')
          .eq('ativo', true)
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('preco_entrega')
          .select('valor')
          .eq('ativo', true)
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('taxa_arrancada')
          .select('km_inicial, km_final, valor')
          .eq('ativo', true)
          .eq('tenant_id', user.tenant_id)
          .order('km_inicial', { ascending: true })
      ])

      setCachedPrecoKm(kmRes.data?.valor || 0)
      setCachedPrecoKg(kgRes.data?.valor || 0)
      setCachedPrecoEntrega(entregaRes.data?.valor || 0)
      setCachedTaxas(taxaRes.data || [])
      setPricingLoaded(true)
    } catch (error) {
      console.error('Erro ao carregar preços:', error)
    }
  }

  // Encontrar taxa de arrancada pelo km total (cálculo local)
  const findTaxa = (totalKm: number): number => {
    const taxa = cachedTaxas.find(t => totalKm >= t.km_inicial && totalKm <= t.km_final)
    return taxa?.valor || 0
  }

  const calcularValores = () => {
    if (!kmInicial || !kmFinal || !peso) {
      setKmTotal(0)
      setPrecoTotal(0)
      return
    }

    const kmI = parseFloat(kmInicial)
    const kmF = parseFloat(kmFinal)
    const p = parseFloat(peso)
    const totalKm = kmF - kmI
    setKmTotal(totalKm)

    const vKm = cachedPrecoKm
    const vPeso = cachedPrecoKg
    const vEntrega = cachedPrecoEntrega
    const taxa = findTaxa(totalKm)

    const totalValorKm = totalKm * vKm
    const totalValorPeso = p * vPeso
    const total = totalValorKm + totalValorPeso + taxa + vEntrega

    setValorKm(vKm)
    setValorPeso(vPeso)
    setTaxaArrancada(taxa)
    setValorEntrega(vEntrega)
    setPrecoTotal(total)
  }

  const calcularValoresEdit = () => {
    if (!editKmInicial || !editKmFinal || !editPeso) {
      setEditKmTotal(0)
      setEditPrecoTotal(0)
      return
    }

    const kmI = parseFloat(editKmInicial)
    const kmF = parseFloat(editKmFinal)
    const p = parseFloat(editPeso)
    const totalKm = kmF - kmI
    setEditKmTotal(totalKm)

    // Usar preços do snapshot original do lançamento
    const vKm = snapshotValorKm
    const vPeso = snapshotValorPeso
    const taxa = snapshotTaxaArrancada
    const vEntrega = snapshotValorEntrega
    const total = (totalKm * vKm) + (p * vPeso) + taxa + vEntrega

    setEditValorKm(vKm)
    setEditValorPeso(vPeso)
    setEditTaxaArrancada(taxa)
    setEditValorEntrega(vEntrega)
    setEditPrecoTotal(total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const lancamentoData = {
        data,
        carga: carga ? parseInt(carga) : null,
        km_inicial: parseFloat(kmInicial),
        km_final: parseFloat(kmFinal),
        km_total: kmTotal,
        peso: parseFloat(peso),
        valor_km: valorKm,
        valor_peso: valorPeso,
        taxa_arrancada: taxaArrancada,
        valor_entrega: valorEntrega,
        preco_total: precoTotal,
        tenant_id: user.tenant_id
      }

      const { error } = await supabase
        .from('lancamentos')
        .insert([lancamentoData])

      if (error) throw error
      toast.success(`Lançamento de ${formatDateShortBR(data)} registrado! Total: ${formatCurrency(precoTotal)}`, 'Lançamento Criado')

      // Limpar formulário
      setData('')
      setCarga('')
      setKmInicial('')
      setKmFinal('')
      setPeso('')
      fetchLancamentos()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar lançamento. Verifique os campos e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (lancamento: Lancamento) => {
    // Carregar preços do snapshot original do lançamento
    setSnapshotValorKm(lancamento.valor_km)
    setSnapshotValorPeso(lancamento.valor_peso)
    setSnapshotTaxaArrancada(lancamento.taxa_arrancada)
    setSnapshotValorEntrega(lancamento.valor_entrega || 0)
    setEditId(lancamento.id)
    setEditData(lancamento.data)
    setEditCarga(lancamento.carga ? lancamento.carga.toString() : '')
    setEditKmInicial(lancamento.km_inicial.toString())
    setEditKmFinal(lancamento.km_final.toString())
    setEditPeso(lancamento.peso.toString())
    setEditModal(true)
  }

  const handleEditSubmit = async () => {
    if (!user || !editId) return
    setEditLoading(true)

    try {
      const lancamentoData = {
        data: editData,
        carga: editCarga ? parseInt(editCarga) : null,
        km_inicial: parseFloat(editKmInicial),
        km_final: parseFloat(editKmFinal),
        km_total: editKmTotal,
        peso: parseFloat(editPeso),
        valor_km: editValorKm,
        valor_peso: editValorPeso,
        taxa_arrancada: editTaxaArrancada,
        valor_entrega: editValorEntrega,
        preco_total: editPrecoTotal,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('lancamentos')
        .update(lancamentoData)
        .eq('id', editId)
        .eq('tenant_id', user.tenant_id)

      if (error) throw error
      toast.success(`Lançamento de ${formatDateShortBR(editData)} atualizado com sucesso!`, 'Lançamento Atualizado')
      setEditModal(false)
      fetchLancamentos()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar lançamento.')
    } finally {
      setEditLoading(false)
    }
  }

  const closeEditModal = () => {
    setEditModal(false)
    setEditId(null)
  }

  const handleDelete = async (id: string) => {
    const lanc = lancamentos.find(l => l.id === id)
    if (!confirm(`Tem certeza que deseja excluir o lançamento de ${lanc ? formatDateShortBR(lanc.data) : 'esta data'}?`)) return
    if (!user) return

    const { error } = await supabase
      .from('lancamentos')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir lançamento')
    } else {
      toast.success('Lançamento excluído com sucesso')
      fetchLancamentos()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Lançamentos</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Novo Lançamento</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="label">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Carga</label>
              <input
                type="number"
                min="0"
                max="999999"
                value={carga}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 999999)) {
                    setCarga(value)
                  }
                }}
                className="input-field"
                placeholder="Ex: 123456"
              />
            </div>
            <div>
              <label className="label">KM Inicial</label>
              <input
                type="number"
                step="0.01"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                className="input-field"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="label">KM Final</label>
              <input
                type="number"
                step="0.01"
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                className="input-field"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="label">Peso (KG)</label>
              <input
                type="number"
                step="0.01"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="input-field"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Cálculos */}
          {kmTotal > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="text-blue-600" size={20} />
                <h3 className="font-semibold text-blue-900">Cálculo Automático</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">KM Total</p>
                  <p className="font-bold text-lg">{formatKm(kmTotal)} km</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor KM</p>
                  <p className="font-bold text-lg">{formatCurrency(kmTotal * valorKm)}</p>
                  <p className="text-xs text-gray-500">{formatKm(kmTotal)}km × {formatCurrency(valorKm)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Peso</p>
                  <p className="font-bold text-lg">{formatCurrency(parseFloat(peso || '0') * valorPeso)}</p>
                  <p className="text-xs text-gray-500">{formatPeso(parseFloat(peso || '0'))}kg × {formatCurrency(valorPeso)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taxa Arrancada</p>
                  <p className="font-bold text-lg">{formatCurrency(taxaArrancada)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Entrega</p>
                  <p className="font-bold text-lg">{formatCurrency(valorEntrega)}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-blue-200 mt-3">
                <p className="text-gray-600 text-sm">Preço Total</p>
                <p className="font-bold text-2xl text-blue-900">{formatCurrency(precoTotal)}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || kmTotal === 0}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <h2 className="text-xl font-semibold">Lançamentos Registrados</h2>
          
          {/* Filtro de Período */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
              className="input-field w-auto min-w-[180px]"
            >
              <option value="1month">Último mês</option>
              <option value="3months">Últimos 3 meses</option>
              <option value="6months">Últimos 6 meses</option>
              <option value="1year">Último ano</option>
              <option value="all">Todos os períodos</option>
            </select>
          </div>
        </div>

        {fetching ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : filteredLancamentos.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title={lancamentos.length === 0 ? "Nenhum lançamento cadastrado" : "Nenhum lançamento neste período"}
            description={lancamentos.length === 0 
              ? "Comece registrando sua primeira viagem preenchendo o formulário acima. Os valores serão calculados automaticamente com base nos preços configurados."
              : "Não há lançamentos para o período selecionado. Tente selecionar um período maior."}
          />
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Data</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden lg:table-cell">Carga</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">KM</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Peso</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Total</th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLancamentos.map((lanc) => (
                  <tr key={lanc.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{formatDateBR(lanc.data)}</span>
                      <span className="sm:hidden">{formatDateShortBR(lanc.data)}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">
                      {lanc.carga ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {lanc.carga}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">{formatKm(lanc.km_total)} km</span>
                        <div className="text-xs text-gray-500 hidden sm:block">
                          {formatKm(lanc.km_inicial)} → {formatKm(lanc.km_final)}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell">{formatPeso(lanc.peso)} kg</td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold text-green-600">
                      <span className="hidden sm:inline">{formatCurrency(lanc.preco_total)}</span>
                      <span className="sm:hidden">R$ {formatKm(lanc.preco_total)}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-right">
                      <button
                        onClick={() => handleEdit(lanc)}
                        className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                      >
                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(lanc.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {editModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header da Modal */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <Edit2 size={20} />
                <h3 className="text-lg font-semibold">Editar Lançamento</h3>
              </div>
              <button
                onClick={closeEditModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo da Modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data</label>
                  <input
                    type="date"
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Carga</label>
                  <input
                    type="number"
                    min="0"
                    max="999999"
                    value={editCarga}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 999999)) {
                        setEditCarga(value)
                      }
                    }}
                    className="input-field"
                    placeholder="Ex: 123456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">KM Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editKmInicial}
                    onChange={(e) => setEditKmInicial(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="label">KM Final</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editKmFinal}
                    onChange={(e) => setEditKmFinal(e.target.value)}
                    className="input-field"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Peso (KG)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPeso}
                  onChange={(e) => setEditPeso(e.target.value)}
                  className="input-field"
                  placeholder="0"
                  required
                />
              </div>

              {/* Cálculo Automático na Modal */}
              {editKmTotal > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="text-blue-600" size={18} />
                    <h4 className="font-semibold text-blue-900 text-sm">Cálculo Automático</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">KM Total</p>
                      <p className="font-bold">{formatKm(editKmTotal)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Valor KM</p>
                      <p className="font-bold">{formatCurrency(editKmTotal * editValorKm)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Valor Peso</p>
                      <p className="font-bold">{formatCurrency(parseFloat(editPeso || '0') * editValorPeso)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Taxa Arrancada</p>
                      <p className="font-bold">{formatCurrency(editTaxaArrancada)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Valor Entrega</p>
                      <p className="font-bold">{formatCurrency(editValorEntrega)}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-200 mt-2">
                    <p className="text-gray-600 text-xs">Preço Total</p>
                    <p className="font-bold text-xl text-blue-900">{formatCurrency(editPrecoTotal)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Botões da Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || editKmTotal <= 0}
                className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2 text-base font-semibold"
              >
                <Save size={18} />
                {editLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                onClick={closeEditModal}
                disabled={editLoading}
                className="flex-1 btn btn-secondary py-3 text-base"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Lancamentos
