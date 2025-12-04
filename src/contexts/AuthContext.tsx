import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  nome: string | null
  empresa: string | null
  logo_url: string | null
  role: string
  tenant_id: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar sessão ao carregar
  useEffect(() => {
    checkSession()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth event:', event) // Debug
      console.log('  - pathname:', window.location.pathname) // Debug
      console.log('  - hash:', window.location.hash) // Debug
      console.log('  - session:', session ? 'exists' : 'null') // Debug
      
      // Ignorar eventos de autenticação na página de reset de senha
      const isResetPasswordPage = window.location.pathname.includes('/reset-password') || 
                                   window.location.hash.includes('type=recovery')
      
      if (isResetPasswordPage) {
        console.log('⚠️ Página de reset de senha detectada - ignorando evento de auth')
        setLoading(false)
        return
      }
      
      if (event === 'SIGNED_IN') {
        console.log('Usuário logado, carregando perfil...')
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token atualizado')
      }
      
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkSession = async () => {
    try {
      // Não verificar sessão se estiver em página de reset de senha
      const isResetPasswordPage = window.location.pathname.includes('/reset-password') || 
                                   window.location.hash.includes('type=recovery')
      
      console.log('🔍 checkSession chamado')
      console.log('  - pathname:', window.location.pathname)
      console.log('  - hash:', window.location.hash)
      console.log('  - isResetPasswordPage:', isResetPasswordPage)
      
      if (isResetPasswordPage) {
        console.log('⚠️ Página de reset - não verificando sessão')
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      console.log('  - session:', session ? 'exists' : 'null')
      
      if (session?.user) {
        await loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error)
      setLoading(false)
    }
  }

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !profile) {
        console.error('Perfil não encontrado:', error)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Verificar se usuário está ativo
      if (!profile.ativo) {
        console.error('Usuário inativo')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Criar objeto de usuário
      const userData: User = {
        id: authUser.id,
        email: authUser.email || '',
        nome: profile.nome,
        empresa: profile.empresa,
        logo_url: profile.logo_url,
        role: profile.role,
        tenant_id: profile.tenant_id
      }

      setIsAuthenticated(true)
      setUser(userData)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Autenticar com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Erro ao fazer login:', error.message)
        return false
      }

      if (!data.user) {
        console.error('Usuário não encontrado')
        return false
      }

      // loadUserProfile será chamado automaticamente pelo onAuthStateChange
      return true
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
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
