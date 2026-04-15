import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Save, Edit2, Trash2, Users, Building2, Key, Mail, Download, Database } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { exportJSON, exportSQL } from '../utils/exportUtils'

interface Usuario {
  id: string
  email: string
  nome: string | null
  empresa: string | null
  role: string
  tenant_id: string
  ativo: boolean
  created_at: string
}

const Admin = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [createdUserInfo, setCreatedUserInfo] = useState<{ email: string; senha: string } | null>(null)
  const [exporting, setExporting] = useState<'json' | 'sql' | null>(null)

  // Verificar se o usuário é super_admin
  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsuarios()
    }
  }, [isSuperAdmin])

  const fetchUsuarios = async () => {
    // Busca perfis de usuário (user_profiles) - agora com email direto da tabela
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, nome, empresa, role, tenant_id, ativo, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
      return
    }

    setUsuarios(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) {
      toast.error('Acesso negado!')
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

        // Atualizar perfil
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', editingId)

        if (profileError) throw profileError

        // Se senha foi informada, mostrar aviso que precisa resetar via email
        if (senha) {
          toast.warning('⚠️ Para alterar senha, o usuário deve usar "Esqueci minha senha" no login')
        }
        
        toast.success('Usuário atualizado com sucesso!', 'Sucesso')
      } else {
        // Criar novo usuário no Supabase Auth
        if (!senha) {
          toast.warning('Senha é obrigatória para novos usuários')
          setLoading(false)
          return
        }

        if (!email) {
          toast.warning('Email é obrigatório para novos usuários')
          setLoading(false)
          return
        }

        // Salvar sessão atual do super admin
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        // Determinar a URL de redirecionamento correta
        const redirectUrl = window.location.origin.includes('github.io')
          ? 'https://andrethiagohass.github.io/JamesTransportes/'
          : `${window.location.origin}/`

        // 1. Criar usuário usando signUp (funciona no cliente)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: senha,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nome: nome
            }
          }
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Erro ao criar usuário')

        // 2. Criar perfil em user_profiles
        const newTenantId = crypto.randomUUID()

        // Temporariamente fazer logout para criar o perfil como novo usuário
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            tenant_id: newTenantId,
            role: role,
            nome: nome,
            empresa: empresa,
            email: email,
            ativo: true
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
          throw profileError
        }

        // 3. Restaurar sessão do super admin
        if (currentSession) {
          await supabase.auth.setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token
          })
        }
        
        // Mostrar modal com informações do usuário criado
        setCreatedUserInfo({ email, senha })
        setShowPasswordModal(true)
        
        toast.success(
          `✅ Usuário criado! Email de confirmação enviado para ${email}`, 
          'Sucesso'
        )
      }

      // Limpar formulário
      setEmail('')
      setSenha('')
      setNome('')
      setEmpresa('')
      setRole('user')
      setEditingId(null)
      fetchUsuarios()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      if (error.code === '23505') {
        toast.error('Este email já existe! Escolha outro.')
      } else if (error.message?.includes('email')) {
        toast.error('Email inválido ou já cadastrado.')
      } else {
        toast.error('Erro ao salvar usuário: ' + (error.message || 'Tente novamente'))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id)
    setEmail(usuario.email)
    setNome(usuario.nome || '')
    setEmpresa(usuario.empresa || '')
    setRole(usuario.role as 'user' | 'admin')
    setSenha('') // Não preenche a senha
  }

  const handleDelete = async (id: string, tenantId: string, userName: string) => {
    // Confirmação detalhada
    const confirmMessage = `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!

Você está prestes a EXCLUIR PERMANENTEMENTE:

👤 Usuário: ${userName}
🏢 Tenant ID: ${tenantId}

📊 Serão removidos TODOS os dados:
• Lançamentos de fretes
• Configurações de preço por km
• Configurações de preço por kg
• Configurações de taxa de arrancada
• Perfil do usuário

Esta ação NÃO pode ser desfeita!

Deseja realmente continuar?`

    if (!confirm(confirmMessage)) return

    // Segunda confirmação para ter certeza
    if (!confirm('Confirma NOVAMENTE a exclusão permanente de todos os dados?')) return

    setLoading(true)

    try {
      // 1. Deletar lançamentos
      const { error: lancamentosError } = await supabase
        .from('lancamentos')
        .delete()
        .eq('tenant_id', tenantId)

      if (lancamentosError) {
        console.error('Erro ao deletar lançamentos:', lancamentosError)
        throw new Error('Erro ao deletar lançamentos')
      }

      // 2. Deletar preços por km
      const { error: precoKmError } = await supabase
        .from('preco_km')
        .delete()
        .eq('tenant_id', tenantId)

      if (precoKmError) {
        console.error('Erro ao deletar preço km:', precoKmError)
        throw new Error('Erro ao deletar configurações de preço por km')
      }

      // 3. Deletar preços por kg
      const { error: precoKgError } = await supabase
        .from('preco_kg')
        .delete()
        .eq('tenant_id', tenantId)

      if (precoKgError) {
        console.error('Erro ao deletar preço kg:', precoKgError)
        throw new Error('Erro ao deletar configurações de preço por kg')
      }

      // 4. Deletar taxas de arrancada
      const { error: taxaError } = await supabase
        .from('taxa_arrancada')
        .delete()
        .eq('tenant_id', tenantId)

      if (taxaError) {
        console.error('Erro ao deletar taxa arrancada:', taxaError)
        throw new Error('Erro ao deletar configurações de taxa de arrancada')
      }

      // 5. Deletar perfil do usuário (por último)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id)

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError)
        throw new Error('Erro ao deletar perfil do usuário')
      }

      toast.success(
        `✅ Usuário e todos os dados do tenant foram removidos permanentemente!`,
        'Exclusão Completa'
      )
      fetchUsuarios()
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      toast.error(
        error.message || 'Erro ao excluir usuário e dados. Algumas informações podem não ter sido removidas.',
        'Erro na Exclusão'
      )
    } finally {
      setLoading(false)
    }
  }

  const enviarResetSenha = async (usuario: Usuario) => {
    try {
      const redirectUrl = window.location.origin.includes('github.io')
        ? 'https://andrethiagohass.github.io/JamesTransportes/auth-callback.html'
        : `${window.location.origin}/auth-callback.html`

      const { error } = await supabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: redirectUrl
      })

      if (error) throw error

      toast.success(
        `Link de reset de senha enviado para ${usuario.email}. O link expira em 1 hora.`,
        'Email Enviado'
      )
    } catch (error: any) {
      console.error('Erro ao enviar reset de senha:', error)
      toast.error(
        error.message || 'Erro ao enviar email de recuperação',
        'Erro ao Enviar Email'
      )
    }
  }

  const toggleAtivo = async (usuario: Usuario) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ ativo: !usuario.ativo })
      .eq('id', usuario.id)

    if (error) {
      console.error('Erro ao atualizar:', error)
      toast.error('Erro ao atualizar status')
    } else {
      toast.success(
        `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso`
      )
      fetchUsuarios()
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEmail('')
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
              <label className="label flex items-center gap-2">
                <Mail size={16} />
                Email (Login)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="usuario@email.com"
                required
                disabled={!!editingId}
              />
              {editingId && (
                <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
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
                    Email
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
                      {usuario.email}
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
                              onClick={() => enviarResetSenha(usuario)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Enviar email de reset de senha"
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(usuario)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(usuario.id, usuario.tenant_id, usuario.nome || usuario.email)}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir usuário e todos os dados"
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

      {/* Backup de Dados */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Database size={20} />
          Backup de Dados
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Exporte todos os dados do sistema. O plano gratuito do Supabase <strong>não inclui backups automáticos</strong> — faça backup regularmente.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              setExporting('json')
              try {
                const total = await exportJSON(user!.tenant_id)
                toast.success(`Backup JSON exportado com ${total} registros!`, 'Backup Completo')
              } catch (err: any) {
                toast.error(err.message || 'Erro ao exportar backup')
              } finally {
                setExporting(null)
              }
            }}
            disabled={exporting !== null}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            {exporting === 'json' ? 'Exportando...' : 'Exportar JSON'}
          </button>
          <button
            onClick={async () => {
              setExporting('sql')
              try {
                const total = await exportSQL(user!.tenant_id)
                toast.success(`Backup SQL exportado com ${total} registros!`, 'Backup Completo')
              } catch (err: any) {
                toast.error(err.message || 'Erro ao exportar backup')
              } finally {
                setExporting(null)
              }
            }}
            disabled={exporting !== null}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            {exporting === 'sql' ? 'Exportando...' : 'Exportar SQL'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>JSON:</strong> formato completo para reimportação &nbsp;|&nbsp; <strong>SQL:</strong> cole diretamente no Supabase SQL Editor para restaurar
        </p>
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
          <li>• ✨ <strong>Novidade:</strong> Usuários agora são criados via Supabase Auth (seguro!)</li>
          <li>• 🔒 Senhas são gerenciadas pelo Supabase (criptografia robusta)</li>
          <li>• 📧 <strong>Importante:</strong> Usuário receberá email de confirmação ao ser criado</li>
          <li>• 🔑 Para alterar senha, usuário deve usar "Esqueci minha senha" no login</li>
          <li>• 🔐 <strong className="text-orange-700">Reset de Senha:</strong> Clique no ícone de chave (🔑) ao lado do usuário para enviar email de recuperação. O link expira em 1 hora.</li>
          <li className="pt-2 border-t border-blue-200">
            • 🗑️ <strong className="text-red-700">EXCLUSÃO PERMANENTE:</strong> Ao excluir um usuário, 
            TODOS os dados do tenant são removidos (lançamentos, configurações, etc). 
            <strong className="text-red-700"> Esta ação é IRREVERSÍVEL!</strong>
          </li>
        </ul>
      </div>

      {/* Modal de Senha Criada */}
      {showPasswordModal && createdUserInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Key className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ✅ Usuário Criado com Sucesso!
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">Email:</p>
                    <p className="text-blue-800 font-mono break-all">{createdUserInfo.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">Senha temporária:</p>
                    <p className="text-amber-800 font-mono text-lg break-all bg-amber-100 px-3 py-2 rounded border border-amber-300">
                      {createdUserInfo.senha}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ IMPORTANTE:</strong> Esta senha <strong>NÃO</strong> é enviada por email!
                  Você deve informá-la ao usuário manualmente.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>📧 Próximos passos:</strong>
                </p>
                <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
                  <li>Usuário receberá email de confirmação</li>
                  <li>Deve clicar no link do email para ativar a conta</li>
                  <li>Depois poderá fazer login com email e senha informada</li>
                  <li>Pode alterar a senha em "Esqueci minha senha"</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Email: ${createdUserInfo.email}\nSenha: ${createdUserInfo.senha}`)
                  toast.success('Credenciais copiadas para área de transferência!')
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                📋 Copiar Credenciais
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setCreatedUserInfo(null)
                }}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                OK, Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
