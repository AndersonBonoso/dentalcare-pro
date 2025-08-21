# 🚀 SETUP LOCAL - DentalCare Pro

Guia rápido para rodar o projeto na sua máquina local.

## ⚡ Instalação Rápida (5 minutos)

### 1. Pré-requisitos
- ✅ **Node.js 18+** instalado
- ✅ **VSCode** instalado
- ✅ **Conta no Supabase** criada

### 2. Configuração

#### 2.1 Extrair e Abrir
```bash
# 1. Extrair o ZIP para uma pasta (ex: C:\Projetos\dentalcare-pro)
# 2. Abrir no VSCode: File > Open Folder
```

#### 2.2 Instalar Dependências
```bash
# No terminal do VSCode (Ctrl + `)
npm install
```

#### 2.3 Configurar Ambiente
```bash
# 1. Renomear .env.example para .env.local
# 2. Editar .env.local com suas credenciais do Supabase
```

**Como obter credenciais do Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login e selecione seu projeto
3. Vá em Settings > API
4. Copie "Project URL" e "anon public" key

#### 2.4 Configurar Banco
```sql
-- No Supabase SQL Editor, execute na ordem:
-- 1. Copie e cole o conteúdo de sql/schema.sql
-- 2. Copie e cole o conteúdo de sql/rls.sql
```

#### 2.5 Rodar Projeto
```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Servidor local
npm run build           # Build de produção
npm run start           # Servidor de produção

# Limpeza (se houver problemas)
rm -rf .next            # Limpar cache (Windows: rmdir /s .next)
npm run dev             # Rodar novamente
```

## 🚨 Problemas Comuns

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Supabase connection failed"
- Verifique se as credenciais no `.env.local` estão corretas
- Confirme que as tabelas foram criadas no Supabase

### Dashboard não carrega corretamente
```bash
rm -rf .next
npm run dev
```

## 📁 Estrutura Importante

```
dentalcare-pro-work/
├── .env.local              # ← Suas credenciais (criar)
├── app/(dashboard)/page.tsx # ← Dashboard principal
├── public/icons/           # ← Ícones do sistema
├── sql/                    # ← Scripts do banco
└── package.json
```

## ✅ Teste de Funcionamento

1. **Página inicial:** http://localhost:3000
2. **Login:** Criar conta ou fazer login
3. **Dashboard:** Verificar se carrega corretamente
4. **Sidebar:** Testar navegação entre páginas

## 🆘 Suporte

Se algo não funcionar:
1. Verifique se seguiu todos os passos
2. Confirme que Node.js 18+ está instalado
3. Verifique se as credenciais do Supabase estão corretas
4. Limpe o cache: `rm -rf .next && npm run dev`

---

**Tempo estimado de setup:** 5-10 minutos  
**Versão:** 1.2.0

