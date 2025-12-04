import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Zap } from 'lucide-react'
import { formatKm, formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

interface TaxaType {
  id: string
  km_inicial: number
  km_final: number
  valor: number
  ativo: boolean
  tenant_id: string
  created_at: string
}

const TaxaArrancada = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [taxas, setTaxas] = useState<TaxaType[]>([])
  const [kmInicial, setKmInicial] = useState('')
  const [kmFinal, setKmFinal] = useState('')
  const [valor, setValor] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user) {
      fetchTaxas()
    }
  }, [user])

  const fetchTaxas = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from('taxa_arrancada')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('km_inicial', { ascending: true })

    if (error) {
      console.error('Erro ao carregar taxas:', error)
      toast.error('Erro ao carregar taxas de arrancada')
    } else {
      setTaxas(data || [])
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const taxaData = {
        km_inicial: parseInt(kmInicial),
        km_final: parseInt(kmFinal),
        valor: parseFloat(valor),
        tenant_id: user.tenant_id
      }

      if (editingId) {
        const { error } = await supabase
          .from('taxa_arrancada')
          .update({ ...taxaData, updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('tenant_id', user.tenant_id)

        if (error) throw error
        toast.success(`Taxa atualizada: ${formatKm(parseInt(kmInicial))}-${formatKm(parseInt(kmFinal))}km = ${formatCurrency(parseFloat(valor))}`, 'Taxa Atualizada')
      } else {
        const { error } = await supabase
          .from('taxa_arrancada')
          .insert({ ...taxaData, ativo: true })

        if (error) throw error
        toast.success(`Nova taxa criada: ${formatKm(parseInt(kmInicial))}-${formatKm(parseInt(kmFinal))}km = ${formatCurrency(parseFloat(valor))}`, 'Taxa Criada')
      }

      setKmInicial('')
      setKmFinal('')
      setValor('')
      setEditingId(null)
      fetchTaxas()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar taxa. Verifique se as faixas de KM não se sobrepõem.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (taxa: TaxaType) => {
    setEditingId(taxa.id)
    setKmInicial(taxa.km_inicial.toString())
    setKmFinal(taxa.km_final.toString())
    setValor(taxa.valor.toString())
  }

  const handleDelete = async (id: string) => {
    const taxa = taxas.find(t => t.id === id)
    if (!confirm(`Tem certeza que deseja excluir a taxa de ${taxa ? `${formatKm(taxa.km_inicial)}-${formatKm(taxa.km_final)}km` : 'esta faixa'}?`)) return
    if (!user) return

    const { error } = await supabase
      .from('taxa_arrancada')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir taxa')
    } else {
      toast.success('Taxa excluída com sucesso')
      fetchTaxas()
    }
  }

  const toggleAtivo = async (taxa: TaxaType) => {
    if (!user) return

    const { error } = await supabase
      .from('taxa_arrancada')
      .update({ ativo: !taxa.ativo })
      .eq('id', taxa.id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar status')
    } else {
      toast.success(`Taxa ${taxa.ativo ? 'desativada' : 'ativada'} com sucesso`)
      fetchTaxas()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Taxa de Arrancada</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Taxa' : 'Nova Taxa'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">KM Inicial</label>
              <input
                type="number"
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
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                className="input-field"
                placeholder="200"
                required
              />
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="input-field"
                placeholder="157.00"
                required
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
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
                  setKmInicial('')
                  setKmFinal('')
                  setValor('')
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
        <h2 className="text-xl font-semibold mb-4">Taxas Cadastradas</h2>
        {fetching ? (
          <LoadingSkeleton type="table" rows={4} />
        ) : taxas.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="Nenhuma taxa configurada"
            description="Configure as taxas de arrancada por faixa de distância. Estas taxas serão somadas ao valor total das viagens."
          />
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Faixa (KM)
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Valor (R$)
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {taxas.map((taxa) => (
                  <tr key={taxa.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium">
                      {formatKm(taxa.km_inicial)} - {formatKm(taxa.km_final)} km
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      {formatCurrency(taxa.valor)}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <button
                        onClick={() => toggleAtivo(taxa)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          taxa.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {taxa.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-right">
                      <button
                        onClick={() => handleEdit(taxa)}
                        className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                      >
                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(taxa.id)}
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

export default TaxaArrancada
