# DentalCare Pro - Configuração VSCode

## 📋 **DEPENDÊNCIAS NECESSÁRIAS**

### **Node.js e NPM**
```bash
# Instalar Node.js 18+ e npm
node --version  # Deve ser 18+
npm --version   # Deve ser 9+
```

### **Extensões VSCode Recomendadas**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-css-peek"
  ]
}
```

## 🚀 **INSTALAÇÃO E CONFIGURAÇÃO**

### **1. Extrair o Projeto**
```bash
# Extrair o ZIP em uma pasta
unzip dentalcare-pro-final.zip
cd dentalcare-pro-work
```

### **2. Instalar Dependências**
```bash
# Instalar todas as dependências
npm install
```

### **3. Configurar Ambiente**
```bash
# Copiar arquivo de ambiente
cp .env.example .env.local

# Editar .env.local com suas configurações do Supabase
# NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### **4. Executar em Desenvolvimento**
```bash
# Rodar na porta 3000 (padrão)
npm run dev

# Ou especificar porta
npm run dev -- -p 3000
```

### **5. Build para Produção**
```bash
# Gerar build otimizado
npm run build

# Executar build
npm start
```

## 📦 **DEPENDÊNCIAS DO PROJETO**

### **Principais**
- **Next.js 14.2.5** - Framework React
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Supabase** - Backend e banco de dados

### **Dependências Completas**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.5",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## 🗄️ **CONFIGURAÇÃO DO BANCO (SUPABASE)**

### **1. Criar Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima

### **2. Executar Scripts SQL**
```sql
-- Executar na ordem:
-- 1. sql/schema.sql (estrutura das tabelas)
-- 2. sql/rls.sql (políticas de segurança)
```

### **3. Configurar Autenticação**
- Habilitar autenticação por email
- Configurar templates de email (opcional)

## 🎯 **ESTRUTURA DO PROJETO**

```
dentalcare-pro-work/
├── app/                    # Páginas Next.js 14 (App Router)
│   ├── (auth)/            # Páginas de autenticação
│   ├── (dashboard)/       # Páginas do dashboard
│   ├── (public)/          # Páginas públicas
│   └── globals.css        # Estilos globais
├── components/            # Componentes React
│   ├── headers/          # Cabeçalhos
│   ├── layout/           # Layouts
│   └── sidebars/         # Barras laterais
├── lib/                  # Utilitários e hooks
├── sql/                  # Scripts do banco de dados
└── public/               # Arquivos estáticos
```

## 🔧 **COMANDOS ÚTEIS**

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build           # Build de produção
npm run start           # Servidor de produção
npm run lint            # Verificar código

# Limpeza
rm -rf .next            # Limpar cache do Next.js
rm -rf node_modules     # Limpar dependências
npm install             # Reinstalar dependências
```

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Erro de Porta Ocupada**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```

### **Erro de Dependências**
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### **Erro de Build**
```bash
# Limpar cache e rebuildar
rm -rf .next
npm run build
```

## 📱 **FUNCIONALIDADES IMPLEMENTADAS**

### ✅ **Autenticação**
- Login/Cadastro com Supabase Auth
- Validação de senha com critérios
- Visualização de senha (olho)
- Redirecionamento automático

### ✅ **Dashboard**
- Cards com métricas
- Próximas consultas
- Atividade recente
- Layout responsivo

### ✅ **Sidebar Completo**
- Dashboard
- Pacientes
- Profissionais  
- Agenda
- Financeiro
- Estoque
- Catálogo de Serviços
- Configurações
- LuzIA (IA)

### ✅ **Páginas Implementadas**
- Todas as páginas básicas criadas
- Integração com Supabase
- Layouts responsivos
- Sistema de permissões (base)

### ✅ **Design System**
- Gradiente azul-verde no branding
- Logos otimizados
- Ícones personalizados
- Interface profissional

## 🎨 **CUSTOMIZAÇÃO**

### **Cores (Tailwind)**
- Gradiente principal: `from-blue-600 via-blue-700 to-teal-500`
- Texto branding: Gradiente azul-verde escuro
- Cards: Fundo branco com sombra

### **Tipografia**
- Font padrão: System fonts
- Tamanhos: Responsivos com Tailwind

## 📞 **SUPORTE**

Para dúvidas sobre o código:
1. Verificar este README
2. Consultar documentação do Next.js
3. Verificar logs do console do navegador

**Versão:** v1.2.0
**Data:** Agosto 2025

