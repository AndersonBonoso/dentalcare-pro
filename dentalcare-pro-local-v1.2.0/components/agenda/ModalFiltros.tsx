'use client';
import { useState, useEffect } from 'react';
import { X, Filter, Search, Users, Calendar, Clock } from 'lucide-react';

interface Profissional {
  id: string;
  nome: string;
  especialidade: string;
}

export interface FiltrosState {
  busca: string;
  profissional_id: string;
  tipo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
}

interface ModalFiltrosProps {
  isOpen: boolean;
  onClose: () => void;
  profissionais: Profissional[];
  filtros: FiltrosState;
  onFiltroChange: (filtros: FiltrosState) => void;
}

export function ModalFiltros({ 
  isOpen, 
  onClose, 
  profissionais, 
  filtros, 
  onFiltroChange 
}: ModalFiltrosProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosState>(filtros);

  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
    const novosFiltros = { ...filtrosLocais, [campo]: valor };
    setFiltrosLocais(novosFiltros);
  };

  const aplicarFiltros = () => {
    onFiltroChange(filtrosLocais);
    onClose();
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
    setFiltrosLocais(filtrosLimpos);
    onFiltroChange(filtrosLimpos);
    onClose();
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

  const filtrosAtivos = Object.values(filtrosLocais).filter(v => v !== '').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros da Agenda
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Busca principal */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Busca Geral
            </label>
            <input
              type="text"
              placeholder="Buscar por paciente, profissional ou observações..."
              value={filtrosLocais.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtros em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profissional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Profissional
              </label>
              <select
                value={filtrosLocais.profissional_id}
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
                value={filtrosLocais.tipo}
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
                value={filtrosLocais.status}
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
                value={filtrosLocais.data_inicio}
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
                value={filtrosLocais.data_fim}
                onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Estatísticas */}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 text-center w-full">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-700">Filtros ativos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filtrosAtivos}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={limparFiltros}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Limpar todos os filtros
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={aplicarFiltros}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors font-medium"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

