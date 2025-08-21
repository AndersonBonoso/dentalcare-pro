-- Habilitar RLS em todas as tabelas
ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Função para obter clinica_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_clinica_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinica_id 
    FROM usuarios 
    WHERE auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para clinicas
CREATE POLICY "Usuários podem ver apenas sua clínica" ON clinicas
  FOR ALL USING (id = get_user_clinica_id());

-- Políticas para usuarios
CREATE POLICY "Usuários podem ver apenas usuários da mesma clínica" ON usuarios
  FOR ALL USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Usuários podem inserir novos usuários na sua clínica" ON usuarios
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

-- Políticas para permissoes_usuarios
CREATE POLICY "Usuários podem ver permissões da mesma clínica" ON permissoes_usuarios
  FOR ALL USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Masters podem gerenciar permissões da sua clínica" ON permissoes_usuarios
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = auth.uid() 
      AND is_master = true
    )
  );

-- Políticas para pacientes
CREATE POLICY "Usuários podem ver pacientes da mesma clínica" ON pacientes
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Usuários com permissão podem gerenciar pacientes" ON pacientes
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    (
      -- Masters têm acesso total
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE auth_user_id = auth.uid() 
        AND is_master = true
      ) OR
      -- Usuários secundários com permissão de pacientes
      EXISTS (
        SELECT 1 FROM permissoes_usuarios p
        JOIN usuarios u ON u.auth_user_id = p.usuario_id
        WHERE u.auth_user_id = auth.uid() 
        AND p.pacientes = true
      )
    )
  );

-- Políticas para profissionais
CREATE POLICY "Usuários podem ver profissionais da mesma clínica" ON profissionais
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Usuários com permissão podem gerenciar profissionais" ON profissionais
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    (
      -- Masters têm acesso total
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE auth_user_id = auth.uid() 
        AND is_master = true
      ) OR
      -- Usuários secundários com permissão de profissionais
      EXISTS (
        SELECT 1 FROM permissoes_usuarios p
        JOIN usuarios u ON u.auth_user_id = p.usuario_id
        WHERE u.auth_user_id = auth.uid() 
        AND p.profissionais = true
      )
    )
  );

-- Políticas para servicos
CREATE POLICY "Usuários podem ver serviços da mesma clínica" ON servicos
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Políticas para agendamentos
CREATE POLICY "Usuários podem ver agendamentos da mesma clínica" ON agendamentos
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Usuários com permissão podem gerenciar agendamentos" ON agendamentos
  FOR ALL USING (
    clinica_id = get_user_clinica_id() AND
    (
      -- Masters têm acesso total
      EXISTS (
        SELECT 1 FROM usuarios 
        WHERE auth_user_id = auth.uid() 
        AND is_master = true
      ) OR
      -- Usuários secundários com permissão de agendamento
      EXISTS (
        SELECT 1 FROM permissoes_usuarios p
        JOIN usuarios u ON u.auth_user_id = p.usuario_id
        WHERE u.auth_user_id = auth.uid() 
        AND p.agendamento = true
      )
    )
  );

-- Função para criar clínica e usuário master automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_clinica_id UUID;
BEGIN
  -- Criar nova clínica
  INSERT INTO clinicas (nome, email)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Minha Clínica'),
    NEW.email
  )
  RETURNING id INTO new_clinica_id;
  
  -- Criar usuário master
  INSERT INTO usuarios (auth_user_id, clinica_id, nome, email, is_master)
  VALUES (
    NEW.id,
    new_clinica_id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário Master'),
    NEW.email,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar clínica e usuário master automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- Habilitar RLS nas novas tabelas
ALTER TABLE categorias_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE luzia_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE luzia_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias_estoque
CREATE POLICY "Usuários podem ver categorias da mesma clínica" ON categorias_estoque
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Políticas para fornecedores
CREATE POLICY "Usuários podem ver fornecedores da mesma clínica" ON fornecedores
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Políticas para produtos_estoque
CREATE POLICY "Usuários podem ver produtos da mesma clínica" ON produtos_estoque
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Políticas para movimentacoes_estoque
CREATE POLICY "Usuários podem ver movimentações da mesma clínica" ON movimentacoes_estoque
  FOR ALL USING (clinica_id = get_user_clinica_id());

-- Políticas para luzia_configuracoes
CREATE POLICY "Usuários podem ver configurações da LuzIA da mesma clínica" ON luzia_configuracoes
  FOR ALL USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Apenas Masters podem alterar configurações da LuzIA" ON luzia_configuracoes
  FOR UPDATE USING (
    clinica_id = get_user_clinica_id() AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = auth.uid() 
      AND is_master = true
    )
  );

-- Políticas para luzia_logs
CREATE POLICY "Usuários podem ver logs da LuzIA da mesma clínica" ON luzia_logs
  FOR SELECT USING (clinica_id = get_user_clinica_id());

CREATE POLICY "Sistema pode inserir logs da LuzIA" ON luzia_logs
  FOR INSERT WITH CHECK (clinica_id = get_user_clinica_id());

