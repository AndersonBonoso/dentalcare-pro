'use client';
import { useState } from 'react';
import { Filter, Search, Users, Calendar, Clock } from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

interface FiltrosAgendaProps {
  profissionais: Profissional[];
  onFiltroChange: (filtros: FiltrosState) => void;
}

export interface FiltrosState {
  busca: string;
  profissional_id: string;
  tipo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
}

export function FiltrosAgenda({ profissionais, onFiltroChange }: FiltrosAgendaProps) {
  const [filtros, setFiltros] = useState<FiltrosState>({
    busca: '',
    profissional_id: '',
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: ''
  });

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
    const novosFiltros = { ...filtros, [campo]: valor };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const limparFiltros = () => {
    const filtrosLimpos: FiltrosState = {
      busca: '',
      profissional_id: '',
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: ''
    };
    setFiltros(filtrosLimpos);
    onFiltroChange(filtrosLimpos);
  };

  const tiposEvento = [
    { value: '', label: 'Todos os tipos' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'procedimento', label: 'Procedimento' },
    { value: 'retorno', label: 'Retorno' },
    { value: 'emergencia', label: 'Emergência' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'agendado', label: 'Agendado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Header dos filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filtros
          </h3>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} filtros avançados
          </button>
        </div>
        <button
          onClick={limparFiltros}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Limpar filtros
        </button>
      </div>

      {/* Busca principal */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por paciente, profissional ou observações..."
          value={filtros.busca}
          onChange={(e) => handleFiltroChange('busca', e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros avançados */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Profissional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Profissional
            </label>
            <select
              value={filtros.profissional_id}
              onChange={(e) => handleFiltroChange('profissional_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os profissionais</option>
              {profissionais.map(profissional => (
                <option key={profissional.id} value={profissional.id}>
                  {profissional.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Atendimento
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {tiposEvento.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => handleFiltroChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data Início
            </label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Data fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estatísticas rápidas */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-700">Filtros ativos</p>
              <p className="text-lg font-bold text-blue-600">
                {Object.values(filtros).filter(v => v !== '').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

