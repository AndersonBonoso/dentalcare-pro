'use client'

import { useState } from 'react'
import { Settings, Eye, EyeOff, Save, X } from 'lucide-react'

export default function DashboardPage() {
  const [editMode, setEditMode] = useState(false)
  const [cards, setCards] = useState([
    { 
      id: 'pacientes', 
      title: 'Pacientes', 
      enabled: true, 
      value: '24', 
      icon: '/icons/icone_paciente.png',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'consultas', 
      title: 'Consultas Hoje', 
      enabled: true, 
      value: '8', 
      icon: '/icons/icone_calendario.png',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'receita', 
      title: 'Receita Mensal', 
      enabled: true, 
      value: 'R$ 12.500', 
      icon: '/icons/icone_financeiro.png',
      bgColor: 'bg-yellow-50'
    },
    { 
      id: 'profissionais', 
      title: 'Profissionais', 
      enabled: true, 
      value: '3', 
      icon: '/icons/icone_profissionais.png',
      bgColor: 'bg-purple-50'
    }
  ])

  const toggleCard = (cardId: string) => {
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    ))
  }

  const saveChanges = () => {
    setEditMode(false)
    alert('✅ Configurações salvas com sucesso!')
    console.log('Cards salvos:', cards)
  }

  const cancelChanges = () => {
    setEditMode(false)
    // Aqui você poderia restaurar o estado anterior se necessário
  }

  const enabledCards = cards.filter(card => card.enabled)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-teal-500">
      <div className="container mx-auto py-8 px-12">
        <div className="space-y-8">
          
          {/* HEADER COM BOTÃO DE EDIÇÃO */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-blue-100 mt-1">Bem-vindo ao DentalCare Pro</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={cancelChanges}
                    className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium backdrop-blur-sm border border-white/30"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </button>
                  <button
                    onClick={saveChanges}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Editar Cards
                </button>
              )}
            </div>
          </div>

          {/* MODO DE EDIÇÃO */}
          {editMode && (
            <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center mb-4">
                <Settings className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Configurar Cards do Dashboard</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Clique nos cards abaixo para ativá-los ou desativá-los no seu dashboard. 
                Cards ativos aparecerão na tela principal.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                      card.enabled
                        ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-md'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <img 
                        src={card.icon} 
                        alt={card.title}
                        className="w-6 h-6 mr-2 object-contain"
                        onError={(e) => {
                          console.error(`Erro ao carregar ícone: ${card.icon}`)
                        }}
                      />
                      <span className="text-sm font-semibold">{card.title}</span>
                    </div>
                    {card.enabled ? (
                      <Eye className="w-5 h-5 text-blue-600" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Dica:</strong> Cards desativados não aparecerão no dashboard principal. 
                  Você pode reativá-los a qualquer momento voltando ao modo de edição.
                </p>
              </div>
            </div>
          )}

          {/* CARDS PRINCIPAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enabledCards.map(card => (
              <div 
                key={card.id} 
                className="bg-white rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 ${card.bgColor} rounded-xl flex items-center justify-center shadow-inner`}>
                      <img 
                        src={card.icon} 
                        alt={card.title} 
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          console.error(`❌ ERRO: Não foi possível carregar o ícone ${card.icon}`)
                          // Fallback visual
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.innerHTML = `<div class="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 font-bold text-lg">?</div>`
                          }
                        }}
                        onLoad={() => {
                          console.log(`✅ Ícone carregado com sucesso: ${card.icon}`)
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MENSAGEM QUANDO NÃO HÁ CARDS ATIVOS */}
          {enabledCards.length === 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">Nenhum card ativado</h2>
              <p className="text-gray-600 mb-6 text-lg">
                {editMode 
                  ? 'Clique nos cards acima para ativá-los no dashboard.'
                  : 'Clique em "Editar Cards" para configurar quais cards deseja exibir.'
                }
              </p>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Configurar Cards
                </button>
              )}
            </div>
          )}

          {/* CARDS SECUNDÁRIOS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PRÓXIMAS CONSULTAS */}
            <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-lg">📅</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Próximas Consultas</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { nome: 'Maria Silva', tipo: 'Limpeza', hora: '09:00', periodo: 'Hoje' },
                  { nome: 'João Santos', tipo: 'Consulta', hora: '10:30', periodo: 'Hoje' },
                  { nome: 'Ana Costa', tipo: 'Tratamento', hora: '14:00', periodo: 'Hoje' }
                ].map((consulta, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{consulta.nome}</p>
                      <p className="text-sm text-gray-600">{consulta.tipo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{consulta.hora}</p>
                      <p className="text-xs text-gray-500">{consulta.periodo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ATIVIDADE RECENTE */}
            <div className="bg-white rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 text-lg">🔔</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Atividade Recente</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { texto: 'Consulta finalizada - Maria Silva', tempo: '2 horas atrás', cor: 'bg-green-500' },
                  { texto: 'Novo paciente cadastrado - Pedro Lima', tempo: '4 horas atrás', cor: 'bg-blue-500' },
                  { texto: 'Agendamento reagendado - Ana Costa', tempo: '1 dia atrás', cor: 'bg-yellow-500' }
                ].map((atividade, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-3 h-3 ${atividade.cor} rounded-full mt-2 mr-4 flex-shrink-0`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{atividade.texto}</p>
                      <p className="text-xs text-gray-500 mt-1">{atividade.tempo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

