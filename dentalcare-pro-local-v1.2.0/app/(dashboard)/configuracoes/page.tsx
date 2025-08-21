'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Calendar, Users, CreditCard, MessageSquare, Shield, Palette, FileText, Globe, UserPlus, Mail, Trash2, Edit, Monitor as MonitorIcon } from 'lucide-react'
import { maskCPF, maskCNPJ, maskRG, maskPhone, maskCEP, validateCPF, validateCNPJ, validateEmail, fetchAddressByCEP } from '../../../utils/masks'
import { useUserProfile } from '../../../hooks/useUserProfile'
import { useUsers } from '../../../hooks/useUsers'
import { useConfig } from '../../../hooks/useConfig'
import { CameraCapture } from '../../../components/ui/CameraCapture'
import DashboardPreferences from './DashboardPreferences'

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState('perfil')

  const sections = [
    { id: 'perfil', label: 'Perfil', icon: User, color: 'bg-blue-500' },
    { id: 'usuarios', label: 'Usuários', icon: Users, color: 'bg-green-500' },
    { id: 'exibicao', label: 'Exibição e Locale', icon: Globe, color: 'bg-purple-500' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, color: 'bg-red-500' },
    { id: 'pacientes', label: 'Pacientes', icon: User, color: 'bg-orange-500' },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard, color: 'bg-green-600' },
    { id: 'comunicacao', label: 'Comunicação', icon: MessageSquare, color: 'bg-pink-500' },
    { id: 'documentos', label: 'Documentos', icon: FileText, color: 'bg-indigo-500' },
    { id: 'seguranca', label: 'Segurança', icon: Shield, color: 'bg-red-600' },
    { id: 'interface', label: 'Interface', icon: Palette, color: 'bg-teal-500' }
  ]

  const renderSection = () => {
    switch (activeSection) {
      case 'perfil':
        return <PerfilSection />
      case 'usuarios':
        return <UsuariosSection />
      case 'exibicao':
        return <ExibicaoSection />
      case 'agenda':
        return <AgendaSection />
      case 'pacientes':
        return <PacientesSection />
      case 'financeiro':
        return <FinanceiroSection />
      case 'comunicacao':
        return <ComunicacaoSection />
      case 'documentos':
        return <DocumentosSection />
      case 'seguranca':
        return <SegurancaSection />
      case 'interface':
        return <InterfaceSection />
      default:
        return <PerfilSection />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <div className="text-sm text-gray-500">v1.2.0</div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar de Navegação */}
        <div className="w-full md:w-64 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? `${section.color} text-white shadow-lg`
                  : 'bg-white hover:bg-gray-50 text-gray-700 border'
              }`}
            >
              <section.icon size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Conteúdo da Seção */}
        <div className="flex-1">
          {renderSection()}
        </div>
      </div>
    </div>
  )
}

// Componente da Seção de Perfil
function PerfilSection() {
  const { profile, loading, updateProfile } = useUserProfile()
  const [showModal, setShowModal] = useState(false)
  const [tipoPessoa, setTipoPessoa] = useState<'pf' | 'pj'>('pf')
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    rg: '',
    cro: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCameraCapture, setShowCameraCapture] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  // Carregar dados do perfil quando disponível
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        cpfCnpj: profile.cpfCnpj || '',
        rg: profile.rg || '',
        cro: profile.cro || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        cep: profile.cep || '',
        logradouro: profile.logradouro || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        uf: profile.uf || ''
      })
      setTipoPessoa(profile.tipoPessoa || 'pf')
      setProfilePhoto(profile.fotoUrl || null)
    }
  }, [profile])

  const handlePhotoCapture = (photoDataUrl: string) => {
    setProfilePhoto(photoDataUrl)
  }

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value

    // Aplicar máscaras
    if (field === 'cpfCnpj') {
      maskedValue = tipoPessoa === 'pf' ? maskCPF(value) : maskCNPJ(value)
    } else if (field === 'rg') {
      maskedValue = maskRG(value)
    } else if (field === 'telefone') {
      maskedValue = maskPhone(value)
    } else if (field === 'cep') {
      maskedValue = maskCEP(value)
      
      // Buscar endereço quando CEP estiver completo
      if (maskedValue.length === 9) {
        handleCEPSearch(maskedValue)
      }
    }

    setFormData(prev => ({ ...prev, [field]: maskedValue }))
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCEPSearch = async (cep: string) => {
    setLoadingCEP(true)
    try {
      const address = await fetchAddressByCEP(cep)
      if (address) {
        setFormData(prev => ({
          ...prev,
          logradouro: address.logradouro || '',
          bairro: address.bairro || '',
          cidade: address.localidade || '',
          uf: address.uf || ''
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoadingCEP(false)
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.cpfCnpj.trim()) {
      newErrors.cpfCnpj = tipoPessoa === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório'
    } else {
      const isValid = tipoPessoa === 'pf' ? validateCPF(formData.cpfCnpj) : validateCNPJ(formData.cpfCnpj)
      if (!isValid) {
        newErrors.cpfCnpj = tipoPessoa === 'pf' ? 'CPF inválido' : 'CNPJ inválido'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setSaving(true)
      try {
        // Atualizar perfil no Supabase
        const result = await updateProfile({
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          rg: formData.rg,
          cro: formData.cro,
          email: formData.email,
          telefone: formData.telefone,
          tipoPessoa: tipoPessoa,
          fotoUrl: profilePhoto || undefined,
          // Dados de endereço
          cep: formData.cep,
          logradouro: formData.logradouro,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf
        })
        
        if (result?.success) {
          setShowModal(false)
        } else if (result?.error) {
          alert(`Erro ao salvar perfil: ${result.error}`)
        }
      } catch (error: any) {
        console.error('Erro ao salvar perfil:', error)
        alert(`Erro ao salvar perfil: ${error.message || 'Erro desconhecido'}`)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleTipoPessoaChange = (tipo: 'pf' | 'pj') => {
    setTipoPessoa(tipo)
    setFormData(prev => ({ ...prev, cpfCnpj: '' }))
    setErrors(prev => ({ ...prev, cpfCnpj: '' }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Perfil do Usuário</h2>
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Editar Perfil'}
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : profile ? (
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhoto || profile.fotoUrl ? (
                <img 
                  src={profilePhoto || profile.fotoUrl} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-blue-600" />
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="text-gray-900">{profile.nome}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">{profile.tipoPessoa === 'pf' ? 'CPF' : 'CNPJ'}</h3>
                <p className="text-gray-900">{profile.cpfCnpj}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                <p className="text-gray-900">{profile.telefone}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Endereço</h3>
                <p className="text-gray-900">
                  {profile.logradouro && profile.numero ? 
                    `${profile.logradouro}, ${profile.numero}${profile.complemento ? ` - ${profile.complemento}` : ''}` : 
                    'Não informado'
                  }
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cidade/UF</h3>
                <p className="text-gray-900">
                  {profile.cidade && profile.uf ? 
                    `${profile.cidade} - ${profile.uf}` : 
                    'Não informado'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum perfil encontrado. Clique em "Editar Perfil" para criar.
          </div>
        )}
      </div>

      {/* Modal de Edição de Perfil */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Editar Perfil</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Pessoa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pessoa</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipo"
                        value="pf"
                        checked={tipoPessoa === 'pf'}
                        onChange={() => handleTipoPessoaChange('pf')}
                        className="mr-2"
                      />
                      Pessoa Física
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipo"
                        value="pj"
                        checked={tipoPessoa === 'pj'}
                        onChange={() => handleTipoPessoaChange('pj')}
                        className="mr-2"
                      />
                      Pessoa Jurídica
                    </label>
                  </div>
                </div>

                {/* Foto de Perfil */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center overflow-hidden">
                      {profilePhoto ? (
                        <img 
                          src={profilePhoto} 
                          alt="Foto do perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-blue-600" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCameraCapture(true)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Alterar Foto
                    </button>
                  </div>
                </div>

                {/* Dados Pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tipoPessoa === 'pf' ? 'CPF *' : 'CNPJ *'}</label>
                    <input
                      type="text"
                      value={formData.cpfCnpj}
                      onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                      placeholder={tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                      className={`w-full px-3 py-2 border ${errors.cpfCnpj ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.cpfCnpj && <p className="mt-1 text-sm text-red-500">{errors.cpfCnpj}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="00.000.000-0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CRO</label>
                    <input
                      type="text"
                      value={formData.cro}
                      onChange={(e) => handleInputChange('cro', e.target.value)}
                      placeholder="00000-UF"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(00) 00000-0000"
                      className={`w-full px-3 py-2 border ${errors.telefone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.telefone && <p className="mt-1 text-sm text-red-500">{errors.telefone}</p>}
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Endereço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          placeholder="00000-000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {loadingCEP && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                      <input
                        type="text"
                        value={formData.logradouro}
                        onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => handleInputChange('numero', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                      <input
                        type="text"
                        value={formData.complemento}
                        onChange={(e) => handleInputChange('complemento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                      <input
                        type="text"
                        value={formData.bairro}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                      <input
                        type="text"
                        value={formData.uf}
                        onChange={(e) => handleInputChange('uf', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Captura de Câmera */}
      {showCameraCapture && (
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCameraCapture(false)}
          currentPhoto={profilePhoto || undefined}
        />
      )}
    </div>
  )
}

// Outras seções (implementação básica)
function UsuariosSection() {
  const { users, loading, error, inviteUser, updateUserPermissions, removeUser } = useUsers()
  const { profile } = useUserProfile()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: 'usuario' as 'gerente' | 'usuario',
    permissoes: {
      dashboard: true,
      pacientes: false,
      profissionais: false,
      agenda: false,
      financeiro: false,
      estoque: false,
      catalogoServicos: false,
      configuracoes: false,
      luzia: false,
      criarUsuarios: false,
      gerenciarPermissoes: false
    }
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // Verificar permissões do usuário atual
  const canCreateUsers = profile?.permissoes?.criarUsuarios || false
  const canManagePermissions = profile?.permissoes?.gerenciarPermissoes || false
  const userLevel = profile?.tipo || 'usuario' // 'master', 'gerente', 'usuario'

  const getAvailablePermissions = () => {
    // Master pode definir todas as permissões
    if (userLevel === 'master') {
      return {
        dashboard: 'Dashboard',
        pacientes: 'Pacientes',
        profissionais: 'Profissionais',
        agenda: 'Agenda',
        financeiro: 'Financeiro',
        estoque: 'Estoque',
        catalogoServicos: 'Catálogo de Serviços',
        configuracoes: 'Configurações',
        luzia: 'LuzIA',
        criarUsuarios: 'Criar Usuários',
        gerenciarPermissoes: 'Gerenciar Permissões'
      }
    }
    
    // Gerente só pode dar permissões que ele mesmo tem
    if (userLevel === 'gerente') {
      const availablePermissions: any = {}
      if (profile?.permissoes) {
        Object.keys(profile.permissoes).forEach(key => {
          if (profile.permissoes && profile.permissoes[key as keyof typeof profile.permissoes] && key !== 'criarUsuarios' && key !== 'gerenciarPermissoes') {
            const labels: any = {
              dashboard: 'Dashboard',
              pacientes: 'Pacientes',
              profissionais: 'Profissionais',
              agenda: 'Agenda',
              financeiro: 'Financeiro',
              estoque: 'Estoque',
              catalogoServicos: 'Catálogo de Serviços',
              configuracoes: 'Configurações',
              luzia: 'LuzIA'
            }
            availablePermissions[key] = labels[key]
          }
        })
      }
      return availablePermissions
    }
    
    // Usuário comum não pode dar permissões
    return {}
  }

  const getMaxUserType = () => {
    if (userLevel === 'master') return ['gerente', 'usuario']
    if (userLevel === 'gerente') return ['usuario']
    return []
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulário
    const newErrors: {[key: string]: string} = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
    else if (!validateEmail(formData.email)) newErrors.email = 'Email inválido'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    setSaving(true)
    try {
      // Enviar convite via Supabase
      const result = await inviteUser({
        nome: formData.nome,
        email: formData.email,
        tipo: formData.tipo,
        permissoes: formData.permissoes
      })
      
      if (result.success) {
        setShowInviteModal(false)
        // Limpar formulário
        setFormData({
          nome: '',
          email: '',
          tipo: 'usuario',
          permissoes: {
            dashboard: true,
            pacientes: false,
            profissionais: false,
            agenda: false,
            financeiro: false,
            estoque: false,
            catalogoServicos: false,
            configuracoes: false,
            luzia: false,
            criarUsuarios: false,
            gerenciarPermissoes: false
          }
        })
      } else {
        alert(`Erro ao convidar usuário: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Erro ao convidar usuário:', error)
      alert(`Erro ao convidar usuário: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciamento de Usuários</h2>
            <p className="text-gray-600 mt-1">Gerencie usuários e suas permissões na clínica</p>
          </div>
          {canCreateUsers && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
            >
              <UserPlus size={16} />
              Convidar Usuário
            </button>
          )}
        </div>

        {/* Informações de Hierarquia */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Seu Nível de Acesso: {
            userLevel === 'master' ? '👑 Master (Dono)' :
            userLevel === 'gerente' ? '👨‍💼 Gerente' : '👥 Usuário'
          }</h3>
          <p className="text-blue-700 text-sm">
            {userLevel === 'master' && 'Você pode criar qualquer tipo de usuário e definir todas as permissões.'}
            {userLevel === 'gerente' && 'Você pode criar usuários secundários e definir permissões limitadas às suas próprias.'}
            {userLevel === 'usuario' && 'Você não tem permissão para gerenciar usuários.'}
          </p>
        </div>

        {/* Lista de Usuários */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users && users.length > 0 ? (
            users.map((user: any) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                      {user.fotoUrl ? (
                        <img src={user.fotoUrl} alt={user.nome} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User size={20} className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        {user.nome}
                        {user.tipo === 'master' && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">👑 Master</span>}
                        {user.tipo === 'gerente' && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">👨‍💼 Gerente</span>}
                        {user.tipo === 'usuario' && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">👥 Usuário</span>}
                      </h3>
                      <p className="text-gray-600 text-sm">{user.email}</p>
                      <p className="text-gray-500 text-xs">Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status === 'ativo' ? 'Ativo' : 'Pendente'}
                    </span>
                    
                    {canManagePermissions && user.id !== profile?.id && (
                      <button 
                        onClick={() => {
                          setSelectedUser(user)
                          setShowPermissionsModal(true)
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    
                    {userLevel === 'master' && user.id !== profile?.id && (
                      <button 
                        onClick={() => {
                          setSelectedUser(user)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissões do Usuário */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Permissões:</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.permissoes && Object.entries(user.permissoes).map(([key, value]) => {
                      if (key === 'criarUsuarios' || key === 'gerenciarPermissoes') return null
                      const labels: any = {
                        dashboard: 'Dashboard',
                        pacientes: 'Pacientes',
                        profissionais: 'Profissionais',
                        agenda: 'Agenda',
                        financeiro: 'Financeiro',
                        estoque: 'Estoque',
                        catalogoServicos: 'Catálogo',
                        configuracoes: 'Configurações',
                        luzia: 'LuzIA'
                      }
                      return (
                        <span
                          key={key}
                          className={`px-2 py-1 rounded-full text-xs ${
                            value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {labels[key]}
                        </span>
                      )
                    })}
                    {user.permissoes?.criarUsuarios && (
                      <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                        ⚡ Criar Usuários
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Convite */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Convidar Novo Usuário</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleInviteUser} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className={`w-full px-3 py-2 border ${errors.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nome do usuário"
                    />
                    {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="email@exemplo.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                {/* Tipo de Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Usuário</label>
                  <div className="space-y-2">
                    {getMaxUserType().map((tipo) => (
                      <label key={tipo} className="flex items-center">
                        <input
                          type="radio"
                          name="tipoUsuario"
                          value={tipo}
                          checked={formData.tipo === tipo}
                          onChange={() => setFormData({...formData, tipo: tipo as 'gerente' | 'usuario'})}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-medium">
                            {tipo === 'gerente' ? '👨‍💼 Gerente' : '👥 Usuário Secundário'}
                          </span>
                          <p className="text-sm text-gray-600">
                            {tipo === 'gerente' 
                              ? 'Pode criar outros usuários e gerenciar permissões limitadas'
                              : 'Acesso limitado conforme permissões definidas'
                            }
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissões de Acesso</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(getAvailablePermissions()).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.permissoes[key as keyof typeof formData.permissoes] || false}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              permissoes: {
                                ...formData.permissoes,
                                [key]: e.target.checked
                              }
                            })
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{label as string}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        <span>Enviar Convite</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExibicaoSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Exibição e Locale</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function AgendaSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações da Agenda</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function PacientesSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Pacientes</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function FinanceiroSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações Financeiras</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function ComunicacaoSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Comunicação</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function DocumentosSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Documentos</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function SegurancaSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Segurança</h2>
      <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
    </div>
  )
}

function InterfaceSection() {
  return (
    <div className="space-y-6">
      <DashboardPreferences />
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configurações de Interface</h2>
        <p className="text-gray-600">Configurações adicionais de interface em desenvolvimento...</p>
      </div>
    </div>
  )
}

