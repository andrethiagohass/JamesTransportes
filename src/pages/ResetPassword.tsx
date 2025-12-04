import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  useEffect(() => {
    // Verificar se há code PKCE na URL
    const searchParams = new URLSearchParams(location.search);
    const pkceCode = searchParams.get('code');
    
    console.log('🔍 ResetPassword - Iniciando verificação');
    console.log('  - PKCE code:', pkceCode || '(não)');
    console.log('  - Hash:', location.hash || '(não)');
    console.log('  - Search:', location.search || '(não)');
    
    // Se tem PKCE code, o Supabase vai processar automaticamente
    if (pkceCode) {
      console.log('✅ PKCE code detectado - aguardando Supabase processar...');
      setIsValidToken(true);
      
      // Verificar se sessão foi criada após alguns instantes
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 Verificando sessão após PKCE:', !!session);
        
        if (session) {
          console.log('✅ Sessão criada com sucesso via PKCE');
          setIsValidToken(true);
        } else {
          console.log('⚠️ Aguardando mais um pouco...');
          // Tentar mais uma vez após 2 segundos
          setTimeout(async () => {
            const { data: { session: session2 } } = await supabase.auth.getSession();
            if (session2) {
              console.log('✅ Sessão criada (segunda tentativa)');
              setIsValidToken(true);
            } else {
              setErrorMessage('Erro ao processar link de recuperação');
              toast.error('Link inválido ou expirado', 'Erro');
            }
          }, 2000);
        }
      }, 1000);
      return;
    }
    
    // Tentar recuperar hash do localStorage se não estiver na URL
    let currentHash = location.hash;
    
    if (!currentHash || currentHash.length <= 1) {
      const savedHash = localStorage.getItem('supabase_recovery_hash');
      if (savedHash) {
        console.log('🔄 Recuperando hash do localStorage:', savedHash);
        currentHash = savedHash;
        // Limpar do localStorage após usar
        localStorage.removeItem('supabase_recovery_hash');
        // Atualizar a URL com o hash
        window.history.replaceState(null, '', window.location.pathname + savedHash);
      }
    }
    
    // Verificar se há erro na URL (link expirado, etc)
    const hashParams = new URLSearchParams(currentHash.substring(1))
    const error = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')
    const errorCode = hashParams.get('error_code')
    const type = hashParams.get('type')

    if (error) {
      let message = 'Link de recuperação inválido ou expirado'
      
      if (errorCode === 'otp_expired') {
        message = 'O link de recuperação expirou. Por favor, solicite um novo link.'
      } else if (errorDescription) {
        message = errorDescription.replace(/\+/g, ' ')
      }
      
      setErrorMessage(message)
      setIsValidToken(false)
      toast.error(message, 'Link Inválido')
      return
    }

    // Verificar se é um link de recuperação de senha (Implicit Flow)
    const checkToken = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('🔑 Verificando token de recuperação:', {
        hasSession: !!session,
        type: type,
        hash: location.hash
      })
      
      // Verificar se há sessão E se é do tipo recovery
      if (session && type === 'recovery') {
        console.log('✅ Token de recuperação válido')
        setIsValidToken(true)
      } else if (session) {
        console.log('⚠️ Sessão normal detectada, mas não é recovery')
        setIsValidToken(true) // Permitir mesmo assim (pode ser token na URL)
      } else {
        // Se não tem sessão mas tem hash, esperar um pouco
        if (location.hash && location.hash.includes('access_token')) {
          console.log('⏳ Hash detectado, aguardando processamento do Supabase...')
          setTimeout(() => {
            window.location.reload() // Recarregar para processar o hash
          }, 1000)
        } else {
          const message = 'Link de recuperação inválido ou expirado'
          setErrorMessage(message)
          toast.error(message, 'Token Inválido')
          // NÃO redirecionar automaticamente - deixar usuário ver a mensagem
        }
      }
    }

    checkToken()
  }, [navigate, toast, location.hash])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.warning('Por favor, preencha todos os campos', 'Campos Obrigatórios')
      return
    }

    if (password.length < 6) {
      toast.warning('A senha deve ter no mínimo 6 caracteres', 'Senha Fraca')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem', 'Erro de Validação')
      return
    }

    setLoading(true)

    try {
      // Atualizar senha
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Erro ao atualizar senha:', error)
        toast.error(error.message, 'Erro ao Atualizar Senha')
        return
      }

      toast.success('Senha atualizada com sucesso! Redirecionando...', 'Sucesso')
      
      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast.error('Erro ao processar solicitação', 'Erro')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Link Expirado
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'O link de recuperação está inválido ou expirado.'}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Links de recuperação expiram em 1 hora por segurança.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl"
          >
            Voltar ao Login
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Solicite um novo link de recuperação na página de login
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Nova Senha
          </h1>
          <p className="text-gray-600">
            Digite sua nova senha abaixo
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                placeholder="Digite sua nova senha"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo de 6 caracteres
            </p>
          </div>

          {/* Campo de Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                placeholder="Confirme sua nova senha"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botão de Atualizar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando...
              </span>
            ) : (
              'Atualizar Senha'
            )}
          </button>

          {/* Link para voltar ao login */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
