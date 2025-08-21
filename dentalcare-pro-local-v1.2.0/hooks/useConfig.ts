'use client'

import { useState, useEffect } from 'react'
import { configService, ConfigCategory } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useConfig<T = any>(categoria: ConfigCategory) {
  const { user } = useAuth()
  const [config, setConfig] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const configData = await configService.getConfig<T>(categoria)
        setConfig(configData)
      } catch (err: any) {
        console.error(`Erro ao carregar configurações de ${categoria}:`, err)
        setError(err.message || `Erro ao carregar configurações de ${categoria}`)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [categoria])

  // Atualizar configurações
  const updateConfig = async (updatedConfig: T) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await configService.updateConfig<T>(categoria, updatedConfig)
      
      if (result.success) {
        setConfig(updatedConfig)
        return { success: true }
      } else {
        setError(result.error || 'Erro ao atualizar configurações')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error(`Erro ao atualizar configurações de ${categoria}:`, err)
      setError(err.message || 'Erro ao atualizar configurações')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { config, loading, error, updateConfig }
}

// Hook específico para configurações do dashboard
export function useDashboardConfig() {
  const [cards, setCards] = useState<string[]>(['pacientes', 'consultas', 'receita', 'profissionais'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações do dashboard
  useEffect(() => {
    const loadDashboardConfig = async () => {
      try {
        setLoading(true)
        console.log('Carregando configurações do dashboard...')
        const dashboardCards = await configService.getDashboardConfig()
        console.log('Configurações carregadas:', dashboardCards)
        setCards(dashboardCards)
      } catch (err: any) {
        console.error('Erro ao carregar configurações do dashboard:', err)
        setError(err.message || 'Erro ao carregar configurações do dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardConfig()
  }, [])

  // Atualizar configurações do dashboard
  const updateDashboardConfig = async (updatedCards: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Atualizando configurações do dashboard:', updatedCards)
      const result = await configService.updateDashboardConfig(updatedCards)
      console.log('Resultado da atualização:', result)
      
      if (result.success) {
        setCards(updatedCards)
        return { success: true }
      } else {
        setError(result.error || 'Erro ao atualizar configurações do dashboard')
        return { success: false, error: result.error }
      }
    } catch (err: any) {
      console.error('Erro ao atualizar configurações do dashboard:', err)
      setError(err.message || 'Erro ao atualizar configurações do dashboard')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { cards, loading, error, updateDashboardConfig }
}

export default useConfig

