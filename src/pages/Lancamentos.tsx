import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Calculator, TruckIcon } from 'lucide-react'
import { formatDateBR, formatDateShortBR } from '../utils/dateUtils'
import { formatKm, formatPeso, formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

interface Lancamento {
  id: string
  data: string
  carga: string | null
  km_inicial: number
  km_final: number
  km_total: number
  peso: number
  valor_km: number
  valor_peso: number
  taxa_arrancada: number
  preco_total: number
  tenant_id: string
  created_at: string
}

const Lancamentos = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [data, setData] = useState('')
  const [carga, setCarga] = useState('')
  const [kmInicial, setKmInicial] = useState('')
  const [kmFinal, setKmFinal] = useState('')
  const [peso, setPeso] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Valores calculados
  const [kmTotal, setKmTotal] = useState(0)
  const [precoTotal, setPrecoTotal] = useState(0)
  const [valorKm, setValorKm] = useState(0)
  const [valorPeso, setValorPeso] = useState(0)
  const [taxaArrancada, setTaxaArrancada] = useState(0)

  useEffect(() => {
    if (user) {
      fetchLancamentos()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      calcularValores()
    }
  }, [kmInicial, kmFinal, peso, user])

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

  const calcularValores = async () => {
    if (!user || !kmInicial || !kmFinal || !peso) {
      setKmTotal(0)
      setPrecoTotal(0)
      return
    }

    const kmI = parseFloat(kmInicial)
    const kmF = parseFloat(kmFinal)
    const p = parseFloat(peso)

    // Calcular KM total
    const totalKm = kmF - kmI
    setKmTotal(totalKm)

    try {
      // Buscar preço por KM ativo do tenant
      const { data: precoKmData } = await supabase
        .from('preco_km')
        .select('valor')
        .eq('ativo', true)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Buscar preço por KG ativo do tenant
      const { data: precoKgData } = await supabase
        .from('preco_kg')
        .select('valor')
        .eq('ativo', true)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Buscar taxa de arrancada baseada no KM total do tenant
      const { data: taxaData } = await supabase
        .from('taxa_arrancada')
        .select('valor')
        .eq('ativo', true)
        .eq('tenant_id', user.tenant_id)
        .lte('km_inicial', totalKm)
        .gte('km_final', totalKm)
        .limit(1)
        .maybeSingle()

      const vKm = precoKmData?.valor || 0
      const vPeso = precoKgData?.valor || 0
      const taxa = taxaData?.valor || 0

      const totalValorKm = totalKm * vKm
      const totalValorPeso = p * vPeso
      const total = totalValorKm + totalValorPeso + taxa

      setValorKm(vKm)
      setValorPeso(vPeso)
      setTaxaArrancada(taxa)
      setPrecoTotal(total)
    } catch (error) {
      console.error('Erro ao calcular valores:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const lancamentoData = {
        data,
        carga: carga || null,
        km_inicial: parseFloat(kmInicial),
        km_final: parseFloat(kmFinal),
        km_total: kmTotal,
        peso: parseFloat(peso),
        valor_km: valorKm,
        valor_peso: valorPeso,
        taxa_arrancada: taxaArrancada,
        preco_total: precoTotal,
        tenant_id: user.tenant_id
      }

      if (editingId) {
        const { error } = await supabase
          .from('lancamentos')
          .update({ ...lancamentoData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('tenant_id', user.tenant_id)

        if (error) throw error
        toast.success(`Lançamento de ${formatDateShortBR(data)} atualizado com sucesso!`, 'Lançamento Atualizado')
      } else {
        const { error } = await supabase
          .from('lancamentos')
          .insert([lancamentoData])

        if (error) throw error
        toast.success(`Lançamento de ${formatDateShortBR(data)} registrado! Total: ${formatCurrency(precoTotal)}`, 'Lançamento Criado')
      }

      // Limpar formulário
      setData('')
      setCarga('')
      setKmInicial('')
      setKmFinal('')
      setPeso('')
      setEditingId(null)
      fetchLancamentos()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar lançamento. Verifique os campos e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (lancamento: Lancamento) => {
    setEditingId(lancamento.id)
    setData(lancamento.data)
    setCarga(lancamento.carga || '')
    setKmInicial(lancamento.km_inicial.toString())
    setKmFinal(lancamento.km_final.toString())
    setPeso(lancamento.peso.toString())
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
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
        </h2>
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
                type="text"
                maxLength={5}
                value={carga}
                onChange={(e) => setCarga(e.target.value)}
                className="input-field"
                placeholder="Ex: A123"
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setData('')
                  setCarga('')
                  setKmInicial('')
                  setKmFinal('')
                  setPeso('')
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Lançamentos Registrados</h2>
        {fetching ? (
          <LoadingSkeleton type="table" rows={5} />
        ) : lancamentos.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title="Nenhum lançamento cadastrado"
            description="Comece registrando sua primeira viagem preenchendo o formulário acima. Os valores serão calculados automaticamente com base nos preços configurados."
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
                {lancamentos.map((lanc) => (
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
    </div>
  )
}

export default Lancamentos
