'use client'

import { useState, useEffect } from 'react'
import { Settings, Eye, EyeOff, Save, X } from 'lucide-react'
import { useDashboardConfig } from '../../hooks/useConfig'
import { 
  PacientesCard, 
  ConsultasHojeCard, 
  ReceitaMensalCard, 
  ProfissionaisCard,
  AtividadeRecenteCard,
  AgendaDoDiaCard
} from './DashboardCard'

interface DashboardCard {
  id: string
  title: string
  enabled: boolean
  order: number
  component: React.ReactNode
}

interface EditableDashboardCardsProps {
  editMode?: boolean
  onToggleEditMode?: () => void
}

export default function EditableDashboardCards({ 
  editMode = false, 
  onToggleEditMode 
}: EditableDashboardCardsProps) {
  const { cards: enabledCardIds, updateDashboardConfig, loading: configLoading } = useDashboardConfig()
  const [loading, setLoading] = useState(true)
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([])
  const [saving, setSaving] = useState(false)

  // Definir todos os cards disponíveis
  const allAvailableCards: Omit<DashboardCard, 'enabled' | 'order'>[] = [
    {
      id: 'pacientes',
      title: 'Pacientes',
      component: <PacientesCard count={24} loading={loading} />
    },
    {
      id: 'consultas',
      title: 'Consultas Hoje',
      component: <ConsultasHojeCard count={8} loading={loading} />
    },
    {
      id: 'receita',
      title: 'Receita Mensal',
      component: <ReceitaMensalCard value="R$ 12.500" loading={loading} />
    },
    {
      id: 'profissionais',
      title: 'Profissionais',
      component: <ProfissionaisCard count={3} loading={loading} />
    },
    {
      id: 'atividade',
      title: 'Atividade Recente',
      component: <AtividadeRecenteCard loading={loading} />
    },
    {
      id: 'agenda',
      title: 'Agenda do Dia',
      component: <AgendaDoDiaCard loading={loading} />
    }
  ]

  // Processar preferências do dashboard
  useEffect(() => {
    if (!configLoading) {
      console.log('Cards habilitados:', enabledCardIds)
      
      // Mapear IDs para objetos de card completos
      const processedCards = allAvailableCards.map(card => ({
        ...card,
        enabled: enabledCardIds.includes(card.id),
        order: enabledCardIds.includes(card.id) 
          ? enabledCardIds.indexOf(card.id) 
          : 999 // Colocar cards desabilitados no final
      }))
      
      // Ordenar cards
      const sortedCards = processedCards.sort((a, b) => {
        if (a.enabled && !b.enabled) return -1
        if (!a.enabled && b.enabled) return 1
        return a.order - b.order
      })
      
      setDashboardCards(sortedCards)
      setLoading(false)
    }
  }, [enabledCardIds, configLoading])

  // Toggle card visibility
  const toggleCard = (cardId: string) => {
    const updatedCards = dashboardCards.map(card => 
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    )
    setDashboardCards(updatedCards)
  }

  // Salvar configurações
  const saveConfiguration = async () => {
    try {
      setSaving(true)
      
      // Obter apenas os cards habilitados na ordem atual
      const enabledIds = dashboardCards
        .filter(card => card.enabled)
        .sort((a, b) => a.order - b.order)
        .map(card => card.id)
      
      console.log('Salvando configuração:', enabledIds)
      
      const result = await updateDashboardConfig(enabledIds)
      
      if (result.success) {
        console.log('Configuração salva com sucesso!')
        if (onToggleEditMode) {
          onToggleEditMode() // Sair do modo de edição
        }
      } else {
        console.error('Erro ao salvar configuração:', result.error)
        alert('Erro ao salvar configurações. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edição
  const cancelEdit = () => {
    // Restaurar estado original
    const processedCards = allAvailableCards.map(card => ({
      ...card,
      enabled: enabledCardIds.includes(card.id),
      order: enabledCardIds.includes(card.id) 
        ? enabledCardIds.indexOf(card.id) 
        : 999
    }))
    
    const sortedCards = processedCards.sort((a, b) => {
      if (a.enabled && !b.enabled) return -1
      if (!a.enabled && b.enabled) return 1
      return a.order - b.order
    })
    
    setDashboardCards(sortedCards)
    
    if (onToggleEditMode) {
      onToggleEditMode()
    }
  }

  // Filtrar cards habilitados
  const enabledCards = dashboardCards.filter(card => card.enabled)
  
  // Separar cards principais e secundários
  const primaryCards = enabledCards.filter(card => 
    ['pacientes', 'consultas', 'receita', 'profissionais'].includes(card.id)
  )
  
  const secondaryCards = enabledCards.filter(card => 
    ['atividade', 'agenda'].includes(card.id)
  )

  if (loading || configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com botão de edição */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">Bem-vindo ao DentalCare Pro</div>
        </div>
        
        {onToggleEditMode && (
          <div className="flex items-center space-x-3">
            {editMode ? (
              <>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={saveConfiguration}
                  disabled={saving}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button
                onClick={onToggleEditMode}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                Editar Cards
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modo de edição */}
      {editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-4">Configurar Cards do Dashboard</h3>
          <p className="text-blue-700 text-sm mb-4">
            Clique nos cards abaixo para ativá-los ou desativá-los no seu dashboard.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dashboardCards.map(card => (
              <button
                key={card.id}
                onClick={() => toggleCard(card.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  card.enabled
                    ? 'bg-blue-100 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">{card.title}</span>
                {card.enabled ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards Principais */}
      {primaryCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {primaryCards.map(card => (
            <div key={card.id}>
              {card.component}
            </div>
          ))}
        </div>
      )}

      {/* Cards Secundários */}
      {secondaryCards.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {secondaryCards.map(card => (
            <div key={card.id}>
              {card.component}
            </div>
          ))}
        </div>
      )}
      
      {/* Mensagem quando não há cards */}
      {enabledCards.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum card ativado</h2>
          <p className="text-gray-600 mb-4">
            {editMode 
              ? 'Clique nos cards acima para ativá-los no dashboard.'
              : 'Clique em "Editar Cards" para configurar quais cards deseja exibir.'
            }
          </p>
          {onToggleEditMode && !editMode && (
            <button
              onClick={onToggleEditMode}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar Cards
            </button>
          )}
        </div>
      )}
    </div>
  )
}

