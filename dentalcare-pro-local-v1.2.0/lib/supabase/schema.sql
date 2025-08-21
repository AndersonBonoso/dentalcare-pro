-- Schema para o DentalCare Pro

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Clínicas
CREATE TABLE IF NOT EXISTS clinicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco JSONB,
  logo_url TEXT,
  cores JSONB,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('master', 'gerente', 'usuario')),
  cpf_cnpj TEXT,
  rg TEXT,
  cro TEXT,
  telefone TEXT,
  tipo_pessoa TEXT CHECK (tipo_pessoa IN ('pf', 'pj')),
  endereco JSONB,
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'inativo')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Permissões de Usuário
CREATE TABLE IF NOT EXISTS permissoes_usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  dashboard BOOLEAN DEFAULT TRUE,
  pacientes BOOLEAN DEFAULT FALSE,
  profissionais BOOLEAN DEFAULT FALSE,
  agenda BOOLEAN DEFAULT FALSE,
  financeiro BOOLEAN DEFAULT FALSE,
  estoque BOOLEAN DEFAULT FALSE,
  catalogo_servicos BOOLEAN DEFAULT FALSE,
  configuracoes BOOLEAN DEFAULT FALSE,
  luzia BOOLEAN DEFAULT FALSE,
  criar_usuarios BOOLEAN DEFAULT FALSE,
  gerenciar_permissoes BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Configurações da Clínica
CREATE TABLE IF NOT EXISTS configuracoes_clinica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  configuracoes JSONB NOT NULL DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinica_id, categoria)
);

-- Políticas de Segurança (RLS)

-- Habilitar RLS em todas as tabelas
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_clinica ENABLE ROW LEVEL SECURITY;

-- Políticas para Clínicas
CREATE POLICY "Usuários podem ver suas próprias clínicas" 
  ON clinicas FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT auth_id FROM usuarios WHERE clinica_id = clinicas.id
    )
  );

CREATE POLICY "Usuários master podem editar suas próprias clínicas" 
  ON clinicas FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT auth_id FROM usuarios WHERE clinica_id = clinicas.id AND tipo = 'master'
    )
  );

-- Políticas para Usuários
CREATE POLICY "Usuários podem ver outros usuários da mesma clínica" 
  ON usuarios FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT auth_id FROM usuarios u WHERE u.clinica_id = usuarios.clinica_id
    )
  );

CREATE POLICY "Usuários podem editar seu próprio perfil" 
  ON usuarios FOR UPDATE 
  USING (auth.uid() = auth_id);

CREATE POLICY "Usuários com permissão podem criar novos usuários" 
  ON usuarios FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT u.auth_id FROM usuarios u 
      JOIN permissoes_usuario p ON u.id = p.usuario_id 
      WHERE p.criar_usuarios = true AND u.clinica_id = usuarios.clinica_id
    )
  );

-- Políticas para Permissões
CREATE POLICY "Usuários podem ver permissões da mesma clínica" 
  ON permissoes_usuario FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT auth_id FROM usuarios u 
      WHERE u.id = permissoes_usuario.usuario_id OR (
        u.clinica_id = (SELECT clinica_id FROM usuarios WHERE id = permissoes_usuario.usuario_id)
      )
    )
  );

CREATE POLICY "Usuários com permissão podem gerenciar permissões" 
  ON permissoes_usuario FOR ALL 
  USING (
    auth.uid() IN (
      SELECT u.auth_id FROM usuarios u 
      JOIN permissoes_usuario p ON u.id = p.usuario_id 
      WHERE p.gerenciar_permissoes = true AND 
      u.clinica_id = (SELECT clinica_id FROM usuarios WHERE id = permissoes_usuario.usuario_id)
    )
  );

-- Políticas para Configurações
CREATE POLICY "Usuários podem ver configurações da sua clínica" 
  ON configuracoes_clinica FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT auth_id FROM usuarios WHERE clinica_id = configuracoes_clinica.clinica_id
    )
  );

CREATE POLICY "Usuários com permissão podem editar configurações" 
  ON configuracoes_clinica FOR ALL 
  USING (
    auth.uid() IN (
      SELECT u.auth_id FROM usuarios u 
      JOIN permissoes_usuario p ON u.id = p.usuario_id 
      WHERE p.configuracoes = true AND u.clinica_id = configuracoes_clinica.clinica_id
    )
  );

-- Funções e Triggers

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamp
CREATE TRIGGER update_clinicas_updated_at
BEFORE UPDATE ON clinicas
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_permissoes_updated_at
BEFORE UPDATE ON permissoes_usuario
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_configuracoes_updated_at
BEFORE UPDATE ON configuracoes_clinica
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Função para criar permissões padrão ao criar usuário
CREATE OR REPLACE FUNCTION create_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar permissões padrão baseadas no tipo de usuário
  IF NEW.tipo = 'master' THEN
    INSERT INTO permissoes_usuario (
      usuario_id, dashboard, pacientes, profissionais, agenda, 
      financeiro, estoque, catalogo_servicos, configuracoes, 
      luzia, criar_usuarios, gerenciar_permissoes
    ) VALUES (
      NEW.id, true, true, true, true, true, true, true, true, true, true, true
    );
  ELSIF NEW.tipo = 'gerente' THEN
    INSERT INTO permissoes_usuario (
      usuario_id, dashboard, pacientes, profissionais, agenda, 
      financeiro, estoque, catalogo_servicos, configuracoes, 
      luzia, criar_usuarios, gerenciar_permissoes
    ) VALUES (
      NEW.id, true, true, true, true, true, false, true, false, true, true, true
    );
  ELSE
    INSERT INTO permissoes_usuario (
      usuario_id, dashboard, pacientes, profissionais, agenda, 
      financeiro, estoque, catalogo_servicos, configuracoes, 
      luzia, criar_usuarios, gerenciar_permissoes
    ) VALUES (
      NEW.id, true, true, false, true, false, false, true, false, true, false, false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar permissões padrão
CREATE TRIGGER create_user_permissions
AFTER INSERT ON usuarios
FOR EACH ROW EXECUTE PROCEDURE create_default_permissions();

-- Função para criar configurações padrão ao criar clínica
CREATE OR REPLACE FUNCTION create_default_clinic_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Configurações de Exibição e Locale
  INSERT INTO configuracoes_clinica (clinica_id, categoria, configuracoes)
  VALUES (NEW.id, 'exibicao', '{
    "formato_data": "dd/MM/yyyy",
    "formato_hora": "HH:mm",
    "fuso_horario": "America/Sao_Paulo",
    "formato_moeda": "BRL",
    "simbolo_moeda": "R$"
  }');
  
  -- Configurações de Agenda
  INSERT INTO configuracoes_clinica (clinica_id, categoria, configuracoes)
  VALUES (NEW.id, 'agenda', '{
    "duracao_padrao": 30,
    "permitir_overbooking": false,
    "status_personalizados": ["Agendado", "Confirmado", "Em Atendimento", "Concluído", "Cancelado", "Faltou"]
  }');
  
  -- Configurações de Pacientes
  INSERT INTO configuracoes_clinica (clinica_id, categoria, configuracoes)
  VALUES (NEW.id, 'pacientes', '{
    "cpf_obrigatorio": true,
    "permitir_duplicatas": false,
    "campos_obrigatorios": ["nome", "telefone", "email"]
  }');
  
  -- Configurações Financeiras
  INSERT INTO configuracoes_clinica (clinica_id, categoria, configuracoes)
  VALUES (NEW.id, 'financeiro', '{
    "meios_pagamento": ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Transferência"],
    "max_parcelas": 12,
    "taxa_juros": 0
  }');
  
  -- Configurações de Interface
  INSERT INTO configuracoes_clinica (clinica_id, categoria, configuracoes)
  VALUES (NEW.id, 'interface', '{
    "tema": "claro",
    "densidade": "normal",
    "itens_por_pagina": 20,
    "dashboard_cards": ["pacientes", "consultas", "receita", "profissionais"]
  }');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar configurações padrão
CREATE TRIGGER create_clinic_settings
AFTER INSERT ON clinicas
FOR EACH ROW EXECUTE PROCEDURE create_default_clinic_settings();

