# 🔧 Guia Completo de Configuração - Supabase + Vercel

## ✅ Suas Credenciais (Já Configuradas!)

```
SUPABASE_URL=https://uhnojbcetvwnfjmqztdn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 PASSO A PASSO - INSTALAÇÃO COMPLETA

### **PASSO 1: Obter Senha do Banco de Dados**

1. Acesse: https://supabase.com/dashboard/project/uhnojbcetvwnfjmqztdn
2. Vá em **Settings** (⚙️) → **Database**
3. Role até **Connection string**
4. Copie a **senha do banco** que você criou ao configurar o projeto

⚠️ **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` nas connection strings abaixo pela senha real!

---

### **PASSO 2: Configurar Arquivo .env**

Edite o arquivo `.env` e **SUBSTITUA `[YOUR-PASSWORD]` pela sua senha**:

```bash
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.uhnojbcetvwnfjmqztdn:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.uhnojbcetvwnfjmqztdn:SUA_SENHA_AQUI@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://uhnojbcetvwnfjmqztdn.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobm9qYmNldHZ3bmZqbXF6dGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTA3MDcsImV4cCI6MjA3ODE4NjcwN30.pAVzpT1mhxk8_mwRmvj_pCD_L23rKnIHu5wG8r5cG-I"

# JWT Secret
JWT_SECRET="drywall-super-secret-jwt-key-production-2024-secure"

# Server Configuration
PORT=3001
NODE_ENV=development
```

---

### **PASSO 3: Criar Bucket no Supabase**

1. Acesse: https://supabase.com/dashboard/project/uhnojbcetvwnfjmqztdn/storage/buckets
2. Clique em **"Create a new bucket"**
3. Preencha:
   - **Name**: `drywall-uploads`
   - **Public bucket**: ✅ **SIM** (marque esta opção!)
   - **File size limit**: 10 MB
4. Clique em **"Create bucket"**

---

### **PASSO 4: Instalar Dependências**

```bash
npm install
```

---

### **PASSO 5: Gerar Prisma Client**

```bash
npm run db:generate
```

---

### **PASSO 6: Criar Tabelas no Banco**

```bash
npm run db:push
```

Você verá:
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

### **PASSO 7: Inserir Dados de Teste**

```bash
npx tsx server/seed.ts
```

Você verá:
```
✅ Users created
✅ Sites created
✅ Materials created
✅ Activities created
🎉 Database seeded successfully!
```

---

### **PASSO 8: Testar Localmente**

```bash
npm run dev
```

Acesse: **http://localhost:3000**

Login com:
- **Email**: supervisor@demo.com
- **Senha**: demo123

---

## 🚀 DEPLOY NO VERCEL

### **PASSO 9: Conectar GitHub ao Vercel**

1. Acesse: https://vercel.com
2. Login com GitHub
3. Clique em **"Add New..." → "Project"**
4. Selecione o repositório `drypro2`

---

### **PASSO 10: Configurar Variáveis de Ambiente no Vercel**

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres.uhnojbcetvwnfjmqztdn:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | `postgresql://postgres.uhnojbcetvwnfjmqztdn:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `drywall-super-secret-jwt-key-production-2024-secure` |
| `SUPABASE_URL` | `https://uhnojbcetvwnfjmqztdn.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (sua chave completa) |
| `NODE_ENV` | `production` |

⚠️ **LEMBRE-SE**: Substitua `SUA_SENHA` pela senha real do banco!

---

### **PASSO 11: Deploy**

1. Clique em **"Deploy"**
2. Aguarde o build (~3-5 minutos)
3. Acesse a URL gerada: `https://seu-projeto.vercel.app`

---

## ✅ CHECKLIST DE VERIFICAÇÃO

```
☑️ Senha do banco obtida no Supabase
☑️ Arquivo .env configurado com senha correta
☑️ Bucket 'drywall-uploads' criado no Supabase (PÚBLICO!)
☑️ npm install executado
☑️ npm run db:generate executado
☑️ npm run db:push executado
☑️ npx tsx server/seed.ts executado
☑️ npm run dev testado localmente
☑️ Vercel conectado ao GitHub
☑️ Variáveis de ambiente configuradas no Vercel
☑️ Deploy realizado
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### **Localmente:**
1. `npm run dev`
2. Abrir http://localhost:3000
3. Login: supervisor@demo.com / demo123
4. Criar uma atividade
5. Upload de foto em uma fase

### **Em Produção (Vercel):**
1. Acessar https://seu-projeto.vercel.app
2. Fazer login
3. Testar criação de atividades
4. Testar upload de fotos

---

## 🆘 RESOLUÇÃO DE PROBLEMAS

### **Erro: "Can't reach database server"**
- ✅ Verifique se substituiu `[YOUR-PASSWORD]` pela senha real
- ✅ Teste a conexão no Prisma: `npx prisma db push`

### **Erro: "Storage bucket not found"**
- ✅ Verifique se criou o bucket `drywall-uploads`
- ✅ Confirme que o bucket está marcado como **PUBLIC**

### **Erro no build do Vercel**
- ✅ Verifique se todas as variáveis de ambiente estão configuradas
- ✅ Veja os logs no dashboard do Vercel

### **Upload de foto não funciona**
- ✅ Bucket deve ser público
- ✅ SUPABASE_URL e SUPABASE_ANON_KEY corretos

---

## 📊 ESTRUTURA DO SUPABASE

Após configurar, você terá:

### **Database (PostgreSQL)**
- 12 tabelas criadas via Prisma
- Dados de demonstração inseridos
- Connection pooling configurado

### **Storage**
- Bucket: `drywall-uploads`
  - Pasta: `photos/` (fotos das fases)
  - Pasta: `audio/` (gravações de voz)

---

## 🔐 SEGURANÇA

✅ **Já Implementado:**
- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- SQL injection protection (Prisma)
- CORS configurado
- File upload validation

⚠️ **Em Produção:**
- Mude o `JWT_SECRET` para algo único
- Use variáveis de ambiente secretas no Vercel
- Nunca commite o arquivo `.env`

---

## 📱 PWA (Progressive Web App)

A aplicação é um PWA e pode ser instalada:
- **Desktop**: Ícone de instalação no navegador
- **Mobile**: "Adicionar à tela inicial"

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configurar domínio personalizado no Vercel
2. ✅ Ativar Vercel Analytics (grátis)
3. ✅ Configurar notificações push
4. ✅ Adicionar mais dados de teste

---

## 📞 SUPORTE

Problemas? Verifique:
1. Logs do Vercel: https://vercel.com/dashboard
2. Logs do Supabase: https://supabase.com/dashboard
3. Console do navegador (F12)

---

**🚀 Tudo configurado e pronto para uso!**
