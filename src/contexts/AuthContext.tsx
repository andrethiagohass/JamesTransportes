import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificar se já está autenticado ao carregar
  useEffect(() => {
    const authToken = localStorage.getItem('james_auth_token')
    const authExpiry = localStorage.getItem('james_auth_expiry')
    
    if (authToken && authExpiry) {
      const expiryTime = parseInt(authExpiry)
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true)
      } else {
        // Token expirado
        localStorage.removeItem('james_auth_token')
        localStorage.removeItem('james_auth_expiry')
        localStorage.removeItem('james_username')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuário no banco de dados
      const { data: user, error } = await supabase
        .from('usuarios')
        .select('*')
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

      // Autenticação bem-sucedida
      setIsAuthenticated(true)
      
      // Salvar token com expiração de 7 dias
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
      localStorage.setItem('james_auth_token', 'authenticated')
      localStorage.setItem('james_auth_expiry', expiryTime.toString())
      localStorage.setItem('james_username', user.nome || username)
      
      return true
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('james_auth_token')
    localStorage.removeItem('james_auth_expiry')
    localStorage.removeItem('james_username')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
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
