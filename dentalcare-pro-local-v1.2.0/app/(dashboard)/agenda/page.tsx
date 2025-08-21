'use client';
import { useState, useEffect } from 'react';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { CalendarioModerno } from '@/components/agenda/CalendarioModerno';
import { VisualizacaoDiaria } from '@/components/agenda/VisualizacaoDiaria';
import { ModalEvento } from '@/components/agenda/ModalEvento';
import { ModalFiltros, FiltrosState } from '@/components/agenda/ModalFiltros';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';

// Tipos para integração futura
interface EventoAgenda {
  id: string;
  titulo: string;
  paciente_id: string;
  profissional_id: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'consulta' | 'procedimento' | 'retorno' | 'emergencia';
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes: string;
  valor?: number;
  // Campos para integração futura
  google_event_id?: string;
  whatsapp_enviado?: boolean;
  lembrete_enviado?: boolean;
  // Dados relacionados
  paciente_nome?: string;
  profissional_nome?: string;
  paciente_telefone?: string;
}

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<EventInput[]>([]);
  const [eventosOriginais, setEventosOriginais] = useState<EventoAgenda[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEventoAberto, setModalEventoAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoAgenda | null>(null);
  const [dataInicialModal, setDataInicialModal] = useState<string>('');
  const [visualizacaoDiaria, setVisualizacaoDiaria] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosState>({
    busca: '',
    profissional_id: '',
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  // Dados mockados para demonstração
  useEffect(() => {
    carregarDadosMockados();
  }, []);

  const carregarDadosMockados = () => {
    // Pacientes mockados
    const pacientesMock: Paciente[] = [
      { id: '1', nome: 'Maria Silva', telefone: '(11) 99999-1111', email: 'maria@email.com' },
      { id: '2', nome: 'João Santos', telefone: '(11) 99999-2222', email: 'joao@email.com' },
      { id: '3', nome: 'Ana Costa', telefone: '(11) 99999-3333', email: 'ana@email.com' },
      { id: '4', nome: 'Pedro Lima', telefone: '(11) 99999-4444', email: 'pedro@email.com' },
      { id: '5', nome: 'Carla Mendes', telefone: '(11) 99999-5555', email: 'carla@email.com' }
    ];

    // Profissionais mockados
    const profissionaisMock: Profissional[] = [
      { id: '1', nome: 'Dr. Carlos Mendes', especialidade: 'Clínico Geral' },
      { id: '2', nome: 'Dra. Lucia Ferreira', especialidade: 'Ortodontia' },
      { id: '3', nome: 'Dr. Roberto Silva', especialidade: 'Implantodontia' }
    ];

    // Eventos mockados para hoje
    const hoje = new Date();
    const eventosMock: EventoAgenda[] = [
      {
        id: '1',
        titulo: 'Consulta de Rotina - Maria Silva',
        paciente_id: '1',
        profissional_id: '1',
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 0).toISOString(),
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 0).toISOString(),
        tipo: 'consulta',
        status: 'confirmado',
        observacoes: 'Paciente com histórico de sensibilidade',
        valor: 150,
        paciente_nome: 'Maria Silva',
        profissional_nome: 'Dr. Carlos Mendes',
        paciente_telefone: '(11) 99999-1111'
      },
      {
        id: '2',
        titulo: 'Limpeza - João Santos',
        paciente_id: '2',
        profissional_id: '2',
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 10, 30).toISOString(),
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12, 0).toISOString(),
        tipo: 'procedimento',
        status: 'agendado',
        observacoes: 'Primeira consulta',
        valor: 80,
        paciente_nome: 'João Santos',
        profissional_nome: 'Dra. Lucia Ferreira',
        paciente_telefone: '(11) 99999-2222'
      },
      {
        id: '3',
        titulo: 'Retorno - Ana Costa',
        paciente_id: '3',
        profissional_id: '1',
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 14, 0).toISOString(),
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 15, 0).toISOString(),
        tipo: 'retorno',
        status: 'confirmado',
        observacoes: 'Avaliação pós-procedimento',
        valor: 0,
        paciente_nome: 'Ana Costa',
        profissional_nome: 'Dr. Carlos Mendes',
        paciente_telefone: '(11) 99999-3333'
      },
      {
        id: '4',
        titulo: 'Emergência - Pedro Lima',
        paciente_id: '4',
        profissional_id: '3',
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 16, 30).toISOString(),
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 17, 30).toISOString(),
        tipo: 'emergencia',
        status: 'em_andamento',
        observacoes: 'Dor aguda no dente',
        valor: 200,
        paciente_nome: 'Pedro Lima',
        profissional_nome: 'Dr. Roberto Silva',
        paciente_telefone: '(11) 99999-4444'
      },
      {
        id: '5',
        titulo: 'Consulta - Carla Mendes',
        paciente_id: '5',
        profissional_id: '2',
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 14, 0).toISOString(),
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 15, 30).toISOString(),
        tipo: 'consulta',
        status: 'cancelado',
        observacoes: 'Paciente cancelou por motivos pessoais',
        valor: 120,
        paciente_nome: 'Carla Mendes',
        profissional_nome: 'Dra. Lucia Ferreira',
        paciente_telefone: '(11) 99999-5555'
      }
    ];

    setPacientes(pacientesMock);
    setProfissionais(profissionaisMock);
    setEventosOriginais(eventosMock);
    aplicarFiltros(eventosMock, filtrosAtivos);
    setLoading(false);
  };

  const aplicarFiltros = (eventosParaFiltrar: EventoAgenda[], filtros: FiltrosState) => {
    let eventosFiltrados = [...eventosParaFiltrar];

    // Filtro de busca
    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.titulo.toLowerCase().includes(busca) ||
        evento.paciente_nome?.toLowerCase().includes(busca) ||
        evento.profissional_nome?.toLowerCase().includes(busca) ||
        evento.observacoes.toLowerCase().includes(busca)
      );
    }

    // Filtro por profissional
    if (filtros.profissional_id) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.profissional_id === filtros.profissional_id
      );
    }

    // Filtro por tipo
    if (filtros.tipo) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.tipo === filtros.tipo
      );
    }

    // Filtro por status
    if (filtros.status) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.status === filtros.status
      );
    }

    // Filtro por data
    if (filtros.data_inicio) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.data_inicio >= filtros.data_inicio
      );
    }

    if (filtros.data_fim) {
      eventosFiltrados = eventosFiltrados.filter(evento =>
        evento.data_inicio <= filtros.data_fim + 'T23:59:59'
      );
    }

    // Converter para formato do FullCalendar
    const eventosCalendar: EventInput[] = eventosFiltrados.map(evento => ({
      id: evento.id,
      title: evento.titulo,
      start: evento.data_inicio,
      end: evento.data_fim,
      backgroundColor: getCorPorTipo(evento.tipo),
      borderColor: getCorPorTipo(evento.tipo),
      extendedProps: {
        tipo: evento.tipo,
        status: evento.status,
        paciente_nome: evento.paciente_nome,
        profissional_nome: evento.profissional_nome,
        observacoes: evento.observacoes,
        valor: evento.valor
      }
    }));

    setEventos(eventosCalendar);
  };

  const getCorPorTipo = (tipo: string) => {
    const cores = {
      consulta: '#3b82f6',
      procedimento: '#10b981',
      retorno: '#f59e0b',
      emergencia: '#ef4444'
    };
    return cores[tipo as keyof typeof cores] || '#6b7280';
  };

  const handleFiltroChange = (filtros: FiltrosState) => {
    setFiltrosAtivos(filtros);
    aplicarFiltros(eventosOriginais, filtros);
  };

  const handleNovoEvento = (selectInfo: DateSelectArg | string) => {
    if (typeof selectInfo === 'string') {
      setDataInicialModal(selectInfo);
    } else {
      setDataInicialModal(selectInfo.startStr);
    }
    setEventoSelecionado(null);
    setModalEventoAberto(true);
  };

  const handleEventoClicado = (clickInfo: EventClickArg | EventoAgenda) => {
    let eventoCompleto: EventoAgenda | undefined;
    
    if ('event' in clickInfo) {
      eventoCompleto = eventosOriginais.find(e => e.id === clickInfo.event.id);
    } else {
      eventoCompleto = clickInfo;
    }
    
    if (eventoCompleto) {
      setEventoSelecionado(eventoCompleto);
      setDataInicialModal('');
      setModalEventoAberto(true);
    }
  };

  const handleSalvarEvento = (dadosEvento: any) => {
    if (eventoSelecionado) {
      // Atualizar evento existente
      const eventosAtualizados = eventosOriginais.map(evento =>
        evento.id === eventoSelecionado.id
          ? { ...evento, ...dadosEvento }
          : evento
      );
      setEventosOriginais(eventosAtualizados);
      aplicarFiltros(eventosAtualizados, filtrosAtivos);
    } else {
      // Criar novo evento
      const novoEvento: EventoAgenda = {
        id: Date.now().toString(),
        ...dadosEvento,
        paciente_nome: pacientes.find(p => p.id === dadosEvento.paciente_id)?.nome,
        profissional_nome: profissionais.find(p => p.id === dadosEvento.profissional_id)?.nome,
        paciente_telefone: pacientes.find(p => p.id === dadosEvento.paciente_id)?.telefone
      };
      const eventosAtualizados = [...eventosOriginais, novoEvento];
      setEventosOriginais(eventosAtualizados);
      aplicarFiltros(eventosAtualizados, filtrosAtivos);
    }
  };

  const abrirModalNovoEvento = () => {
    setEventoSelecionado(null);
    setDataInicialModal('');
    setModalEventoAberto(true);
  };

  const handleVisualizacaoDiaria = (data: Date) => {
    setDataSelecionada(data);
    setVisualizacaoDiaria(true);
  };

  const voltarParaCalendario = () => {
    setVisualizacaoDiaria(false);
  };

  const filtrosAtivosCount = Object.values(filtrosAtivos).filter(v => v !== '').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Carregando agenda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agenda</h1>
          <p className="text-white/80">
            Gerencie seus agendamentos e consultas
            {filtrosAtivosCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                {filtrosAtivosCount} filtro{filtrosAtivosCount > 1 ? 's' : ''} ativo{filtrosAtivosCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {visualizacaoDiaria && (
            <button
              onClick={voltarParaCalendario}
              className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar ao Calendário
            </button>
          )}
          <button
            onClick={abrirModalNovoEvento}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      {visualizacaoDiaria ? (
        <VisualizacaoDiaria
          eventos={eventosOriginais}
          profissionais={profissionais}
          dataSelecionada={dataSelecionada}
          onEventoClick={handleEventoClicado}
          onNovoEvento={handleNovoEvento}
        />
      ) : (
        <CalendarioModerno
          eventos={eventos}
          onEventoSelecionado={setEventoSelecionado}
          onNovoEvento={handleNovoEvento}
          onEventoClicado={handleEventoClicado}
          onFiltrosClick={() => setModalFiltrosAberto(true)}
          onVisualizacaoDiariaClick={handleVisualizacaoDiaria}
        />
      )}

      {/* Modal de Evento */}
      <ModalEvento
        isOpen={modalEventoAberto}
        onClose={() => setModalEventoAberto(false)}
        onSave={handleSalvarEvento}
        evento={eventoSelecionado}
        dataInicial={dataInicialModal}
        pacientes={pacientes}
        profissionais={profissionais}
      />

      {/* Modal de Filtros */}
      <ModalFiltros
        isOpen={modalFiltrosAberto}
        onClose={() => setModalFiltrosAberto(false)}
        profissionais={profissionais}
        filtros={filtrosAtivos}
        onFiltroChange={handleFiltroChange}
      />

      {/* Informações para integração futura */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">🚀 Preparado para Integrações</h3>
        <p className="text-blue-700 text-sm">
          Esta agenda está estruturada para futuras integrações com:
        </p>
        <ul className="text-blue-700 text-sm mt-2 space-y-1">
          <li>• <strong>Google Calendar:</strong> Sincronização automática de eventos</li>
          <li>• <strong>WhatsApp Business:</strong> Envio de lembretes e confirmações</li>
          <li>• <strong>Supabase:</strong> Persistência de dados em tempo real</li>
        </ul>
      </div>
    </div>
  );
}
