import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Weight } from 'lucide-react'
import { formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

interface PrecoKgType {
  id: string
  valor: number
  ativo: boolean
  tenant_id: string
  created_at: string
}

const PrecoKg = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [precos, setPrecos] = useState<PrecoKgType[]>([])
  const [valor, setValor] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user) {
      fetchPrecos()
    }
  }, [user])

  const fetchPrecos = async () => {
    if (!user) return
    setFetching(true)

    const { data, error } = await supabase
      .from('preco_kg')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar preços:', error)
      toast.error('Erro ao carregar preços por KG')
    } else {
      setPrecos(data || [])
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('preco_kg')
          .update({ valor: parseFloat(valor), updated_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('tenant_id', user.tenant_id)

        if (error) throw error
        toast.success(`Preço atualizado para ${formatCurrency(parseFloat(valor))}/kg`, 'Preço Atualizado')
      } else {
        // Criar novo - Primeiro desativa todos os preços ativos do tenant
        const { error: updateError } = await supabase
          .from('preco_kg')
          .update({ ativo: false })
          .eq('ativo', true)
          .eq('tenant_id', user.tenant_id)

        if (updateError) throw updateError

        // Depois insere o novo preço como ativo
        const { error: insertError } = await supabase
          .from('preco_kg')
          .insert({ 
            valor: parseFloat(valor), 
            ativo: true,
            tenant_id: user.tenant_id
          })

        if (insertError) throw insertError
        toast.success(`Novo preço cadastrado: ${formatCurrency(parseFloat(valor))}/kg`, 'Preço Criado')
      }

      setValor('')
      setEditingId(null)
      fetchPrecos()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar preço. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (preco: PrecoKgType) => {
    setEditingId(preco.id)
    setValor(preco.valor.toString())
  }

  const handleDelete = async (id: string) => {
    const preco = precos.find(p => p.id === id)
    if (!confirm(`Tem certeza que deseja excluir o preço de ${preco ? formatCurrency(preco.valor) : '?'}/kg?`)) return
    if (!user) return

    const { error } = await supabase
      .from('preco_kg')
      .delete()
      .eq('id', id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir preço')
    } else {
      toast.success('Preço excluído com sucesso')
      fetchPrecos()
    }
  }

  const toggleAtivo = async (preco: PrecoKgType) => {
    if (!user) return

    const { error } = await supabase
      .from('preco_kg')
      .update({ ativo: !preco.ativo })
      .eq('id', preco.id)
      .eq('tenant_id', user.tenant_id)

    if (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar status')
    } else {
      toast.success(`Preço ${preco.ativo ? 'desativado' : 'ativado'} com sucesso`)
      fetchPrecos()
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Preço por KG</h1>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Editar Preço' : 'Novo Preço'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Valor por KG (R$)</label>
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="input-field"
              placeholder="0.00"
              required
            />
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
        <h2 className="text-xl font-semibold mb-4">Preços Cadastrados</h2>
        {fetching ? (
          <LoadingSkeleton type="table" rows={3} />
        ) : precos.length === 0 ? (
          <EmptyState
            icon={Weight}
            title="Nenhum preço configurado"
            description="Configure o valor por quilograma transportado. Este valor será usado no cálculo automático dos lançamentos."
          />
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Valor (R$/kg)
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">
                    Data Criação
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {precos.map((preco) => (
                  <tr key={preco.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium">
                      {formatCurrency(preco.valor)}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <button
                        onClick={() => toggleAtivo(preco)}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          preco.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {preco.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                      {new Date(preco.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-right">
                      <button
                        onClick={() => handleEdit(preco)}
                        className="text-blue-600 hover:text-blue-800 mr-2 sm:mr-3"
                      >
                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(preco.id)}
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

export default PrecoKg
