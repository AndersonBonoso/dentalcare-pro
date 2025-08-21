-- Tabela de clínicas (multi-tenant)
CREATE TABLE IF NOT EXISTS clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_master BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auth_user_id)
);

-- Tabela de permissões para usuários secundários
CREATE TABLE IF NOT EXISTS permissoes_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(auth_user_id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  agendamento BOOLEAN DEFAULT FALSE,
  checkout BOOLEAN DEFAULT FALSE,
  pacientes BOOLEAN DEFAULT FALSE,
  profissionais BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- Tabela de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  data_nascimento DATE,
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS profissionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  cro VARCHAR(20),
  especialidade VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de serviços/procedimentos
CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2),
  duracao_minutos INTEGER DEFAULT 60,
  categoria VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'agendado',
  observacoes TEXT,
  valor DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_clinica_id ON usuarios(clinica_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_usuario_id ON permissoes_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_id ON pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_profissionais_clinica_id ON profissionais(clinica_id);
CREATE INDEX IF NOT EXISTS idx_servicos_clinica_id ON servicos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica_id ON agendamentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissoes_usuarios_updated_at BEFORE UPDATE ON permissoes_usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON servicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Tabela de categorias de estoque
CREATE TABLE IF NOT EXISTS categorias_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  contato_responsavel VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos/materiais do estoque
CREATE TABLE IF NOT EXISTS produtos_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_estoque(id) ON DELETE SET NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  codigo_barras VARCHAR(100),
  unidade_medida VARCHAR(20) DEFAULT 'unidade',
  quantidade_atual INTEGER DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 0,
  preco_custo DECIMAL(10,2),
  preco_venda DECIMAL(10,2),
  data_validade DATE,
  lote VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de movimentações do estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos_estoque(id) ON DELETE CASCADE,
  tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste')),
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER NOT NULL,
  quantidade_nova INTEGER NOT NULL,
  motivo VARCHAR(255),
  observacoes TEXT,
  usuario_id UUID REFERENCES usuarios(auth_user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações da LuzIA (Agente de IA)
CREATE TABLE IF NOT EXISTS luzia_configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT FALSE,
  confirmacao_agendamento BOOLEAN DEFAULT FALSE,
  reagendamento_automatico BOOLEAN DEFAULT FALSE,
  cancelamento_automatico BOOLEAN DEFAULT FALSE,
  antecedencia_confirmacao_horas INTEGER DEFAULT 24,
  antecedencia_reagendamento_horas INTEGER DEFAULT 2,
  mensagem_confirmacao TEXT DEFAULT 'Olá! Este é um lembrete do seu agendamento na {clinica} para {data} às {hora}. Confirme digitando SIM ou reagende digitando REAGENDAR.',
  mensagem_reagendamento TEXT DEFAULT 'Seu agendamento foi reagendado para {nova_data} às {nova_hora}. Confirme digitando SIM.',
  mensagem_cancelamento TEXT DEFAULT 'Seu agendamento foi cancelado. Entre em contato conosco para reagendar.',
  telefone_whatsapp VARCHAR(20),
  api_key_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(clinica_id)
);

-- Tabela de logs da LuzIA
CREATE TABLE IF NOT EXISTS luzia_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE CASCADE,
  tipo_acao VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  mensagem_enviada TEXT,
  resposta_recebida TEXT,
  telefone_destino VARCHAR(20),
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_categorias_estoque_clinica_id ON categorias_estoque(clinica_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_clinica_id ON fornecedores(clinica_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_clinica_id ON produtos_estoque(clinica_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_categoria_id ON produtos_estoque(categoria_id);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_fornecedor_id ON produtos_estoque(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_clinica_id ON movimentacoes_estoque(clinica_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_estoque_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_luzia_configuracoes_clinica_id ON luzia_configuracoes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_luzia_logs_clinica_id ON luzia_logs(clinica_id);
CREATE INDEX IF NOT EXISTS idx_luzia_logs_agendamento_id ON luzia_logs(agendamento_id);

-- Triggers para updated_at das novas tabelas
CREATE TRIGGER update_categorias_estoque_updated_at BEFORE UPDATE ON categorias_estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_estoque_updated_at BEFORE UPDATE ON produtos_estoque FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_luzia_configuracoes_updated_at BEFORE UPDATE ON luzia_configuracoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

