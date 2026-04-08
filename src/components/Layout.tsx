import { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  DollarSign, 
  Weight, 
  TrendingUp, 
  PackageCheck,
  FileText, 
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  Tag
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import WelcomeModal from './WelcomeModal'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Rotas do submenu "Tabelas de Preços"
  const pricingRoutes = [
    { name: 'Preço/KM', href: '/preco-km', icon: DollarSign },
    { name: 'Preço/KG', href: '/preco-kg', icon: Weight },
    { name: 'Taxa Arrancada', href: '/taxa-arrancada', icon: TrendingUp },
    { name: 'Valor Entrega', href: '/preco-entrega', icon: PackageCheck },
  ]

  const isPricingActive = pricingRoutes.some(r => location.pathname === r.href)
  const [pricingOpen, setPricingOpen] = useState(isPricingActive)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const username = user?.nome || user?.email || 'Usuário'
  const empresaNome = user?.empresa || 'Hasstreio'
  const userRole = user?.role || 'user'

  const getRoleBadge = () => {
    if (userRole === 'super_admin') {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-purple-500 text-white rounded-full">
          Super Admin
        </span>
      )
    }
    if (userRole === 'admin') {
      return (
        <span className="px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full">
          Admin
        </span>
      )
    }
    return null
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-700 text-white shadow-lg">
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">🚚 {empresaNome}</h1>
              {getRoleBadge()}
            </div>
            
            {/* User info and logout - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User size={18} />
                <span className="font-medium">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-800 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Sair</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-primary-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white shadow-md min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {/* Dashboard */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home size={20} />
              <span>Dashboard</span>
            </Link>

            {/* Submenu: Tabelas de Preços */}
            <div>
              <button
                onClick={() => setPricingOpen(!pricingOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isPricingActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag size={20} />
                  <span>Tabelas de Preços</span>
                </div>
                {pricingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {pricingOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                  {pricingRoutes.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                          isActive(item.href)
                            ? 'bg-primary-100 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Lançamentos */}
            <Link
              to="/lancamentos"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/lancamentos')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              <span>Lançamentos</span>
            </Link>

            {/* Relatórios */}
            <Link
              to="/relatorios"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/relatorios')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              <span>Relatórios</span>
            </Link>

            {/* Admin (super_admin only) */}
            {user?.role === 'super_admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/admin')
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} />
                <span>Administração</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="bg-white w-64 h-full shadow-xl">
              <div className="p-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-4 p-2 rounded-md hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
                
                {/* User info - Mobile */}
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2 text-primary-700 mb-2">
                    <User size={18} />
                    <span className="font-medium">{username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <LogOut size={18} />
                    <span>Sair</span>
                  </button>
                </div>

                <nav className="space-y-2">
                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home size={20} />
                    <span>Dashboard</span>
                  </Link>

                  {/* Submenu: Tabelas de Preços */}
                  <div>
                    <button
                      onClick={() => setPricingOpen(!pricingOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isPricingActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Tag size={20} />
                        <span>Tabelas de Preços</span>
                      </div>
                      {pricingOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {pricingOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                        {pricingRoutes.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                                isActive(item.href)
                                  ? 'bg-primary-100 text-primary-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <Icon size={18} />
                              <span>{item.name}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Lançamentos */}
                  <Link
                    to="/lancamentos"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/lancamentos')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={20} />
                    <span>Lançamentos</span>
                  </Link>

                  {/* Relatórios */}
                  <Link
                    to="/relatorios"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/relatorios')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 size={20} />
                    <span>Relatórios</span>
                  </Link>

                  {/* Admin (super_admin only) */}
                  {user?.role === 'super_admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive('/admin')
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Users size={20} />
                      <span>Administração</span>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
      
      {/* Welcome Modal */}
      <WelcomeModal />
    </div>
  )
}

export default Layout
