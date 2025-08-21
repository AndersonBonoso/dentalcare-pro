'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { fmtDate } from '@/lib/ui';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download, 
  Upload, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Phone,
  Mail,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { maskCPF, maskPhone } from '@/utils/masks';

type Paciente = { 
  id: string; 
  nome: string; 
  telefone: string | null; 
  email: string | null; 
  nascimento: string | null;
  cpf?: string | null;
  endereco?: string | null;
  status?: 'active' | 'inactive' | 'pending';
  ultima_visita?: string | null;
  proxima_visita?: string | null;
  foto?: string | null;
};

export default function PacientesPage() {
  const [items, setItems] = useState<Paciente[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<Paciente | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabaseBrowser.from('pacientes')
      .select('id,nome,telefone,email,nascimento,cpf,endereco,status,ultima_visita,proxima_visita,foto')
      .order('created_at', { ascending: false });
    
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function add() {
    if (!currentPatient) return;
    
    const clinica = await supabaseBrowser.from('usuarios').select('clinica_id').limit(1).maybeSingle();
    
    if (currentPatient.id) {
      // Editar paciente existente
      const { error } = await supabaseBrowser.from('pacientes').update({
        nome: currentPatient.nome,
        telefone: currentPatient.telefone || null,
        email: currentPatient.email || null,
        nascimento: currentPatient.nascimento || null,
        cpf: currentPatient.cpf || null,
        endereco: currentPatient.endereco || null,
        status: currentPatient.status || 'active',
        proxima_visita: currentPatient.proxima_visita || null
      }).eq('id', currentPatient.id);
      
      if (!error) {
        setShowModal(false);
        setCurrentPatient(null);
        load();
      }
    } else {
      // Adicionar novo paciente
      const { error } = await supabaseBrowser.from('pacientes').insert([{
        nome: currentPatient.nome,
        telefone: currentPatient.telefone || null,
        email: currentPatient.email || null,
        nascimento: currentPatient.nascimento || null,
        cpf: currentPatient.cpf || null,
        endereco: currentPatient.endereco || null,
        status: currentPatient.status || 'active',
        proxima_visita: currentPatient.proxima_visita || null,
        clinica_id: clinica.data?.clinica_id
      }]);
      
      if (!error) {
        setShowModal(false);
        setCurrentPatient(null);
        load();
      }
    }
  }

  async function remove(id: string) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      await supabaseBrowser.from('pacientes').delete().eq('id', id);
      
      if (viewMode === 'details') {
        setViewMode('list');
        setSelectedPatient(null);
      }
      
      load();
    }
  }

  // Filtrar pacientes pelo termo de busca
  const filteredPatients = items.filter(patient => 
    patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.telefone?.includes(searchTerm)
  );

  // Abrir modal para adicionar novo paciente
  const handleAddPatient = () => {
    setCurrentPatient({
      id: '',
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      nascimento: '',
      endereco: '',
      status: 'active'
    });
    setShowModal(true);
  };

  // Abrir modal para editar paciente existente
  const handleEditPatient = (patient: Paciente) => {
    setCurrentPatient({...patient});
    setShowModal(true);
  };

  // Ver detalhes do paciente
  const handleViewPatient = (patient: Paciente) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  // Voltar para a listagem
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPatient(null);
  };

  // Renderizar status do paciente
  const renderStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Inativo</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendente</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {viewMode === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Pacientes</h1>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              <button 
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleAddPatient}
              >
                <UserPlus size={18} />
                <span>Novo Paciente</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Visita
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Próxima Visita
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="ml-4">
                              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Nenhum paciente encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map(patient => (
                      <tr key={patient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                              {patient.foto ? (
                                <img src={patient.foto} alt={patient.nome} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                                  <User size={20} />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{patient.nome}</div>
                              <div className="text-sm text-gray-500">{patient.cpf || 'CPF não cadastrado'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.telefone || '—'}</div>
                          <div className="text-sm text-gray-500">{patient.email || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.ultima_visita ? fmtDate(patient.ultima_visita) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {patient.proxima_visita ? fmtDate(patient.proxima_visita) : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderStatus(patient.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleViewPatient(patient)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Ver detalhes"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => handleEditPatient(patient)}
                              className="text-yellow-600 hover:text-yellow-900 p-1"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => remove(patient.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // Visualização de detalhes do paciente
        selectedPatient && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={handleBackToList}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Voltar para lista
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditPatient(selectedPatient)}
                  className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button 
                  onClick={() => remove(selectedPatient.id)}
                  className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex flex-col items-center">
                  <div className="h-48 w-48 rounded-full bg-gray-200 overflow-hidden mb-4">
                    {selectedPatient.foto ? (
                      <img src={selectedPatient.foto} alt={selectedPatient.nome} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-500">
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-center">{selectedPatient.nome}</h2>
                  <div className="mt-2 mb-4">{renderStatus(selectedPatient.status)}</div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Telefone</div>
                      <div className="font-medium">{selectedPatient.telefone || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{selectedPatient.email || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Data de Nascimento</div>
                      <div className="font-medium">
                        {selectedPatient.nascimento ? fmtDate(selectedPatient.nascimento) : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-400" size={20} />
                    <div>
                      <div className="text-sm text-gray-500">Endereço</div>
                      <div className="font-medium">{selectedPatient.endereco || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-blue-800">Histórico de Consultas</h3>
                    <div className="space-y-3">
                      {selectedPatient.ultima_visita ? (
                        <div className="bg-white p-3 rounded shadow-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{fmtDate(selectedPatient.ultima_visita)}</span>
                            <span className="text-sm text-gray-500">Dr. Carlos Oliveira</span>
                          </div>
                          <p className="text-sm mt-1">Limpeza e avaliação de rotina</p>
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded shadow-sm text-center py-6">
                          <p className="text-gray-500">Nenhuma consulta anterior</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-green-800">Próximos Agendamentos</h3>
                    {selectedPatient.proxima_visita ? (
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {fmtDate(selectedPatient.proxima_visita)}
                          </span>
                          <span className="text-sm text-gray-500">10:30</span>
                        </div>
                        <p className="text-sm mt-1">Consulta de rotina</p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-gray-500">Dr. Carlos Oliveira</span>
                          <button className="text-xs text-blue-600 hover:text-blue-800">Reagendar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded shadow-sm text-center py-6">
                        <p className="text-gray-500">Nenhum agendamento futuro</p>
                        <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                          + Agendar consulta
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-purple-800">Tratamentos em Andamento</h3>
                    <div className="bg-white p-3 rounded shadow-sm text-center py-6">
                      <p className="text-gray-500">Nenhum tratamento em andamento</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        + Iniciar tratamento
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-800">Financeiro</h3>
                    <div className="bg-white p-3 rounded shadow-sm text-center py-6">
                      <p className="text-gray-500">Nenhum plano financeiro ativo</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                        + Criar plano financeiro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Modal para adicionar/editar paciente */}
      {showModal && currentPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentPatient.id ? 'Editar Paciente' : 'Novo Paciente'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.nome || ''}
                    onChange={(e) => setCurrentPatient({...currentPatient, nome: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.cpf || ''}
                    onChange={(e) => {
                      const maskedCPF = maskCPF(e.target.value);
                      setCurrentPatient({...currentPatient, cpf: maskedCPF});
                    }}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.nascimento || ''}
                    onChange={(e) => setCurrentPatient({...currentPatient, nascimento: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.email || ''}
                    onChange={(e) => setCurrentPatient({...currentPatient, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.telefone || ''}
                    onChange={(e) => {
                      const maskedPhone = maskPhone(e.target.value);
                      setCurrentPatient({...currentPatient, telefone: maskedPhone});
                    }}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.endereco || ''}
                    onChange={(e) => setCurrentPatient({...currentPatient, endereco: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.status || 'active'}
                    onChange={(e) => setCurrentPatient({
                      ...currentPatient, 
                      status: e.target.value as 'active' | 'inactive' | 'pending'
                    })}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Próxima Visita
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={currentPatient.proxima_visita || ''}
                    onChange={(e) => setCurrentPatient({...currentPatient, proxima_visita: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  onClick={add}
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
