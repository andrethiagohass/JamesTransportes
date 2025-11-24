# 🎯 Comandos Úteis - James Transportes

## 📦 NPM Scripts

```bash
# Desenvolvimento (modo watch)
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Executar linter
npm run lint
```

## 🔧 Git Commands

```bash
# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "feat: sistema completo de gestão de transportes"

# Push para o repositório
git push origin main
```

## 🗄️ Supabase - Comandos SQL Úteis

### Ver todos os lançamentos
```sql
SELECT * FROM lancamentos ORDER BY data DESC;
```

### Ver resumo do mês atual
```sql
SELECT 
  COUNT(*) as total_viagens,
  SUM(km_total) as total_km,
  SUM(peso) as total_peso,
  SUM(preco_total) as total_receita
FROM lancamentos 
WHERE data >= DATE_TRUNC('month', CURRENT_DATE)
  AND data < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### Ver preços ativos
```sql
SELECT 'KM' as tipo, valor, created_at FROM preco_km WHERE ativo = true
UNION ALL
SELECT 'KG' as tipo, valor, created_at FROM preco_kg WHERE ativo = true
ORDER BY created_at DESC;
```

### Ver todas as taxas de arrancada
```sql
SELECT 
  km_inicial || ' - ' || km_final || ' km' as faixa,
  valor,
  ativo
FROM taxa_arrancada 
ORDER BY km_inicial;
```

### Limpar dados de teste
```sql
-- CUIDADO! Isso apaga TODOS os dados
TRUNCATE TABLE lancamentos RESTART IDENTITY CASCADE;
TRUNCATE TABLE preco_km RESTART IDENTITY CASCADE;
TRUNCATE TABLE preco_kg RESTART IDENTITY CASCADE;
TRUNCATE TABLE taxa_arrancada RESTART IDENTITY CASCADE;
```

## 🐛 Debug

### Ver logs no navegador
1. Abra o console (F12)
2. Vá na aba "Console"
3. Veja erros em vermelho

### Ver erros de compilação
Os erros aparecem automaticamente no terminal quando `npm run dev` está rodando

### Recarregar cache
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules
npm install

# No Windows PowerShell:
Remove-Item -Recurse -Force node_modules
npm install
```

## 📊 Verificar Integridade do Banco

```sql
-- Verificar se há lançamentos sem taxa de arrancada correspondente
SELECT l.* 
FROM lancamentos l
WHERE NOT EXISTS (
  SELECT 1 FROM taxa_arrancada t 
  WHERE t.ativo = true 
    AND l.km_total >= t.km_inicial 
    AND l.km_total <= t.km_final
);

-- Verificar consistência de cálculos
SELECT 
  id,
  data,
  km_total,
  peso,
  (km_total * valor_km) as calc_valor_km,
  (peso * valor_peso) as calc_valor_peso,
  (km_total * valor_km) + (peso * valor_peso) + taxa_arrancada as calc_total,
  preco_total,
  CASE 
    WHEN ABS(((km_total * valor_km) + (peso * valor_peso) + taxa_arrancada) - preco_total) > 0.01 
    THEN 'ERRO' 
    ELSE 'OK' 
  END as status
FROM lancamentos;
```

## 🔐 Variáveis de Ambiente

### Desenvolvimento (.env)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-aqui
```

### Produção (Vercel/Netlify)
Configure as mesmas variáveis no painel de configuração do serviço

## 📱 Testar Responsividade

### No Chrome/Edge
1. F12 para abrir DevTools
2. Ctrl+Shift+M para modo responsivo
3. Testar diferentes dispositivos:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

## 🚀 Deploy Rápido

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

## 📈 Monitoramento

### Verificar uso do Supabase
1. Supabase Dashboard
2. Settings → Usage
3. Monitore:
   - Database size
   - API requests
   - Bandwidth

### Limites do Plano Gratuito
- Database: 500 MB
- API requests: 50,000/mês
- Bandwidth: 5 GB
- File storage: 1 GB

## 🔄 Backup

### Exportar dados
No Supabase SQL Editor:
```sql
-- Exportar para CSV (um de cada vez)
COPY (SELECT * FROM preco_km) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM preco_kg) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM taxa_arrancada) TO STDOUT WITH CSV HEADER;
COPY (SELECT * FROM lancamentos) TO STDOUT WITH CSV HEADER;
```

### Backup automático
Supabase faz backup automático diário (mantém por 7 dias no plano gratuito)

## 💡 Dicas de Performance

### Otimizar build
```bash
# Analisar tamanho do bundle
npm run build
npm run preview
```

### Otimizar imagens (se adicionar no futuro)
- Use WebP em vez de PNG/JPG
- Comprima imagens antes de usar
- Use lazy loading

## 🎨 Personalização

### Mudar cores principais
Edite `tailwind.config.js`:
```js
colors: {
  primary: {
    500: '#0ea5e9',  // Mude aqui
    600: '#0284c7',  // E aqui
    700: '#0369a1',  // E aqui
  },
}
```

### Mudar fonte
Edite `src/index.css`:
```css
body {
  font-family: 'Sua Fonte', sans-serif;
}
```

## 📞 Suporte

### Links Úteis
- Supabase Docs: https://supabase.com/docs
- React Docs: https://react.dev
- Tailwind Docs: https://tailwindcss.com/docs
- Vite Docs: https://vitejs.dev

### Comunidades
- Supabase Discord
- React Reddit
- Stack Overflow

---

**Mantenha este arquivo como referência! 📚**
