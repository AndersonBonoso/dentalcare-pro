'use client';
import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { Filter } from 'lucide-react';

interface CalendarioModernoProps {
  eventos: EventInput[];
  onEventoSelecionado: (evento: any) => void;
  onNovoEvento: (info: DateSelectArg) => void;
  onEventoClicado: (info: EventClickArg) => void;
  onFiltrosClick: () => void;
  onVisualizacaoDiariaClick?: (data: Date) => void;
}

export function CalendarioModerno({ 
  eventos, 
  onEventoSelecionado, 
  onNovoEvento, 
  onEventoClicado,
  onFiltrosClick,
  onVisualizacaoDiariaClick
}: CalendarioModernoProps) {
  const [visualizacao, setVisualizacao] = useState('dayGridMonth');
  const [tituloAtual, setTituloAtual] = useState('');
  const calendarRef = useRef<FullCalendar>(null);

  const handleViewChange = (view: string) => {
    setVisualizacao(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  const handleDatesSet = (dateInfo: any) => {
    // Atualiza o título quando as datas mudam
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const data = new Date(dateInfo.start);
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    
    if (visualizacao === 'dayGridMonth') {
      setTituloAtual(`${mes} de ${ano}`);
    } else if (visualizacao === 'timeGridWeek') {
      const inicioSemana = new Date(dateInfo.start);
      const fimSemana = new Date(dateInfo.end);
      fimSemana.setDate(fimSemana.getDate() - 1); // Ajusta para o último dia da semana
      
      if (inicioSemana.getMonth() === fimSemana.getMonth()) {
        setTituloAtual(`${inicioSemana.getDate()} - ${fimSemana.getDate()} de ${meses[inicioSemana.getMonth()]} ${ano}`);
      } else {
        setTituloAtual(`${inicioSemana.getDate()} de ${meses[inicioSemana.getMonth()]} - ${fimSemana.getDate()} de ${meses[fimSemana.getMonth()]} ${ano}`);
      }
    } else if (visualizacao === 'timeGridDay') {
      const dia = new Date(dateInfo.start);
      setTituloAtual(`${dia.getDate()} de ${meses[dia.getMonth()]} de ${ano}`);
    } else if (visualizacao === 'listWeek') {
      setTituloAtual(`Lista - ${mes} de ${ano}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header personalizado */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Agenda</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
              >
                Hoje
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Título dinâmico */}
          <div className="flex-1 text-center">
            <h3 className="text-lg font-semibold text-white">
              {tituloAtual}
            </h3>
          </div>

          {/* Botões de visualização e filtro */}
          <div className="flex items-center space-x-2">
            {/* Botão de filtros */}
            <button
              onClick={onFiltrosClick}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Filtros"
            >
              <Filter className="w-5 h-5" />
            </button>
            
            {/* Botões de visualização */}
            <div className="bg-white/20 rounded-lg p-1 flex">
              <button
                onClick={() => handleViewChange('dayGridMonth')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  visualizacao === 'dayGridMonth' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => handleViewChange('timeGridWeek')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  visualizacao === 'timeGridWeek' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => {
                  if (onVisualizacaoDiariaClick) {
                    const dataAtual = calendarRef.current?.getApi().getDate() || new Date();
                    onVisualizacaoDiariaClick(dataAtual);
                  } else {
                    handleViewChange('timeGridDay');
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  visualizacao === 'timeGridDay' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => handleViewChange('listWeek')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  visualizacao === 'listWeek' 
                    ? 'bg-white text-blue-600' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={visualizacao}
          headerToolbar={false} // Usamos header personalizado
          events={eventos}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          select={onNovoEvento}
          eventClick={onEventoClicado}
          datesSet={handleDatesSet}
          locale="pt-br"
          height="auto"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6], // Segunda a sábado
            startTime: '08:00',
            endTime: '18:00',
          }}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={false}
          eventDisplay="block"
          eventBackgroundColor="transparent"
          eventBorderColor="transparent"
          eventClassNames="custom-event"
          dayHeaderClassNames="custom-day-header"
          slotLabelClassNames="custom-slot-label"
        />
      </div>

      {/* CSS personalizado */}
      <style jsx global>{`
        .fc {
          font-family: inherit;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: #e5e7eb;
        }
        
        .custom-day-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #374151;
          font-weight: 600;
          padding: 12px 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .custom-slot-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .custom-event {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          margin: 2px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        
        .custom-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }
        
        .fc-event-title {
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .fc-event-time {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.75rem;
        }
        
        .fc-daygrid-day-number {
          color: #374151;
          font-weight: 600;
          padding: 8px;
        }
        
        .fc-day-today {
          background-color: rgba(59, 130, 246, 0.05) !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .fc-button {
          background: none;
          border: none;
          color: #6b7280;
          font-weight: 500;
        }
        
        .fc-button:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .fc-list-event:hover td {
          background-color: rgba(59, 130, 246, 0.05);
        }
        
        .fc-list-event-dot {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
        }
        
        .fc-list-event-title {
          color: #374151;
          font-weight: 600;
        }
        
        .fc-list-event-time {
          color: #6b7280;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

