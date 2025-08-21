import { supabase } from './client'
import { authService } from './auth'

// Tipos
export interface UserProfile {
  id?: string
  nome: string
  email: string
  cpfCnpj?: string
  rg?: string
  cro?: string
  telefone?: string
  tipoPessoa?: 'pf' | 'pj'
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  fotoUrl?: string
  tipo?: 'master' | 'gerente' | 'usuario'
  status?: 'ativo' | 'pendente' | 'inativo'
  clinicaId?: string
  permissoes?: UserPermissions
}

export interface UserPermissions {
  id?: string
  usuarioId?: string
  dashboard?: boolean
  pacientes?: boolean
  profissionais?: boolean
  agenda?: boolean
  financeiro?: boolean
  estoque?: boolean
  catalogoServicos?: boolean
  configuracoes?: boolean
  luzia?: boolean
  criarUsuarios?: boolean
  gerenciarPermissoes?: boolean
}

// Serviço de usuário
export const userService = {
  // Obter perfil do usuário atual
  getCurrentUserProfile: async (): Promise<UserProfile | null> => {
    const authUser = await authService.getCurrentUser()
    if (!authUser) return null

    // Buscar usuário na tabela personalizada
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    if (userError || !userData) return null

    // Buscar permissões do usuário
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('permissoes_usuario')
      .select('*')
      .eq('usuario_id', userData.id)
      .single()

    if (permissionsError) return null

    // Converter para o formato da aplicação
    return {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      cpfCnpj: userData.cpf_cnpj,
      rg: userData.rg,
      cro: userData.cro,
      telefone: userData.telefone,
      tipoPessoa: userData.tipo_pessoa as 'pf' | 'pj',
      cep: userData.endereco?.cep,
      logradouro: userData.endereco?.logradouro,
      numero: userData.endereco?.numero,
      complemento: userData.endereco?.complemento,
      bairro: userData.endereco?.bairro,
      cidade: userData.endereco?.cidade,
      uf: userData.endereco?.uf,
      fotoUrl: userData.foto_url,
      tipo: userData.tipo as 'master' | 'gerente' | 'usuario',
      status: userData.status as 'ativo' | 'pendente' | 'inativo',
      clinicaId: userData.clinica_id,
      permissoes: permissionsData ? {
        id: permissionsData.id,
        usuarioId: permissionsData.usuario_id,
        dashboard: permissionsData.dashboard,
        pacientes: permissionsData.pacientes,
        profissionais: permissionsData.profissionais,
        agenda: permissionsData.agenda,
        financeiro: permissionsData.financeiro,
        estoque: permissionsData.estoque,
        catalogoServicos: permissionsData.catalogo_servicos,
        configuracoes: permissionsData.configuracoes,
        luzia: permissionsData.luzia,
        criarUsuarios: permissionsData.criar_usuarios,
        gerenciarPermissoes: permissionsData.gerenciar_permissoes
      } : undefined
    }
  },

  // Atualizar perfil do usuário
  updateUserProfile: async (profile: UserProfile): Promise<{ success: boolean, error?: any }> => {
    try {
      console.log("Atualizando perfil:", profile);
      
      const authUser = await authService.getCurrentUser()
      if (!authUser) return { success: false, error: 'Usuário não autenticado' }

      // Buscar ID do usuário na tabela personalizada
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error("Erro ao buscar usuário:", userError);
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Preparar dados de endereço
      const endereco = {
        cep: profile.cep,
        logradouro: profile.logradouro,
        numero: profile.numero,
        complemento: profile.complemento,
        bairro: profile.bairro,
        cidade: profile.cidade,
        uf: profile.uf
      }

      // Atualizar usuário
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nome: profile.nome,
          cpf_cnpj: profile.cpfCnpj,
          rg: profile.rg,
          cro: profile.cro,
          telefone: profile.telefone,
          tipo_pessoa: profile.tipoPessoa,
          endereco,
          foto_url: profile.fotoUrl
        })
        .eq('id', userData.id)

      if (updateError) {
        console.error("Erro ao atualizar usuário:", updateError);
        return { success: false, error: updateError }
      }

      console.log("Perfil atualizado com sucesso!");
      return { success: true }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { success: false, error }
    }
  },

  // Obter usuários da clínica atual
  getClinicUsers: async (): Promise<UserProfile[]> => {
    try {
      const currentProfile = await userService.getCurrentUserProfile()
      if (!currentProfile || !currentProfile.clinicaId) return []

      // Buscar usuários da clínica
      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select(`
          *,
          permissoes_usuario(*)
        `)
        .eq('clinica_id', currentProfile.clinicaId)

      if (usersError || !usersData) return []

      // Converter para o formato da aplicação
      return usersData.map(user => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        cpfCnpj: user.cpf_cnpj,
        rg: user.rg,
        cro: user.cro,
        telefone: user.telefone,
        tipoPessoa: user.tipo_pessoa as 'pf' | 'pj',
        cep: user.endereco?.cep,
        logradouro: user.endereco?.logradouro,
        numero: user.endereco?.numero,
        complemento: user.endereco?.complemento,
        bairro: user.endereco?.bairro,
        cidade: user.endereco?.cidade,
        uf: user.endereco?.uf,
        fotoUrl: user.foto_url,
        tipo: user.tipo as 'master' | 'gerente' | 'usuario',
        status: user.status as 'ativo' | 'pendente' | 'inativo',
        clinicaId: user.clinica_id,
        permissoes: user.permissoes_usuario?.[0] ? {
          id: user.permissoes_usuario[0].id,
          usuarioId: user.permissoes_usuario[0].usuario_id,
          dashboard: user.permissoes_usuario[0].dashboard,
          pacientes: user.permissoes_usuario[0].pacientes,
          profissionais: user.permissoes_usuario[0].profissionais,
          agenda: user.permissoes_usuario[0].agenda,
          financeiro: user.permissoes_usuario[0].financeiro,
          estoque: user.permissoes_usuario[0].estoque,
          catalogoServicos: user.permissoes_usuario[0].catalogo_servicos,
          configuracoes: user.permissoes_usuario[0].configuracoes,
          luzia: user.permissoes_usuario[0].luzia,
          criarUsuarios: user.permissoes_usuario[0].criar_usuarios,
          gerenciarPermissoes: user.permissoes_usuario[0].gerenciar_permissoes
        } : undefined
      }))
    } catch (error) {
      console.error('Erro ao buscar usuários da clínica:', error)
      return []
    }
  },

  // Convidar novo usuário
  inviteUser: async (userData: {
    nome: string,
    email: string,
    tipo: 'gerente' | 'usuario',
    permissoes: UserPermissions
  }): Promise<{ success: boolean, error?: any }> => {
    try {
      const currentProfile = await userService.getCurrentUserProfile()
      if (!currentProfile || !currentProfile.clinicaId) {
        return { success: false, error: 'Usuário não autenticado ou sem clínica' }
      }

      // Verificar se o usuário tem permissão para criar usuários
      if (!currentProfile.permissoes?.criarUsuarios) {
        return { success: false, error: 'Sem permissão para criar usuários' }
      }

      // Criar usuário na tabela personalizada (status pendente)
      const { data: newUser, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          nome: userData.nome,
          email: userData.email,
          clinica_id: currentProfile.clinicaId,
          tipo: userData.tipo,
          status: 'pendente'
        }])
        .select('id')
        .single()

      if (userError || !newUser) {
        return { success: false, error: userError || 'Erro ao criar usuário' }
      }

      // Criar permissões para o novo usuário
      const { error: permissionsError } = await supabase
        .from('permissoes_usuario')
        .insert([{
          usuario_id: newUser.id,
          dashboard: userData.permissoes.dashboard ?? true,
          pacientes: userData.permissoes.pacientes ?? false,
          profissionais: userData.permissoes.profissionais ?? false,
          agenda: userData.permissoes.agenda ?? false,
          financeiro: userData.permissoes.financeiro ?? false,
          estoque: userData.permissoes.estoque ?? false,
          catalogo_servicos: userData.permissoes.catalogoServicos ?? false,
          configuracoes: userData.permissoes.configuracoes ?? false,
          luzia: userData.permissoes.luzia ?? false,
          criar_usuarios: userData.tipo === 'gerente' && userData.permissoes.criarUsuarios,
          gerenciar_permissoes: userData.tipo === 'gerente' && userData.permissoes.gerenciarPermissoes
        }])

      if (permissionsError) {
        return { success: false, error: permissionsError }
      }

      // Em produção, aqui enviaria um email de convite
      // Mas para o protótipo, apenas retornamos sucesso

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  },

  // Atualizar permissões de um usuário
  updateUserPermissions: async (userId: string, permissions: UserPermissions): Promise<{ success: boolean, error?: any }> => {
    try {
      const currentProfile = await userService.getCurrentUserProfile()
      if (!currentProfile) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      // Verificar se o usuário tem permissão para gerenciar permissões
      if (!currentProfile.permissoes?.gerenciarPermissoes) {
        return { success: false, error: 'Sem permissão para gerenciar permissões' }
      }

      // Atualizar permissões
      const { error } = await supabase
        .from('permissoes_usuario')
        .update({
          dashboard: permissions.dashboard,
          pacientes: permissions.pacientes,
          profissionais: permissions.profissionais,
          agenda: permissions.agenda,
          financeiro: permissions.financeiro,
          estoque: permissions.estoque,
          catalogo_servicos: permissions.catalogoServicos,
          configuracoes: permissions.configuracoes,
          luzia: permissions.luzia,
          criar_usuarios: permissions.criarUsuarios,
          gerenciar_permissoes: permissions.gerenciarPermissoes
        })
        .eq('usuario_id', userId)

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  },

  // Remover um usuário
  removeUser: async (userId: string): Promise<{ success: boolean, error?: any }> => {
    try {
      const currentProfile = await userService.getCurrentUserProfile()
      if (!currentProfile) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      // Verificar se o usuário é master (apenas master pode remover)
      if (currentProfile.tipo !== 'master') {
        return { success: false, error: 'Apenas usuários master podem remover outros usuários' }
      }

      // Remover usuário
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }
}

export default userService

