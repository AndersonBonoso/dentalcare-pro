'use client';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';
import { useProfile } from '@/lib/useProfile';

interface LuziaConfig {
  id?: string;
  ativo: boolean;
  confirmacao_agendamento: boolean;
  reagendamento_automatico: boolean;
  cancelamento_automatico: boolean;
  antecedencia_confirmacao_horas: number;
  antecedencia_reagendamento_horas: number;
  mensagem_confirmacao: string;
  mensagem_reagendamento: string;
  mensagem_cancelamento: string;
  telefone_whatsapp: string;
  api_key_whatsapp: string;
}

interface LuziaLog {
  id: string;
  tipo_acao: string;
  status: string;
  mensagem_enviada: string;
  resposta_recebida: string;
  telefone_destino: string;
  erro: string;
  created_at: string;
}

export default function LuziaPage() {
  const { profile } = useProfile();
  const [config, setConfig] = useState<LuziaConfig>({
    ativo: false,
    confirmacao_agendamento: false,
    reagendamento_automatico: false,
    cancelamento_automatico: false,
    antecedencia_confirmacao_horas: 24,
    antecedencia_reagendamento_horas: 2,
    mensagem_confirmacao: 'Olá! Este é um lembrete do seu agendamento na {clinica} para {data} às {hora}. Confirme digitando SIM ou reagende digitando REAGENDAR.',
    mensagem_reagendamento: 'Seu agendamento foi reagendado para {nova_data} às {nova_hora}. Confirme digitando SIM.',
    mensagem_cancelamento: 'Seu agendamento foi cancelado. Entre em contato conosco para reagendar.',
    telefone_whatsapp: '',
    api_key_whatsapp: ''
  });
  
  const [logs, setLogs] = useState<LuziaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('configuracoes');

  useEffect(() => {
    if (profile?.clinica_id) {
      loadConfig();
      loadLogs();
    }
  }, [profile]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('luzia_configuracoes')
        .select('*')
        .eq('clinica_id', profile?.clinica_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('luzia_logs')
        .select('*')
        .eq('clinica_id', profile?.clinica_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

  const handleSave = async () => {
    if (!profile?.is_master) {
      alert('Apenas usuários Master podem alterar as configurações da LuzIA');
      return;
    }

    try {
      setSaving(true);
      
      const configData = {
        ...config,
        clinica_id: profile?.clinica_id
      };

      if (config.id) {
        const { error } = await supabase
          .from('luzia_configuracoes')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('luzia_configuracoes')
          .insert([configData])
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">LuzIA</h1>
          <p className="text-white/80">Agente de IA para automação de agendamentos</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('configuracoes')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'configuracoes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Configurações
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Logs de Atividade
              </button>
              <button
                onClick={() => setActiveTab('ajuda')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'ajuda'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ajuda
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Configurações */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                {!profile?.is_master && (
                  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <strong>Atenção:</strong> Apenas usuários Master podem alterar as configurações da LuzIA.
                  </div>
                )}

                {/* Status Geral */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status Geral</h3>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ativo"
                      checked={config.ativo}
                      onChange={(e) => setConfig({...config, ativo: e.target.checked})}
                      disabled={!profile?.is_master}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                      Ativar LuzIA (Agente de IA)
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Quando ativada, a LuzIA enviará mensagens automáticas via WhatsApp para confirmações, reagendamentos e cancelamentos.
                  </p>
                </div>

                {/* Funcionalidades */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Funcionalidades</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="confirmacao"
                        checked={config.confirmacao_agendamento}
                        onChange={(e) => setConfig({...config, confirmacao_agendamento: e.target.checked})}
                        disabled={!profile?.is_master}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="confirmacao" className="ml-2 block text-sm text-gray-900">
                        Confirmação de Agendamentos
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reagendamento"
                        checked={config.reagendamento_automatico}
                        onChange={(e) => setConfig({...config, reagendamento_automatico: e.target.checked})}
                        disabled={!profile?.is_master}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="reagendamento" className="ml-2 block text-sm text-gray-900">
                        Reagendamento Automático
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cancelamento"
                        checked={config.cancelamento_automatico}
                        onChange={(e) => setConfig({...config, cancelamento_automatico: e.target.checked})}
                        disabled={!profile?.is_master}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="cancelamento" className="ml-2 block text-sm text-gray-900">
                        Cancelamento Automático
                      </label>
                    </div>
                  </div>
                </div>

                {/* Configurações de Tempo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Tempo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Antecedência para Confirmação (horas)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={config.antecedencia_confirmacao_horas}
                        onChange={(e) => setConfig({...config, antecedencia_confirmacao_horas: parseInt(e.target.value) || 24})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Antecedência para Reagendamento (horas)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="48"
                        value={config.antecedencia_reagendamento_horas}
                        onChange={(e) => setConfig({...config, antecedencia_reagendamento_horas: parseInt(e.target.value) || 2})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Configurações do WhatsApp */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações do WhatsApp</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={config.telefone_whatsapp}
                        onChange={(e) => setConfig({...config, telefone_whatsapp: e.target.value})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key WhatsApp
                      </label>
                      <input
                        type="password"
                        placeholder="Sua chave da API"
                        value={config.api_key_whatsapp}
                        onChange={(e) => setConfig({...config, api_key_whatsapp: e.target.value})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Mensagens Personalizadas */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Mensagens Personalizadas</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem de Confirmação
                      </label>
                      <textarea
                        rows={3}
                        value={config.mensagem_confirmacao}
                        onChange={(e) => setConfig({...config, mensagem_confirmacao: e.target.value})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variáveis disponíveis: {'{clinica}'}, {'{data}'}, {'{hora}'}, {'{paciente}'}, {'{profissional}'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem de Reagendamento
                      </label>
                      <textarea
                        rows={3}
                        value={config.mensagem_reagendamento}
                        onChange={(e) => setConfig({...config, mensagem_reagendamento: e.target.value})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variáveis disponíveis: {'{nova_data}'}, {'{nova_hora}'}, {'{paciente}'}, {'{profissional}'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensagem de Cancelamento
                      </label>
                      <textarea
                        rows={3}
                        value={config.mensagem_cancelamento}
                        onChange={(e) => setConfig({...config, mensagem_cancelamento: e.target.value})}
                        disabled={!profile?.is_master}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variáveis disponíveis: {'{paciente}'}, {'{data}'}, {'{hora}'}, {'{clinica}'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão Salvar */}
                {profile?.is_master && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Logs */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Logs de Atividade</h3>
                
                {logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma atividade registrada ainda.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data/Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detalhes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(log.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.tipo_acao}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                log.status === 'sucesso'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.telefone_destino}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {log.erro || log.mensagem_enviada?.substring(0, 50) + '...'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Ajuda */}
            {activeTab === 'ajuda' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Como usar a LuzIA</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">O que é a LuzIA?</h4>
                  <p className="text-blue-800 text-sm">
                    A LuzIA é um agente de inteligência artificial que automatiza a comunicação com pacientes via WhatsApp, 
                    enviando confirmações de agendamento, permitindo reagendamentos e notificando cancelamentos.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Funcionalidades Principais:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      <li><strong>Confirmação de Agendamentos:</strong> Envia lembretes automáticos para pacientes confirmarem suas consultas</li>
                      <li><strong>Reagendamento Automático:</strong> Permite que pacientes reagendem consultas respondendo mensagens</li>
                      <li><strong>Cancelamento Automático:</strong> Notifica pacientes sobre cancelamentos e oferece reagendamento</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Configuração Inicial:</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                      <li>Configure seu telefone WhatsApp Business</li>
                      <li>Obtenha uma API Key de um provedor de WhatsApp (ex: Twilio, ChatAPI)</li>
                      <li>Ative as funcionalidades desejadas</li>
                      <li>Personalize as mensagens conforme sua clínica</li>
                      <li>Teste com alguns agendamentos antes de ativar completamente</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Variáveis nas Mensagens:</h4>
                    <div className="text-sm text-gray-700">
                      <p className="mb-2">Você pode usar as seguintes variáveis nas mensagens personalizadas:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li><code className="bg-gray-100 px-1 rounded">{'{clinica}'}</code> - Nome da clínica</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{paciente}'}</code> - Nome do paciente</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{profissional}'}</code> - Nome do profissional</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{data}'}</code> - Data do agendamento</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{hora}'}</code> - Hora do agendamento</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{nova_data}'}</code> - Nova data (reagendamento)</li>
                        <li><code className="bg-gray-100 px-1 rounded">{'{nova_hora}'}</code> - Nova hora (reagendamento)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">⚠️ Importante:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      <li>Apenas usuários Master podem alterar as configurações da LuzIA</li>
                      <li>Certifique-se de ter permissão para enviar mensagens WhatsApp comerciais</li>
                      <li>Teste sempre as configurações antes de ativar em produção</li>
                      <li>Monitore os logs regularmente para identificar problemas</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

