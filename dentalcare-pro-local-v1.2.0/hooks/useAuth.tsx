'use client'

import React, { useState, useEffect, createContext, useContext } from 'react'
import { authService, userService, AuthUser, UserProfile } from '../lib/supabase'

// Tipo do contexto de autenticação
interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nome: string, clinicaNome: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

// Criar contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider de autenticação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar usuário atual
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        
        // Verificar se há um usuário autenticado
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        
        // Se houver usuário, carregar perfil
        if (currentUser) {
          const userProfile = await userService.getCurrentUserProfile()
          setProfile(userProfile)
        }
      } catch (err) {
        console.error('Erro ao carregar usuário:', err)
        setError('Erro ao carregar usuário')
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Configurar listener de mudanças de autenticação
    const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const userProfile = await userService.getCurrentUserProfile()
        setProfile(userProfile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    // Limpar listener ao desmontar
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { user } = await authService.signIn({ email, password })
      setUser(user)
      
      if (user) {
        const userProfile = await userService.getCurrentUserProfile()
        setProfile(userProfile)
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err)
      setError(err.message || 'Erro ao fazer login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cadastro
  const signUp = async (email: string, password: string, nome: string, clinicaNome: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await authService.signUp({ email, password, nome, clinicaNome })
      
      // Após cadastro, fazer login automaticamente
      await signIn(email, password)
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err)
      setError(err.message || 'Erro ao cadastrar')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
      setUser(null)
      setProfile(null)
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err)
      setError(err.message || 'Erro ao fazer logout')
    } finally {
      setLoading(false)
    }
  }

  // Redefinir senha
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.resetPassword(email)
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err)
      setError(err.message || 'Erro ao redefinir senha')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Valor do contexto
  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default useAuth

