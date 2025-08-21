import { supabase } from './client'
import { userService } from './user'

// Tipos
export interface ClinicConfig {
  id?: string
  clinicaId?: string
  categoria: string
  configuracoes: any
}

// Categorias de configuração
export type ConfigCategory = 
  | 'exibicao'
  | 'agenda'
  | 'pacientes'
  | 'financeiro'
  | 'interface'
  | 'comunicacao'
  | 'documentos'
  | 'seguranca'
  | 'integracao';

// Serviço de configurações
export const configService = {
  // Obter configurações por categoria
  getConfig: async <T = any>(categoria: ConfigCategory): Promise<T | null> => {
    try {
      // Para desenvolvimento, vamos permitir acesso sem autenticação
      // const currentProfile = await userService.getCurrentUserProfile()
      // if (!currentProfile || !currentProfile.clinicaId) return null
      
      // Usar ID de clínica fixo para desenvolvimento
      const clinicaId = '1'

      const { data, error } = await supabase
        .from('configuracoes_clinica')
        .select('configuracoes')
        .eq('clinica_id', clinicaId)
        .eq('categoria', categoria)
        .single()

      if (error) {
        // Se não encontrar, retorna null (não é um erro crítico)
        if (error.code === 'PGRST116') {
          return null
        }
        console.error(`Erro ao buscar configurações de ${categoria}:`, error)
        return null
      }
      
      return data?.configuracoes as T || null
    } catch (error) {
      console.error(`Erro ao buscar configurações de ${categoria}:`, error)
      return null
    }
  },

  // Atualizar configurações
  updateConfig: async <T = any>(categoria: ConfigCategory, configuracoes: T): Promise<{ success: boolean, error?: any }> => {
    try {
      // Para desenvolvimento, vamos permitir acesso sem autenticação
      // const currentProfile = await userService.getCurrentUserProfile()
      // if (!currentProfile || !currentProfile.clinicaId) {
      //   return { success: false, error: 'Usuário não autenticado ou sem clínica' }
      // }
      
      // Usar ID de clínica fixo para desenvolvimento
      const clinicaId = '1'

      // Verificar se a configuração já existe
      const { data: existingConfig, error: queryError } = await supabase
        .from('configuracoes_clinica')
        .select('id')
        .eq('clinica_id', clinicaId)
        .eq('categoria', categoria)
        .single()

      if (queryError && queryError.code !== 'PGRST116') {
        return { success: false, error: queryError }
      }

      if (existingConfig) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracoes_clinica')
          .update({ configuracoes })
          .eq('id', existingConfig.id)

        if (error) return { success: false, error }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracoes_clinica')
          .insert([{
            clinica_id: clinicaId,
            categoria,
            configuracoes
          }])

        if (error) return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      console.error(`Erro ao atualizar configurações de ${categoria}:`, error)
      return { success: false, error }
    }
  },

  // Obter todas as configurações
  getAllConfigs: async (): Promise<Record<ConfigCategory, any> | null> => {
    try {
      // Para desenvolvimento, vamos permitir acesso sem autenticação
      // const currentProfile = await userService.getCurrentUserProfile()
      // if (!currentProfile || !currentProfile.clinicaId) return null
      
      // Usar ID de clínica fixo para desenvolvimento
      const clinicaId = '1'

      const { data, error } = await supabase
        .from('configuracoes_clinica')
        .select('categoria, configuracoes')
        .eq('clinica_id', clinicaId)

      if (error) {
        console.error('Erro ao buscar todas as configurações:', error)
        return null
      }

      // Converter array para objeto
      const configs: Record<string, any> = {}
      if (data) {
        data.forEach(item => {
          configs[item.categoria] = item.configuracoes
        })
      }

      return configs as Record<ConfigCategory, any>
    } catch (error) {
      console.error('Erro ao buscar todas as configurações:', error)
      return null
    }
  },

  // Obter configurações de dashboard
  getDashboardConfig: async (): Promise<string[]> => {
    try {
      const interfaceConfig = await configService.getConfig<{ dashboard_cards: string[] }>('interface')
      
      // Se não encontrar configurações, retorna os cards padrão
      if (!interfaceConfig || !interfaceConfig.dashboard_cards) {
        return ['pacientes', 'consultas', 'receita', 'profissionais', 'atividade', 'agenda']
      }
      
      return interfaceConfig.dashboard_cards
    } catch (error) {
      console.error('Erro ao buscar configurações do dashboard:', error)
      return ['pacientes', 'consultas', 'receita', 'profissionais', 'atividade', 'agenda']
    }
  },

  // Atualizar configurações de dashboard
  updateDashboardConfig: async (cards: string[]): Promise<{ success: boolean, error?: any }> => {
    try {
      console.log('Salvando configurações do dashboard:', cards)
      
      // Buscar configurações atuais
      const interfaceConfig = await configService.getConfig<any>('interface') || {}
      
      // Atualizar configurações
      const result = await configService.updateConfig('interface', {
        ...interfaceConfig,
        dashboard_cards: cards
      })
      
      console.log('Resultado do salvamento:', result)
      
      return result
    } catch (error) {
      console.error('Erro ao atualizar configurações do dashboard:', error)
      return { success: false, error }
    }
  }
}

export default configService

