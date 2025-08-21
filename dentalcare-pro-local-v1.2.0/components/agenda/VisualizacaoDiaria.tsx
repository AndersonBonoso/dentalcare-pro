'use client';
import { useState, useEffect } from 'react';
import { Clock, User, Phone, Calendar } from 'lucide-react';

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
  paciente_nome?: string;
  profissional_nome?: string;
  paciente_telefone?: string;
}

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

interface VisualizacaoDiariaProps {
  eventos: EventoAgenda[];
  profissionais: Profissional[];
  dataSelecionada: Date;
  onEventoClick: (evento: EventoAgenda) => void;
  onNovoEvento: (horario: string) => void;
}

export function VisualizacaoDiaria({
  eventos,
  profissionais,
  dataSelecionada,
  onEventoClick,
  onNovoEvento
}: VisualizacaoDiariaProps) {
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<string>('');
  const [horaAtual, setHoraAtual] = useState<string>('');

  // Atualiza hora atual a cada minuto
  useEffect(() => {
    const atualizarHora = () => {
      const agora = new Date();
      setHoraAtual(`${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`);
    };

    atualizarHora();
    const interval = setInterval(atualizarHora, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Gerar horários da régua (07:00 às 22:00)
  const gerarHorarios = () => {
    const horarios = [];
    for (let hora = 7; hora <= 22; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    return horarios;
  };

  // Filtrar eventos por profissional e data
  const eventosFiltrados = eventos.filter(evento => {
    const dataEvento = new Date(evento.data_inicio).toDateString();
    const dataAlvo = dataSelecionada.toDateString();
    
    const mesmaData = dataEvento === dataAlvo;
    const profissionalMatch = !profissionalSelecionado || evento.profissional_id === profissionalSelecionado;
    
    return mesmaData && profissionalMatch;
  });

  // Organizar eventos por horário
  const organizarEventosPorHorario = () => {
    const eventosOrganizados: { [key: string]: EventoAgenda[] } = {};
    
    eventosFiltrados.forEach(evento => {
      const horaInicio = new Date(evento.data_inicio).getHours();
      const chaveHora = `${horaInicio.toString().padStart(2, '0')}:00`;
      
      if (!eventosOrganizados[chaveHora]) {
        eventosOrganizados[chaveHora] = [];
      }
      eventosOrganizados[chaveHora].push(evento);
    });
    
    return eventosOrganizados;
  };

  const eventosOrganizados = organizarEventosPorHorario();

  const getStatusColor = (status: string) => {
    const cores = {
      agendado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmado: 'bg-green-100 text-green-800 border-green-200',
      em_andamento: 'bg-blue-100 text-blue-800 border-blue-200',
      concluido: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    };
    return cores[status as keyof typeof cores] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      agendado: 'A Confirmar',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTipoColor = (tipo: string) => {
    const cores = {
      consulta: 'bg-blue-500',
      procedimento: 'bg-green-500',
      retorno: 'bg-yellow-500',
      emergencia: 'bg-red-500'
    };
    return cores[tipo as keyof typeof cores] || 'bg-gray-500';
  };

  const horarios = gerarHorarios();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header com filtro */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Agenda do Dia - {dataSelecionada.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-blue-100 text-sm">
              {eventosFiltrados.length} agendamento{eventosFiltrados.length !== 1 ? 's' : ''} encontrado{eventosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filtro por profissional */}
          <div className="flex items-center space-x-3">
            <label className="text-white text-sm font-medium">Profissional:</label>
            <select
              value={profissionalSelecionado}
              onChange={(e) => setProfissionalSelecionado(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-gray-700 text-sm focus:ring-2 focus:ring-white/50"
            >
              <option value="">Todos os profissionais</option>
              {profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Régua de horários */}
      <div className="p-6">
        <div className="space-y-1">
          {horarios.map((horario) => {
            const eventosDoHorario = eventosOrganizados[horario] || [];
            const isHoraAtual = horario === horaAtual.slice(0, 5);
            
            return (
              <div key={horario} className="flex items-start border-b border-gray-100 pb-4 mb-4">
                {/* Coluna do horário */}
                <div className="w-20 flex-shrink-0">
                  <div className={`text-sm font-medium p-2 rounded-lg text-center ${
                    isHoraAtual 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'text-gray-600'
                  }`}>
                    {horario}
                    {isHoraAtual && (
                      <div className="text-xs text-blue-600 font-bold">AGORA</div>
                    )}
                  </div>
                </div>

                {/* Coluna dos eventos */}
                <div className="flex-1 ml-4">
                  {eventosDoHorario.length === 0 ? (
                    <button
                      onClick={() => onNovoEvento(`${dataSelecionada.toISOString().split('T')[0]}T${horario}:00`)}
                      className="w-full h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-500 hover:text-blue-600"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Clique para agendar
                    </button>
                  ) : (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(eventosDoHorario.length, 3)}, 1fr)` }}>
                      {eventosDoHorario.map((evento, index) => {
                        const horaInicio = new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        const horaFim = new Date(evento.data_fim).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });

                        return (
                          <div
                            key={evento.id}
                            onClick={() => onEventoClick(evento)}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                          >
                            {/* Barra colorida por tipo */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTipoColor(evento.tipo)}`} />
                            
                            {/* Status badge */}
                            <div className="flex items-center justify-between mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(evento.status)}`}>
                                {getStatusLabel(evento.status)}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {horaInicio} - {horaFim}
                              </span>
                            </div>

                            {/* Informações do paciente */}
                            <div className="space-y-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {evento.paciente_nome}
                              </h4>
                              <p className="text-xs text-gray-600 flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {evento.profissional_nome}
                              </p>
                              {evento.paciente_telefone && (
                                <p className="text-xs text-gray-600 flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {evento.paciente_telefone}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 truncate">
                                {evento.titulo}
                              </p>
                              {evento.valor && (
                                <p className="text-xs font-semibold text-green-600">
                                  R$ {evento.valor.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Tipos:</span>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Consulta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Procedimento</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Retorno</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span className="text-xs text-gray-600">Emergência</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Horário atual: {horaAtual}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

