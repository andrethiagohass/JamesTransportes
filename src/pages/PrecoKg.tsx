import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2 } from 'lucide-react'

interface PrecoKgType {
  id: string
  valor: number
  ativo: boolean
  created_at: string
}

const PrecoKg = () => {
  const [precos, setPrecos] = useState<PrecoKgType[]>([])
  const [valor, setValor] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPrecos()
  }, [])

  const fetchPrecos = async () => {
    const { data, error } = await supabase
      .from('preco_kg')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar preços:', error)
    } else {
      setPrecos(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        const { error } = await supabase
          .from('preco_kg')
          .update({ valor: parseFloat(valor), updated_at: new Date().toISOString() })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Criar novo - Primeiro desativa todos os preços ativos
        const { error: updateError } = await supabase
          .from('preco_kg')
          .update({ ativo: false })
          .eq('ativo', true)

        if (updateError) throw updateError

        // Depois insere o novo preço como ativo
        const { error: insertError } = await supabase
          .from('preco_kg')
          .insert({ valor: parseFloat(valor), ativo: true })

        if (insertError) throw insertError
      }

      setValor('')
      setEditingId(null)
      fetchPrecos()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar preço')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (preco: PrecoKgType) => {
    setEditingId(preco.id)
    setValor(preco.valor.toString())
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    const { error } = await supabase
      .from('preco_kg')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir')
    } else {
      fetchPrecos()
    }
  }

  const toggleAtivo = async (preco: PrecoKgType) => {
    const { error } = await supabase
      .from('preco_kg')
      .update({ ativo: !preco.ativo })
      .eq('id', preco.id)

    if (error) {
      console.error('Erro ao atualizar:', error)
    } else {
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
        {precos.length === 0 ? (
          <p className="text-gray-500">Nenhum preço cadastrado ainda.</p>
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
                      R$ {preco.valor.toFixed(2)}
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
