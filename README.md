# 🚚 James Transportes - Sistema de Gestão

Sistema completo para gestão de transportes com cálculo automático de preços baseado em KM, peso e taxas de arrancada.

## 🎯 Funcionalidades

- ✅ Cadastro de preço por KM (R$/km)
- ✅ Cadastro de preço por KG (R$/kg)
- ✅ Cadastro de taxas de arrancada por faixa de KM
- ✅ Lançamento de viagens com cálculo automático
- ✅ Dashboard com estatísticas do mês
- ✅ Relatórios mensais com gráficos
- ✅ Responsivo (funciona em mobile e desktop)

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Roteamento**: React Router DOM
- **Estilização**: Tailwind CSS
- **Banco de Dados**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Datas**: date-fns
- **Build**: Vite

## 📦 Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

Siga o guia completo em **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** para:
- Criar o projeto no Supabase
- Obter as credenciais
- Criar as tabelas do banco de dados
- Configurar as variáveis de ambiente

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4. Executar o Projeto

```bash
npm run dev
```

O sistema estará disponível em: `http://localhost:5173`

## 📱 Como Usar

### 1. Configuração Inicial

Antes de fazer lançamentos, cadastre:

#### a) Preço por KM
- Acesse "Preço/KM" no menu
- Informe o valor em R$ por quilômetro
- Ex: R$ 2,50

#### b) Preço por KG
- Acesse "Preço/KG" no menu
- Informe o valor em R$ por quilograma
- Ex: R$ 0,15

#### c) Taxa de Arrancada
- Acesse "Taxa Arrancada" no menu
- Cadastre faixas de KM com seus respectivos valores:
  - 0 a 200 km → R$ 157,00
  - 201 a 300 km → R$ 236,00
  - 301 a 400 km → R$ 315,00
  - etc.

### 2. Fazer Lançamentos

- Acesse "Lançamentos" no menu
- Preencha:
  - **Data**: Data da viagem
  - **KM Inicial**: Quilometragem inicial
  - **KM Final**: Quilometragem final
  - **Peso**: Peso transportado em KG
- O sistema calcula automaticamente:
  - KM Total = KM Final - KM Inicial
  - Valor KM = KM Total × Preço/KM
  - Valor Peso = Peso × Preço/KG
  - Taxa de Arrancada (baseada na faixa de KM)
  - **Preço Total** = Valor KM + Valor Peso + Taxa Arrancada

### 3. Ver Dashboard

- Acesse "Dashboard" no menu
- Visualize estatísticas do mês atual:
  - Total de viagens
  - Total de KM rodados
  - Total de peso transportado
  - Receita total

### 4. Consultar Relatórios

- Acesse "Relatórios" no menu
- Selecione o mês desejado
- Veja:
  - Resumo do mês
  - Médias por viagem
  - Gráfico de evolução
  - Detalhamento de todos os lançamentos

## 🎨 Cores e Design

O sistema usa um esquema de cores profissional para transportes:

- **Primary**: Azul (#0ea5e9) - Confiança e profissionalismo
- **Transport**: Amarelo/Laranja - Energia e movimento
- **Success**: Verde - Confirmações
- **Backgrounds**: Cinza claro - Limpeza visual

## 📊 Estrutura do Banco de Dados

### Tabelas

1. **preco_km**: Armazena preços por quilômetro
2. **preco_kg**: Armazena preços por quilograma
3. **taxa_arrancada**: Armazena taxas por faixa de KM
4. **lancamentos**: Armazena todas as viagens realizadas

Veja detalhes completos em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 📱 Responsividade

O sistema é 100% responsivo e funciona perfeitamente em:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1920px+)

## 🔧 Scripts Disponíveis

```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linter
npm run lint
```

## 📁 Estrutura de Pastas

```
JamesTransportes/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   └── Layout.tsx   # Layout principal com menu
│   ├── pages/           # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── PrecoKm.tsx
│   │   ├── PrecoKg.tsx
│   │   ├── TaxaArrancada.tsx
│   │   ├── Lancamentos.tsx
│   │   └── Relatorios.tsx
│   ├── lib/             # Configurações
│   │   └── supabase.ts  # Cliente Supabase
│   ├── types/           # TypeScript types
│   │   └── database.ts  # Tipos do banco
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── .env                 # Variáveis de ambiente (criar)
├── .gitignore
├── package.json
├── README.md
├── SUPABASE_SETUP.md   # Guia de setup do Supabase
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy automático!

### Netlify

1. Faça push do código para o GitHub
2. Acesse [netlify.com](https://netlify.com)
3. New site from Git
4. Configure build command: `npm run build`
5. Publish directory: `dist`
6. Adicione as variáveis de ambiente
7. Deploy!

## 🔒 Segurança

⚠️ **IMPORTANTE**: Esta versão é para desenvolvimento/uso pessoal. Para produção:

1. Implemente autenticação de usuários
2. Configure Row Level Security (RLS) no Supabase
3. Adicione validações no backend
4. Use HTTPS
5. Implemente logs de auditoria

## 📞 Suporte

Se encontrar problemas:

1. Verifique o arquivo [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Revise os logs do console do navegador (F12)
3. Verifique os logs do Supabase
4. Confirme as variáveis de ambiente

## 📝 Licença

Este projeto é de uso livre para fins pessoais e comerciais.

---

**Desenvolvido com ❤️ para facilitar a gestão de transportes**
