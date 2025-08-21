'use client'

import { useState, useEffect } from 'react'
import { userService, UserProfile, UserPermissions } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar usuários da clínica
  useEffect(() => {
    const loadUsers = async () => {
      if (!user) {
        setUsers([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const clinicUsers = await userService.getClinicUsers()
        setUsers(clinicUsers)
      } catch (err: any) {
        console.error('Erro ao carregar usuários:', err)
        setError(err.message || 'Erro ao carregar usuários')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [user])

  // Convidar novo usuário
  const inviteUser = async (userData: {
    nome: string,
    email: string,
    tipo: 'gerente' | 'usuario',
    permissoes: UserPermissions
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await userService.inviteUser(userData)
      
      if (result.success) {
        // Recarregar lista de usuários
        const clinicUsers = await userService.getClinicUsers()
        setUsers(clinicUsers)
        return { success: true }
      } else {
        setError(result.error || 'Erro ao convidar usuário')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error('Erro ao convidar usuário:', err)
      setError(err.message || 'Erro ao convidar usuário')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Atualizar permissões de um usuário
  const updateUserPermissions = async (userId: string, permissions: UserPermissions) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await userService.updateUserPermissions(userId, permissions)
      
      if (result.success) {
        // Recarregar lista de usuários
        const clinicUsers = await userService.getClinicUsers()
        setUsers(clinicUsers)
        return { success: true }
      } else {
        setError(result.error || 'Erro ao atualizar permissões')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error('Erro ao atualizar permissões:', err)
      setError(err.message || 'Erro ao atualizar permissões')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Remover um usuário
  const removeUser = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await userService.removeUser(userId)
      
      if (result.success) {
        // Atualizar lista local
        setUsers(users.filter(user => user.id !== userId))
        return { success: true }
      } else {
        setError(result.error || 'Erro ao remover usuário')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error('Erro ao remover usuário:', err)
      setError(err.message || 'Erro ao remover usuário')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { users, loading, error, inviteUser, updateUserPermissions, removeUser }
}

export default useUsers

