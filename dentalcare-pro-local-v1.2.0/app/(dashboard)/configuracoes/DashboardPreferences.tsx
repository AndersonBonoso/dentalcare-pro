'use client'

import { useState, useEffect } from 'react'
import { Settings, MoveVertical, Save } from 'lucide-react'
import { useDashboardConfig } from '../../../hooks/useConfig'

// Tipos para as preferências do dashboard
interface DashboardCard {
  id: string
  title: string
  description: string
  enabled: boolean
  order: number
}

// Componente de preferências do dashboard
export default function DashboardPreferences() {
  const { cards: savedCards, loading: configLoading, updateDashboardConfig } = useDashboardConfig()
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<DashboardCard[]>([])
  const [saving, setSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DashboardCard | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Definição dos cards padrão
  const defaultCards = [
    { 
      id: 'pacientes', 
      title: 'Pacientes', 
      description: 'Exibe o número total de pacientes cadastrados',
      enabled: true,
      order: 0
    },
    { 
      id: 'consultas', 
      title: 'Consultas Hoje', 
      description: 'Exibe o número de consultas agendadas para hoje',
      enabled: true,
      order: 1
    },
    { 
      id: 'receita', 
      title: 'Receita Mensal', 
      description: 'Exibe a receita total do mês atual',
      enabled: true,
      order: 2
    },
    { 
      id: 'profissionais', 
      title: 'Profissionais', 
      description: 'Exibe o número total de profissionais cadastrados',
      enabled: true,
      order: 3
    },
    { 
      id: 'atividade', 
      title: 'Atividade Recente', 
      description: 'Exibe as últimas atividades realizadas no sistema',
      enabled: true,
      order: 4
    },
    { 
      id: 'agenda', 
      title: 'Agenda do Dia', 
      description: 'Exibe os próximos horários agendados para hoje',
      enabled: true,
      order: 5
    }
  ]

  // Carregar preferências do dashboard
  useEffect(() => {
    if (!configLoading) {
      // Converter os IDs salvos para o formato completo dos cards
      const enabledCardIds = new Set(savedCards || [])
      
      const initialCards = defaultCards.map((card, index) => ({
        ...card,
        enabled: enabledCardIds.has(card.id),
        order: enabledCardIds.has(card.id) 
          ? savedCards.indexOf(card.id) 
          : defaultCards.length + index
      }))
      
      // Ordenar cards habilitados primeiro, depois desabilitados
      const sortedCards = initialCards.sort((a, b) => {
        if (a.enabled && !b.enabled) return -1
        if (!a.enabled && b.enabled) return 1
        return a.order - b.order
      })
      
      setPreferences(sortedCards)
      setLoading(false)
    }
  }, [savedCards, configLoading])

  // Salvar preferências do dashboard
  const savePreferences = async () => {
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      // Extrair IDs dos cards habilitados, na ordem correta
      const enabledCards = [...preferences]
        .filter(card => card.enabled)
        .sort((a, b) => a.order - b.order)
        .map(card => card.id)
      
      // Salvar no Supabase
      const result = await updateDashboardConfig(enabledCards)
      
      if (result.success) {
        setSaveSuccess(true)
        
        // Mostrar mensagem de sucesso
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        console.error('Erro ao salvar preferências:', result.error)
        alert('Erro ao salvar preferências')
      }
    } catch (error) {
      console.error('Erro ao salvar preferências do dashboard:', error)
      alert('Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  // Alternar estado de ativação do card
  const toggleCardEnabled = (id: string) => {
    setPreferences(prev => {
      const updatedCards = prev.map(card => {
        if (card.id === id) {
          return { ...card, enabled: !card.enabled }
        }
        return card
      })
      
      // Reordenar para manter cards habilitados no topo
      return updatedCards.sort((a, b) => {
        if (a.enabled && !b.enabled) return -1
        if (!a.enabled && b.enabled) return 1
        return a.order - b.order
      })
    })
  }

  // Funções para drag and drop
  const handleDragStart = (card: DashboardCard) => {
    setDraggedItem(card)
  }

  const handleDragOver = (e: React.DragEvent, targetCard: DashboardCard) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetCard.id) return

    // Reordenar cards
    setPreferences(prev => {
      const updatedCards = prev.map(card => {
        if (card.id === draggedItem.id) {
          return { ...card, order: targetCard.order }
        }
        if (card.id === targetCard.id) {
          return { ...card, order: draggedItem.order }
        }
        return card
      })

      return updatedCards.sort((a, b) => {
        if (a.enabled && !b.enabled) return -1
        if (!a.enabled && b.enabled) return 1
        return a.order - b.order
      })
    })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  // Ordenar cards por ordem
  const enabledCards = preferences.filter(card => card.enabled).sort((a, b) => a.order - b.order)
  const disabledCards = preferences.filter(card => !card.enabled)

  if (loading || configLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Preferências do Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Configure quais cards serão exibidos no dashboard e sua ordem
          </p>
        </div>
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Salvar Preferências</span>
            </>
          )}
        </button>
      </div>

      {/* Mensagem de sucesso */}
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Preferências salvas com sucesso!
        </div>
      )}

      {/* Instruções de Drag and Drop */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
        <MoveVertical size={20} className="text-blue-600" />
        <p className="text-blue-700 text-sm">
          Arraste e solte os cards para reorganizá-los. Ative ou desative os cards conforme sua preferência.
        </p>
      </div>

      {/* Lista de Cards Habilitados */}
      <div className="space-y-3 mb-6">
        <h3 className="font-medium text-gray-700">Cards Ativos</h3>
        {enabledCards.length === 0 ? (
          <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            Nenhum card ativado. Ative pelo menos um card para visualizar no dashboard.
          </div>
        ) : (
          enabledCards.map(card => (
            <div
              key={card.id}
              draggable
              onDragStart={() => handleDragStart(card)}
              onDragOver={(e) => handleDragOver(e, card)}
              onDragEnd={handleDragEnd}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between cursor-move transition-colors bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <MoveVertical size={16} className="text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={card.enabled}
                  onChange={() => toggleCardEnabled(card.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-teal-500"></div>
              </label>
            </div>
          ))
        )}
      </div>

      {/* Lista de Cards Desabilitados */}
      {disabledCards.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Cards Inativos</h3>
          {disabledCards.map(card => (
            <div
              key={card.id}
              className="border border-gray-100 bg-gray-50 rounded-lg p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <MoveVertical size={16} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">{card.title}</h3>
                  <p className="text-sm text-gray-400">{card.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={card.enabled}
                  onChange={() => toggleCardEnabled(card.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-teal-500"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Preview do Dashboard */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preview do Dashboard</h3>
        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enabledCards.map(card => (
              <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-900">{card.title}</h4>
                <p className="text-sm text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
          {enabledCards.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum card ativado. Ative pelo menos um card para visualizar no dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

