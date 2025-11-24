import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Credenciais (em produção, isso deveria estar no backend/Supabase)
const VALID_USERS = [
  { username: 'admin', password: 'james2025' },
  { username: 'james', password: 'transportes123' },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar se já está autenticado ao carregar
  useEffect(() => {
    const authToken = localStorage.getItem('james_auth_token')
    if (authToken === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const user = VALID_USERS.find(
      u => u.username === username && u.password === password
    )

    if (user) {
      setIsAuthenticated(true)
      localStorage.setItem('james_auth_token', 'authenticated')
      localStorage.setItem('james_username', username)
      return true
    }

    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('james_auth_token')
    localStorage.removeItem('james_username')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
