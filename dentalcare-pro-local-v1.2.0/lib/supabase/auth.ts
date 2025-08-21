import { supabase } from './client'
import { User, Session } from '@supabase/supabase-js'

// Tipos
export type AuthUser = User
export type AuthSession = Session

export interface SignUpCredentials {
  email: string
  password: string
  nome: string
  clinicaNome: string
}

export interface SignInCredentials {
  email: string
  password: string
}

// Serviço de autenticação
export const authService = {
  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Obter sessão atual
  getCurrentSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Registrar novo usuário
  signUp: async ({ email, password, nome, clinicaNome }: SignUpCredentials) => {
    // 1. Criar usuário na autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    // 2. Criar clínica
    const { data: clinicaData, error: clinicaError } = await supabase
      .from('clinicas')
      .insert([{ nome: clinicaNome }])
      .select('id')
      .single()

    if (clinicaError) throw clinicaError

    // 3. Criar usuário na tabela personalizada
    const { error: userError } = await supabase
      .from('usuarios')
      .insert([{
        auth_id: authData.user?.id,
        clinica_id: clinicaData.id,
        nome,
        email,
        tipo: 'master', // Primeiro usuário é sempre master
        status: 'ativo'
      }])

    if (userError) throw userError

    return authData
  },

  // Login
  signIn: async ({ email, password }: SignInCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Redefinir senha
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  // Atualizar senha
  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    if (error) throw error
  },

  // Configurar listener de mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session)
    })
  }
}

export default authService

