import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, X, Wallet } from 'lucide-react'
import { formatDateBR, formatDateShortBR } from '../utils/dateUtils'
import { formatCurrency, formatCurrencyValue, parseCurrencyInputToCents } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'
import PeriodFilterDropdown from '../components/PeriodFilterDropdown'
import CategoriaFilterDropdown from '../components/CategoriaFilterDropdown'
import { format } from 'date-fns'
import { DEFAULT_PERIOD_FILTER, PeriodFilterValue, matchesPeriodFilter } from '../utils/periodFilter'
import { ALL_CATEGORIAS, CATEGORIAS, categoriaLabel } from '../utils/categorias'

interface Despesa {
  id: string
  data: string
  categoria: string
  descricao: string | null
  valor: number
  tenant_id: string
  created_at: string
}

const Despesas = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValue>(DEFAULT_PERIOD_FILTER)
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([...ALL_CATEGORIAS])
  const [data, setData] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [categoria, setCategoria] = useState<string>('combustivel')
  const [descricao, setDescricao] = useState('')
  const [valorCentavos, setValorCentavos] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  // Estado da modal de edição
  const [editModal, setEditModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState('')
  const [editCategoria, setEditCategoria] = useState<string>('combustivel')
  const [editDescricao, setEditDescricao] = useState('')
  const [editValorCentavos, setEditValorCentavos] = useState(0)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchDespesas()
    }
  }, [user])

  // Filtrar despesas por período e por categoria
  const filteredDespesas = useMemo(() => {
    return despesas.filter(
      (desp) =>
        matchesPeriodFilter(desp.data, periodFilter) &&
        categoriasSelecionadas.includes(desp.categoria)
    )
  }, [despesas, periodFilter, categoriasSelecionadas])

  const todasCategoriasSelecionadas = categoriasSelecionadas.length === CATEGORIAS.length

  const totalPeriodo = useMemo(
    () => filteredDespesas.reduce((sum, d) => sum + d.valor, 0),
    [filteredDespesas]
  )

  const fetchDespesas = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao carregar despesas:', error)
      toast.error('Erro ao carregar despesas')
    } else {
      setDespesas(data || [])
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const valorReais = valorCentavos / 100
      const despesaData = {
        data,
        categoria,
        descricao: descricao || null,
        valor: valorReais,
        tenant_id: user.tenant_id
      }

      const { error } = await supabase
        .from('despesas')
        .insert([despesaData])

      if (error) throw error
      toast.success(`Despesa de ${formatDateShortBR(data)} registrada! Valor: ${formatCurrency(valorReais)}`, 'Despesa Criada')

      // Limpar formulário
      setData(format(new Date(), 'yyyy-MM-dd'))
      setCategoria('combustivel')
      setDescricao('')
      setValorCentavos(0)
      fetchDespesas()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar despesa. Verifique os campos e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (despesa: Despesa) => {
    setEditId(despesa.id)
    setEditData(despesa.data)
    setEditCategoria(despesa.categoria)
    setEditDescricao(despesa.descricao || '')
    setEditValorCentavos(Math.round(despesa.valor * 100))
    setEditModal(true)
  }

  const handleEditSubmit = async () => {
    if (!user || !editId) return
    setEditLoading(true)

    try {
      const despesaData = {
        data: editData,
        categoria: editCategoria,
        descricao: editDescricao || null,
        valor: editValorCentavos / 100,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('despesas')
        .update(despesaData)
        .eq('id', editId)
        .eq('tenant_id', user.tenant_id)

      if (error) throw error
      toast.success(`Despesa de ${formatDateShortBR(editData)} atualizada com sucesso!`, 'Despesa Atualizada')
      setEditModal(false)
      fetchDespesas()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar despesa.')
    } finally {
      setEditLoading(false)
    }
  }

  const closeEditModal = () => {
    setEditModal(false)
    setEditId(null)
  }

  const handleDelete = async (id: string) => {
    const desp = despesas.find(d => d.id === id)
    if (!confirm(`Tem certeza que deseja excluir a despesa de ${desp ? formatDateShortBR(desp.data) : 'esta data'}?`)) return
    if (!user) return

    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir despesa')
    } else {
      toast.success('Despesa excluída com sucesso')
      fetchDespesas()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Despesas</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Nova Despesa</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="label">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="input-field"
                required
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Descrição (opcional)</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="input-field"
                placeholder="Ex: Almoço na BR-101"
                maxLength={200}
              />
            </div>
            <div>
              <label className="label">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyValue(valorCentavos / 100)}
                  onChange={(e) => setValorCentavos(parseCurrencyInputToCents(e.target.value))}
                  className="input-field pl-9"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !data || valorCentavos <= 0}
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
          <h2 className="text-xl font-semibold">Despesas Registradas</h2>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Filtro de Categoria */}
            <CategoriaFilterDropdown
              selected={categoriasSelecionadas}
              onChange={setCategoriasSelecionadas}
            />

            {/* Filtro de Período */}
            <PeriodFilterDropdown value={periodFilter} onChange={setPeriodFilter} total={formatCurrency(totalPeriodo)} />
          </div>
        </div>

        {!fetching && filteredDespesas.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {todasCategoriasSelecionadas ? 'Total no período' : 'Total filtrado'}
              </p>
              <p className="font-bold text-2xl text-red-700">{formatCurrency(totalPeriodo)}</p>
            </div>
            <p className="text-gray-600 text-sm">{filteredDespesas.length} despesa(s)</p>
          </div>
        )}

        {fetching ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : filteredDespesas.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={
              despesas.length === 0
                ? "Nenhuma despesa cadastrada"
                : categoriasSelecionadas.length === 0
                  ? "Nenhuma categoria selecionada"
                  : "Nenhuma despesa neste período"
            }
            description={
              despesas.length === 0
                ? "Registre seus gastos do dia a dia na estrada, como combustível, pedágio e alimentação."
                : categoriasSelecionadas.length === 0
                  ? "Selecione ao menos uma categoria no filtro para ver as despesas."
                  : "Não há despesas para o período selecionado. Tente selecionar um período maior."
            }
          />
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Data</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Categoria</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Descrição</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Valor</th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDespesas.map((desp) => (
                  <tr key={desp.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <span className="hidden sm:inline">{formatDateBR(desp.data)}</span>
                      <span className="sm:hidden">{formatDateShortBR(desp.data)}</span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                        {categoriaLabel(desp.categoria)}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden md:table-cell text-gray-600">
                      {desp.descricao || '-'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-bold text-red-600">
                      {formatCurrency(desp.valor)}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-right">
                      <button
                        onClick={() => handleEdit(desp)}
                        className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                      >
                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(desp.id)}
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
                <h3 className="text-lg font-semibold">Editar Despesa</h3>
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
                <label className="label">Categoria</label>
                <select
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value)}
                  className="input-field"
                  required
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Descrição (opcional)</label>
                <input
                  type="text"
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="input-field"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="label">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrencyValue(editValorCentavos / 100)}
                    onChange={(e) => setEditValorCentavos(parseCurrencyInputToCents(e.target.value))}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botões da Modal */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={handleEditSubmit}
                disabled={editLoading || !editData || editValorCentavos <= 0}
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

export default Despesas
