import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrecoKm from './pages/PrecoKm'
import PrecoKg from './pages/PrecoKg'
import TaxaArrancada from './pages/TaxaArrancada'
import Lancamentos from './pages/Lancamentos'
import Relatorios from './pages/Relatorios'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Componente principal das rotas
const AppRoutes = () => {
  const { isAuthenticated, login } = useAuth()
  
  // Detectar se é uma URL de reset de senha
  const isResetPasswordUrl = window.location.pathname.includes('/reset-password') || 
                             window.location.hash.includes('type=recovery')

  return (
    <Routes>
      {/* Rota de Reset de Senha (SEMPRE pública, sem verificação de auth) */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rota de Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && !isResetPasswordUrl ? (
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
