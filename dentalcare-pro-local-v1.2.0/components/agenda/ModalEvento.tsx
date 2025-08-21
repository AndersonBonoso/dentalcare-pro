'use client';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, MessageSquare } from 'lucide-react';

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

interface EventoData {
  id?: string;
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
}

interface ModalEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evento: EventoData) => void;
  evento?: EventoData | null;
  dataInicial?: string;
  pacientes: Paciente[];
  profissionais: Profissional[];
}

export function ModalEvento({
  isOpen,
  onClose,
  onSave,
  evento,
  dataInicial,
  pacientes,
  profissionais
}: ModalEventoProps) {
  const [formData, setFormData] = useState<EventoData>({
    titulo: '',
    paciente_id: '',
    profissional_id: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'consulta',
    status: 'agendado',
    observacoes: '',
    valor: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (evento) {
      setFormData(evento);
    } else if (dataInicial) {
      const inicio = new Date(dataInicial);
      const fim = new Date(inicio.getTime() + 60 * 60 * 1000); // 1 hora depois
      
      setFormData({
        titulo: '',
        paciente_id: '',
        profissional_id: '',
        data_inicio: inicio.toISOString().slice(0, 16),
        data_fim: fim.toISOString().slice(0, 16),
        tipo: 'consulta',
        status: 'agendado',
        observacoes: '',
        valor: 0
      });
    }
  }, [evento, dataInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }
    
    if (!formData.paciente_id) {
      newErrors.paciente_id = 'Paciente é obrigatório';
    }
    
    if (!formData.profissional_id) {
      newErrors.profissional_id = 'Profissional é obrigatório';
    }
    
    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória';
    }
    
    if (!formData.data_fim) {
      newErrors.data_fim = 'Data de fim é obrigatória';
    }
    
    if (formData.data_inicio && formData.data_fim && formData.data_inicio >= formData.data_fim) {
      newErrors.data_fim = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: keyof EventoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const tiposEvento = [
    { value: 'consulta', label: 'Consulta', color: 'bg-blue-100 text-blue-800' },
    { value: 'procedimento', label: 'Procedimento', color: 'bg-green-100 text-green-800' },
    { value: 'retorno', label: 'Retorno', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'emergencia', label: 'Emergência', color: 'bg-red-100 text-red-800' }
  ];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado', color: 'bg-gray-100 text-gray-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {evento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Agendamento *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Consulta de rotina, Limpeza, etc."
            />
            {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
          </div>

          {/* Paciente e Profissional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Paciente *
              </label>
              <select
                value={formData.paciente_id}
                onChange={(e) => handleChange('paciente_id', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.paciente_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um paciente</option>
                {pacientes.map(paciente => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nome}
                  </option>
                ))}
              </select>
              {errors.paciente_id && <p className="text-red-500 text-sm mt-1">{errors.paciente_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional *
              </label>
              <select
                value={formData.profissional_id}
                onChange={(e) => handleChange('profissional_id', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.profissional_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(profissional => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome} - {profissional.especialidade}
                  </option>
                ))}
              </select>
              {errors.profissional_id && <p className="text-red-500 text-sm mt-1">{errors.profissional_id}</p>}
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Data e Hora de Início *
              </label>
              <input
                type="datetime-local"
                value={formData.data_inicio}
                onChange={(e) => handleChange('data_inicio', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.data_inicio ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.data_inicio && <p className="text-red-500 text-sm mt-1">{errors.data_inicio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data e Hora de Fim *
              </label>
              <input
                type="datetime-local"
                value={formData.data_fim}
                onChange={(e) => handleChange('data_fim', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.data_fim ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.data_fim && <p className="text-red-500 text-sm mt-1">{errors.data_fim}</p>}
            </div>
          </div>

          {/* Tipo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Atendimento
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tiposEvento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.valor || ''}
              onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações adicionais sobre o agendamento..."
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:from-blue-700 hover:to-teal-600 transition-colors font-medium"
            >
              {evento ? 'Atualizar' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

