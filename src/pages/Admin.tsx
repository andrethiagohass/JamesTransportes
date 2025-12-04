import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Users, Building2, Key } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import bcrypt from 'bcryptjs'

interface Usuario {
  id: string
  username: string
  nome: string | null
  empresa: string | null
  role: string
  tenant_id: string
  ativo: boolean
  created_at: string
}

const Admin = () => {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [username, setUsername] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Verificar se o usuário é super_admin
  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsuarios()
    }
  }, [isSuperAdmin])

  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, nome, empresa, role, tenant_id, ativo, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar usuários:', error)
    } else {
      setUsuarios(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) {
      alert('Acesso negado!')
      return
    }
    setLoading(true)

    try {
      if (editingId) {
        // Atualizar usuário existente
        const updateData: any = {
          nome,
          empresa,
          role,
          updated_at: new Date().toISOString()
        }

        // Só atualiza senha se foi informada
        if (senha) {
          const passwordHash = await bcrypt.hash(senha, 10)
          updateData.password_hash = passwordHash
        }

        const { error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Criar novo usuário
        if (!senha) {
          alert('Senha é obrigatória para novos usuários')
          setLoading(false)
          return
        }

        const passwordHash = await bcrypt.hash(senha, 10)
        const newTenantId = crypto.randomUUID()

        const { error } = await supabase
          .from('usuarios')
          .insert({
            username,
            password_hash: passwordHash,
            nome,
            empresa,
            role,
            tenant_id: newTenantId,
            ativo: true
          })

        if (error) throw error
      }

      // Limpar formulário
      setUsername('')
      setSenha('')
      setNome('')
      setEmpresa('')
      setRole('user')
      setEditingId(null)
      fetchUsuarios()
      alert('Usuário salvo com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      if (error.code === '23505') {
        alert('Este username já existe!')
      } else {
        alert('Erro ao salvar usuário')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id)
    setUsername(usuario.username)
    setNome(usuario.nome || '')
    setEmpresa(usuario.empresa || '')
    setRole(usuario.role as 'user' | 'admin')
    setSenha('') // Não preenche a senha
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir usuário')
    } else {
      fetchUsuarios()
    }
  }

  const toggleAtivo = async (usuario: Usuario) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ ativo: !usuario.ativo })
      .eq('id', usuario.id)

    if (error) {
      console.error('Erro ao atualizar:', error)
    } else {
      fetchUsuarios()
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setUsername('')
    setSenha('')
    setNome('')
    setEmpresa('')
    setRole('user')
  }

  // Se não for super admin, não mostra nada
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Esta área é restrita para Super Administradores.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-800">Administração de Usuários</h1>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {editingId ? (
            <>
              <Edit2 size={20} />
              Editar Usuário
            </>
          ) : (
            <>
              <Users size={20} />
              Novo Usuário
            </>
          )}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Username (Login)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="usuario.login"
                required
                disabled={!!editingId}
              />
              {editingId && (
                <p className="text-xs text-gray-500 mt-1">Username não pode ser alterado</p>
              )}
            </div>
            <div>
              <label className="label">
                Senha {editingId && '(deixe em branco para manter)'}
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                placeholder={editingId ? 'Digite para alterar' : 'Digite a senha'}
                required={!editingId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field"
                placeholder="João da Silva"
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <Building2 size={16} />
                Nome da Empresa
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="input-field"
                placeholder="Ex: Silva Transportes"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Tipo de Usuário</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
              className="input-field"
            >
              <option value="user">Usuário Comum</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Usuários comuns têm acesso apenas aos seus próprios dados
            </p>
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
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Usuários Cadastrados</h2>
        {usuarios.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário cadastrado ainda.</p>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Username
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">
                    Nome
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Empresa
                  </th>
                  <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">
                    Tipo
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
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium">
                      {usuario.username}
                      {usuario.role === 'super_admin' && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Super Admin
                        </span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {usuario.nome || '-'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-600">
                      {usuario.empresa || '-'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        usuario.role === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : usuario.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.role === 'admin' ? 'Admin' : usuario.role === 'super_admin' ? 'Super' : 'Usuário'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <button
                        onClick={() => toggleAtivo(usuario)}
                        disabled={usuario.role === 'super_admin'}
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          usuario.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        } ${usuario.role === 'super_admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {usuario.role !== 'super_admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(usuario)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(usuario.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {usuario.role === 'super_admin' && (
                          <span className="text-xs text-gray-400">Protegido</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informações úteis */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Key size={18} />
          Informações Importantes
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Cada usuário terá sua própria empresa com dados isolados</li>
          <li>• Usuários comuns só veem seus próprios lançamentos e configurações</li>
          <li>• Admins podem ter mais permissões dentro de sua empresa (futuro)</li>
          <li>• Super Admin (você) pode ver e gerenciar todos os usuários</li>
          <li>• Ao criar um usuário, um novo tenant_id é gerado automaticamente</li>
          <li>• O Super Admin não pode ser desativado ou excluído pela interface</li>
        </ul>
      </div>
    </div>
  )
}

export default Admin
