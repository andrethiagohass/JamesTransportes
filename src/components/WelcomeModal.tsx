import { useState, useEffect } from 'react'
import { X, Rocket, Settings, FileText, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const WelcomeModal = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verificar se já mostrou o welcome
    const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user?.id}`)
    
    if (user && !hasSeenWelcome && user.role !== 'super_admin') {
      // Mostrar após 1 segundo
      setTimeout(() => {
        setIsOpen(true)
      }, 1000)
    }
  }, [user])

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true')
    }
    setIsOpen(false)
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 relative flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Bem-vindo ao Hasstreio!</h2>
              <p className="text-primary-100 mt-1">Sistema de Gestão de Transportes</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Olá, {user.nome || user.email || 'Usuário'}! 👋
            </h3>
            <p className="text-gray-600">
              Sua conta em <strong>{user.empresa}</strong> foi criada com sucesso! 
              Siga os passos abaixo para começar:
            </p>
          </div>

          <div className="space-y-4">
            {/* Passo 1 */}
            <div className="flex gap-4 items-start bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Configure os Preços</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Acesse <strong>Preço/KM</strong>, <strong>Preço/KG</strong> e <strong>Taxa de Arrancada</strong> 
                  para definir seus valores de cobrança.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-4 items-start bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Registre seus Lançamentos</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Vá em <strong>Lançamentos</strong> para registrar suas viagens. 
                  Os valores serão calculados automaticamente.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-4 items-start bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Acompanhe seus Resultados</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Use o <strong>Dashboard</strong> e <strong>Relatórios</strong> para analisar 
                  seu desempenho e gerar PDFs.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              💡 <strong>Dica:</strong> Todos os seus dados são privados e isolados. 
              Apenas você tem acesso aos lançamentos da sua empresa.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-6 btn btn-primary py-3 text-lg"
          >
            Entendi, vamos começar! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal
