import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrecoKm from './pages/PrecoKm'
import PrecoKg from './pages/PrecoKg'
import TaxaArrancada from './pages/TaxaArrancada'
import PrecoEntrega from './pages/PrecoEntrega'
import Lancamentos from './pages/Lancamentos'
import Relatorios from './pages/Relatorios'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  // Aguardar verificação de sessão antes de redirecionar
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Componente principal das rotas
const AppRoutes = () => {
  const { isAuthenticated, login } = useAuth()

  return (
    <Routes>
      {/* Rota de Reset de Senha (SEMPRE pública, sem verificação de auth) */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rota de Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLogin={login} />
          )
        } 
      />

      {/* Rotas Protegidas */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Redirecionar raiz para dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/preco-km" element={<PrecoKm />} />
                <Route path="/preco-kg" element={<PrecoKg />} />
                <Route path="/taxa-arrancada" element={<TaxaArrancada />} />
                <Route path="/preco-entrega" element={<PrecoEntrega />} />
                <Route path="/lancamentos" element={<Lancamentos />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/admin" element={<Admin />} />
                {/* Rota 404 - redireciona para dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  // Interceptar tokens de recovery ANTES do React Router processar
  // Isso evita que o hash seja perdido
  if (typeof window !== 'undefined') {
    const hash = window.location.hash
    const pathname = window.location.pathname
    const isRecoveryToken = hash.includes('type=recovery') || 
                           (hash.includes('access_token') && hash.includes('type='))
    const isNotOnResetPage = !pathname.includes('/reset-password')
    
    // IMPORTANTE: Só redirecionar se não estivermos JÁ na página de reset
    // E se o pathname ainda não tiver /reset-password
    if (isRecoveryToken && isNotOnResetPage && !hash.includes('#/reset-password')) {
      console.log('🚨 INTERCEPTANDO: Token de recovery detectado, redirecionando...')
      console.log('  - pathname atual:', pathname)
      console.log('  - hash:', hash.substring(0, 100) + '...') // Truncar para não logar token completo
      
      // Extrair apenas o hash de autenticação (remover possíveis duplicações)
      const cleanHash = hash.split('#/reset-password')[0] // Pegar só a primeira parte
      
      // Redirecionar uma ÚNICA vez usando replace para não adicionar ao histórico
      window.location.replace(`${window.location.origin}/JamesTransportes/reset-password${cleanHash}`)
      
      // Retornar null para não renderizar nada durante o redirect
      return null
    }
  }

  return (
    <Router basename="/JamesTransportes">
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
