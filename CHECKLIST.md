# ✅ CHECKLIST DE CONFIGURAÇÃO

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-requisitos

- [ ] Node.js instalado (versão 18+)
- [ ] NPM instalado
- [ ] Git instalado
- [ ] Conta no Supabase criada
- [ ] Editor de código (VS Code recomendado)

## 🗄️ Supabase

- [ ] Projeto criado no Supabase
- [ ] URL do projeto copiada
- [ ] Chave anon/public copiada
- [ ] SQL das tabelas executado com sucesso
- [ ] 4 tabelas criadas (preco_km, preco_kg, taxa_arrancada, lancamentos)
- [ ] RLS desabilitado nas tabelas
- [ ] (Opcional) Dados iniciais inseridos

## 💻 Projeto Local

- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado na raiz
- [ ] Variáveis `VITE_SUPABASE_URL` configurada no `.env`
- [ ] Variável `VITE_SUPABASE_ANON_KEY` configurada no `.env`
- [ ] Projeto rodando sem erros (`npm run dev`)

## 🧪 Testes Básicos

- [ ] Sistema abre no navegador (http://localhost:5173)
- [ ] Menu lateral aparece
- [ ] Todas as páginas carregam sem erro:
  - [ ] Dashboard
  - [ ] Preço/KM
  - [ ] Preço/KG
  - [ ] Taxa Arrancada
  - [ ] Lançamentos
  - [ ] Relatórios
- [ ] Console do navegador (F12) sem erros críticos

## 🎯 Funcionalidades

### Preço por KM
- [ ] Consegue cadastrar novo preço
- [ ] Preço aparece na listagem
- [ ] Consegue editar preço
- [ ] Consegue mudar status ativo/inativo
- [ ] Consegue excluir preço

### Preço por KG
- [ ] Consegue cadastrar novo preço
- [ ] Preço aparece na listagem
- [ ] Consegue editar preço
- [ ] Consegue mudar status ativo/inativo
- [ ] Consegue excluir preço

### Taxa de Arrancada
- [ ] Consegue cadastrar nova taxa (com range de KM)
- [ ] Taxa aparece na listagem ordenada por KM
- [ ] Consegue editar taxa
- [ ] Consegue mudar status ativo/inativo
- [ ] Consegue excluir taxa

### Lançamentos
- [ ] Consegue preencher formulário
- [ ] KM Total é calculado automaticamente
- [ ] Cálculo aparece em tempo real
- [ ] Mostra Valor KM calculado
- [ ] Mostra Valor Peso calculado
- [ ] Mostra Taxa de Arrancada aplicada
- [ ] Mostra Preço Total
- [ ] Consegue salvar lançamento
- [ ] Lançamento aparece na listagem
- [ ] Consegue editar lançamento
- [ ] Consegue excluir lançamento

### Dashboard
- [ ] Cards mostram dados corretos
- [ ] Total de viagens está correto
- [ ] Total KM está correto
- [ ] Total Peso está correto
- [ ] Receita total está correta
- [ ] Dados são do mês atual

### Relatórios
- [ ] Consegue selecionar mês
- [ ] Mostra resumo do mês correto
- [ ] Mostra médias calculadas
- [ ] Gráfico aparece (se houver dados)
- [ ] Tabela de detalhamento aparece
- [ ] Valores estão corretos

## 📱 Responsividade

- [ ] Funciona em tela mobile (< 768px)
- [ ] Menu hamburguer aparece em mobile
- [ ] Tabelas rolam horizontalmente em mobile
- [ ] Cards empilham corretamente em mobile
- [ ] Funciona em tablet (768px - 1024px)
- [ ] Funciona em desktop (> 1024px)

## 🎨 Visual

- [ ] Cores estão corretas (azul e laranja)
- [ ] Fontes legíveis
- [ ] Espaçamentos adequados
- [ ] Botões com hover funcionando
- [ ] Ícones aparecem corretamente
- [ ] Sem elementos quebrados

## ⚠️ Problemas Comuns

Se algo não funciona, verifique:

### Erro: "Missing Supabase environment variables"
- ✅ Arquivo `.env` existe na raiz do projeto?
- ✅ As variáveis estão escritas corretamente?
- ✅ Não há espaços antes/depois do `=`?
- ✅ Reiniciou o servidor após criar o `.env`?

### Erro: "Failed to fetch" ou erro 400/500
- ✅ URL do Supabase está correta?
- ✅ Chave está correta?
- ✅ Tabelas foram criadas?
- ✅ RLS foi desabilitado?

### Cálculo não funciona
- ✅ Existe preço/km ativo?
- ✅ Existe preço/kg ativo?
- ✅ Existe taxa de arrancada para o range de KM?

### Dados não aparecem
- ✅ Já cadastrou os preços?
- ✅ Já cadastrou as taxas?
- ✅ Já fez algum lançamento?
- ✅ Verificou se está no mês correto (Relatórios)?

## ✨ Configuração Inicial Recomendada

Após verificar que tudo funciona, faça uma configuração inicial:

### 1. Cadastrar Preço por KM
```
Valor: R$ 2,50 (ou o valor que você usa)
```

### 2. Cadastrar Preço por KG
```
Valor: R$ 0,15 (ou o valor que você usa)
```

### 3. Cadastrar Taxas de Arrancada
```
Faixa 1: 0 a 200 km → R$ 157,00
Faixa 2: 201 a 300 km → R$ 236,00
Faixa 3: 301 a 400 km → R$ 315,00
Faixa 4: 401 a 500 km → R$ 394,00
```

### 4. Fazer um Lançamento de Teste
```
Data: Hoje
KM Inicial: 100
KM Final: 350
Peso: 500 kg
```

Verifique se o cálculo está correto!

## 🎉 Sistema Pronto!

Se todos os itens acima estão ✅, seu sistema está **100% funcional**!

---

## 📞 Próximos Passos

- [ ] Fazer backup do arquivo `.env` (em local seguro)
- [ ] Anotar credenciais do Supabase
- [ ] Testar com dados reais
- [ ] Treinar usuários (se houver)
- [ ] Configurar deploy (opcional)
- [ ] Fazer backup regular dos dados

---

**Data de verificação**: _________________

**Status final**: [ ] Tudo OK  [ ] Pendências

**Observações**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**🎊 Parabéns! Seu sistema de gestão de transportes está pronto para uso!**
