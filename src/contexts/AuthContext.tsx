import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

interface User {
  id: string
  username: string
  nome: string | null
  empresa: string | null
  logo_url: string | null
  role: string
  tenant_id: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar se já está autenticado ao carregar
  useEffect(() => {
    const authToken = localStorage.getItem('james_auth_token')
    const authExpiry = localStorage.getItem('james_auth_expiry')
    const userData = localStorage.getItem('james_user_data')
    
    if (authToken && authExpiry && userData) {
      const expiryTime = parseInt(authExpiry)
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      } else {
        // Token expirado
        localStorage.removeItem('james_auth_token')
        localStorage.removeItem('james_auth_expiry')
        localStorage.removeItem('james_username')
        localStorage.removeItem('james_user_data')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuário no banco de dados
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('id, username, password_hash, nome, empresa, logo_url, role, tenant_id')
        .eq('username', username)
        .eq('ativo', true)
        .single()

      if (error || !user) {
        console.error('Usuário não encontrado:', error)
        return false
      }

      // Verificar senha usando bcrypt
      const senhaValida = await bcrypt.compare(password, user.password_hash)

      if (!senhaValida) {
        console.error('Senha incorreta')
        return false
      }

      // Criar objeto de usuário sem o password_hash
      const userData: User = {
        id: user.id,
        username: user.username,
        nome: user.nome,
        empresa: user.empresa,
        logo_url: user.logo_url,
        role: user.role,
        tenant_id: user.tenant_id
      }

      // Autenticação bem-sucedida
      setIsAuthenticated(true)
      setUser(userData)
      
      // Salvar token com expiração de 7 dias
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
      localStorage.setItem('james_auth_token', 'authenticated')
      localStorage.setItem('james_auth_expiry', expiryTime.toString())
      localStorage.setItem('james_username', user.nome || username)
      localStorage.setItem('james_user_data', JSON.stringify(userData))
      
      return true
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('james_auth_token')
    localStorage.removeItem('james_auth_expiry')
    localStorage.removeItem('james_username')
    localStorage.removeItem('james_user_data')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
