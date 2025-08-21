# DentalCare Pro - Sistema de Gestão Odontológica v1.2.0

Sistema completo para gestão de clínicas odontológicas com controle de permissões e multi-tenancy.

## 🚀 SETUP RÁPIDO PARA DESENVOLVIMENTO LOCAL

### 📋 Pré-requisitos
- **Node.js** (versão 18+) - [Download](https://nodejs.org/)
- **VSCode** (recomendado) - [Download](https://code.visualstudio.com/)
- **Conta Supabase** - [Criar conta](https://supabase.com)

### ⚡ Instalação em 5 Passos

#### 1. Extrair e Abrir Projeto
```bash
# Extrair o ZIP para uma pasta
# Abrir a pasta no VSCode: File > Open Folder
```

#### 2. Instalar Dependências
```bash
# No terminal do VSCode (Terminal > New Terminal)
npm install
```

#### 3. Configurar Variáveis de Ambiente
```bash
# Renomear .env.example para .env.local
# Preencher com suas credenciais do Supabase:

NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

#### 4. Configurar Banco de Dados
```sql
-- No Supabase SQL Editor, executar na ordem:
-- 1. sql/schema.sql (criar tabelas)
-- 2. sql/rls.sql (configurar segurança)
```

#### 5. Rodar o Projeto
```bash
npm run dev
# Acesse: http://localhost:3000
```

### 🔧 Scripts Úteis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar código
```

### 🚨 Problema Conhecido - Dashboard
**Sintoma:** Botão "Editar Cards" não aparece, ícones antigos sendo exibidos
**Arquivos:** `/app/(dashboard)/page.tsx`, `/public/icons/icone_*.png`
**Solução:** Limpar cache: `rm -rf .next && npm run dev`

## 🚀 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- **Login/Cadastro** com identidade visual DentalCare Pro
- **Confirmação por email** via Supabase Auth
- **Todo usuário que se cadastra** automaticamente vira **Master**
- **Redirecionamento automático** para dashboard após login

### 👑 Sistema de Permissões

#### **Usuário Master (Proprietário da Clínica)**
- ✅ Acesso total a todas as funcionalidades
- ✅ Pode convidar usuários secundários
- ✅ Pode configurar permissões granulares
- ✅ Pode remover usuários secundários
- ✅ Acesso exclusivo às Configurações

#### **Usuários Secundários (Funcionários)**
Permissões configuráveis pelo Master:
- 📅 **Agendamento**: Acesso à agenda e criação de consultas
- 💳 **Checkout**: Gerar links de pagamento e cobranças
- 👥 **Pacientes**: CRUD de pacientes
- 🦷 **Profissionais**: CRUD de dentistas/profissionais

### 🏗️ Arquitetura do Sistema

#### **Frontend (Next.js 14)**
```
app/
├── (auth)/
│   ├── login/page.tsx          # Página de login
│   └── cadastro/page.tsx       # Página de cadastro
├── (dashboard)/
│   └── configuracoes/page.tsx  # Gerenciamento de usuários e permissões
├── layout.tsx                  # Layout principal
└── page.tsx                    # Dashboard principal

components/
└── layout/
    └── AppShell.tsx           # Shell com sidebar e controle de permissões

lib/
├── supabaseBrowser.ts         # Cliente Supabase
└── useProfile.ts              # Hook para dados do usuário e permissões
```

#### **Backend (Supabase)**
```sql
-- Tabelas principais
clinicas                    # Multi-tenancy
usuarios                    # Usuários do sistema
permissoes_usuarios         # Permissões granulares
pacientes                   # CRUD de pacientes
profissionais              # CRUD de profissionais
servicos                   # Catálogo de serviços
agendamentos               # Sistema de agenda
```

### 🎨 Identidade Visual DentalCare Pro

#### **Cores**
- **Gradiente Principal**: `linear-gradient(135deg, #2563eb 0%, #00BFA6 100%)`
- **Primária**: `#2563eb` (Azul)
- **Secundária**: `#00BFA6` (Turquesa)
- **Background**: Gradiente azul → turquesa

#### **Tipografia**
- **Fonte**: Poppins (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

#### **Componentes**
- **Cards**: Brancos com sombra suave
- **Botões**: Gradiente com hover
- **Inputs**: Bordas arredondadas com focus ring
- **Logo**: Ícone de dente em círculo gradiente

### 🔒 Segurança e Multi-Tenancy

#### **Row Level Security (RLS)**
Todas as tabelas implementam RLS baseado em `clinica_id`:
```sql
-- Exemplo de política RLS
CREATE POLICY "Users can only see their clinic data" ON pacientes
FOR ALL USING (clinica_id = get_user_clinic_id());
```

#### **Controle de Acesso**
- **Frontend**: Componentes condicionais baseados em permissões
- **Backend**: Políticas RLS no Supabase
- **API**: Validação de permissões em todas as rotas

### 📱 Interface Responsiva

#### **Desktop**
- Sidebar fixa com navegação completa
- Cards em grid responsivo
- Dashboard com estatísticas

#### **Mobile**
- Sidebar colapsável com backdrop
- Layout adaptativo
- Touch-friendly

### 🛠️ Tecnologias Utilizadas

#### **Frontend**
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

#### **Backend**
- **Supabase** - BaaS (Auth + Database)
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança

## 🚀 Como Executar

### 1. Configuração do Ambiente
```bash
# Clone o repositório
git clone <repo-url>
cd dentalcare-pro-work

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
```

### 2. Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configuração do Banco
Execute os scripts SQL na ordem:
```sql
-- 1. Criar tabelas
\i sql/schema.sql

-- 2. Configurar RLS
\i sql/rls.sql
```

### 4. Executar o Projeto
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 📋 Roadmap

### ✅ Fase 1 - Concluída
- [x] Sistema de autenticação
- [x] Controle de permissões
- [x] Interface base
- [x] Configurações de usuários

### 🔄 Fase 2 - Em Desenvolvimento
- [ ] CRUD completo de Pacientes
- [ ] CRUD completo de Profissionais
- [ ] CRUD completo de Serviços
- [ ] Sistema de Agenda

### 📅 Fase 3 - Planejada
- [ ] Sistema de Checkout/Pagamentos
- [ ] Relatórios e Dashboard avançado
- [ ] Notificações e lembretes
- [ ] App mobile

## 🧪 Testes

### Fluxo de Teste Completo
1. **Cadastro**: Criar conta (vira Master automaticamente)
2. **Login**: Entrar no sistema
3. **Configurações**: Convidar usuário secundário
4. **Permissões**: Configurar acesso granular
5. **Interface**: Verificar sidebar dinâmica

### Usuários de Teste
```
Master:
- Email: joao@dentalcare.com
- Senha: 123456
- Permissões: Todas

Secundário (a ser criado):
- Permissões configuráveis via interface
```

## 📞 Suporte

Para dúvidas ou suporte:
- **Email**: suporte@dentalcare.com
- **Documentação**: README.md
- **Issues**: GitHub Issues

---

**DentalCare Pro v1.1.0** - Sistema de Gestão Odontológica Completo
*Desenvolvido com ❤️ para profissionais da odontologia*
