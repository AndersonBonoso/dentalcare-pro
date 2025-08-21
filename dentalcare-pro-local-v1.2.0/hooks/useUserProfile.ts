'use client'

import { useState, useEffect } from 'react'
import { userService, UserProfile } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar perfil do usuário
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const userProfile = await userService.getCurrentUserProfile()
        setProfile(userProfile)
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err)
        setError(err.message || 'Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Atualizar perfil
  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    if (!profile) return { success: false, error: 'Perfil não carregado' }

    try {
      setLoading(true)
      setError(null)
      
      // Mesclar perfil atual com atualizações
      const mergedProfile = {
        ...profile,
        ...updatedProfile
      } as UserProfile
      
      const result = await userService.updateUserProfile(mergedProfile)
      
      if (result.success) {
        // Recarregar perfil após atualização
        const userProfile = await userService.getCurrentUserProfile()
        setProfile(userProfile)
        return { success: true }
      } else {
        setError(result.error || 'Erro ao atualizar perfil')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err)
      setError(err.message || 'Erro ao atualizar perfil')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    isLoggedIn: !!profile
  }
}

export default useUserProfile

