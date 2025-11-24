# 📊 EXEMPLOS DE DADOS - Para Testes

Use estes dados para testar o sistema após a configuração.

## 💰 Preços por KM

```sql
-- Inserir via SQL (Supabase SQL Editor)
INSERT INTO preco_km (valor, ativo) VALUES
  (2.50, true),   -- Preço atual
  (2.30, false),  -- Preço antigo
  (2.00, false);  -- Preço muito antigo
```

**Ou cadastre pela interface:**
- R$ 2,50 (ativo)

## ⚖️ Preços por KG

```sql
-- Inserir via SQL (Supabase SQL Editor)
INSERT INTO preco_kg (valor, ativo) VALUES
  (0.15, true),   -- Preço atual
  (0.12, false),  -- Preço antigo
  (0.10, false);  -- Preço muito antigo
```

**Ou cadastre pela interface:**
- R$ 0,15 (ativo)

## 📈 Taxas de Arrancada

```sql
-- Inserir via SQL (Supabase SQL Editor)
INSERT INTO taxa_arrancada (km_inicial, km_final, valor, ativo) VALUES
  (0, 100, 100.00, true),
  (101, 200, 157.00, true),
  (201, 300, 236.00, true),
  (301, 400, 315.00, true),
  (401, 500, 394.00, true),
  (501, 600, 473.00, true),
  (601, 700, 552.00, true),
  (701, 800, 631.00, true),
  (801, 900, 710.00, true),
  (901, 1000, 789.00, true);
```

**Ou cadastre pela interface:**
| KM Inicial | KM Final | Valor     |
|------------|----------|-----------|
| 0          | 100      | R$ 100,00 |
| 101        | 200      | R$ 157,00 |
| 201        | 300      | R$ 236,00 |
| 301        | 400      | R$ 315,00 |
| 401        | 500      | R$ 394,00 |
| 501        | 600      | R$ 473,00 |
| 601        | 700      | R$ 552,00 |
| 701        | 800      | R$ 631,00 |
| 801        | 900      | R$ 710,00 |
| 901        | 1000     | R$ 789,00 |

## 🚚 Lançamentos de Exemplo

```sql
-- Inserir via SQL (Supabase SQL Editor)
-- Certifique-se de ter os preços e taxas cadastrados primeiro!

INSERT INTO lancamentos (data, km_inicial, km_final, km_total, peso, valor_km, valor_peso, taxa_arrancada, preco_total) VALUES
  -- Viagem 1: curta distância
  ('2025-11-01', 1000, 1150, 150, 300, 2.50, 0.15, 157.00, 577.00),
  
  -- Viagem 2: média distância
  ('2025-11-05', 1150, 1400, 250, 500, 2.50, 0.15, 236.00, 936.00),
  
  -- Viagem 3: longa distância
  ('2025-11-10', 1400, 1900, 500, 800, 2.50, 0.15, 394.00, 1764.00),
  
  -- Viagem 4: curta com muito peso
  ('2025-11-15', 1900, 2050, 150, 1000, 2.50, 0.15, 157.00, 682.00),
  
  -- Viagem 5: média
  ('2025-11-20', 2050, 2350, 300, 600, 2.50, 0.15, 315.00, 1155.00);
```

**Ou cadastre pela interface:**

### Viagem 1 - Curta Distância
```
Data: 01/11/2025
KM Inicial: 1000
KM Final: 1150
Peso: 300 kg

Resultado esperado:
- KM Total: 150 km
- Valor KM: R$ 375,00 (150 × 2,50)
- Valor Peso: R$ 45,00 (300 × 0,15)
- Taxa Arrancada: R$ 157,00 (faixa 101-200)
- TOTAL: R$ 577,00
```

### Viagem 2 - Média Distância
```
Data: 05/11/2025
KM Inicial: 1150
KM Final: 1400
Peso: 500 kg

Resultado esperado:
- KM Total: 250 km
- Valor KM: R$ 625,00 (250 × 2,50)
- Valor Peso: R$ 75,00 (500 × 0,15)
- Taxa Arrancada: R$ 236,00 (faixa 201-300)
- TOTAL: R$ 936,00
```

### Viagem 3 - Longa Distância
```
Data: 10/11/2025
KM Inicial: 1400
KM Final: 1900
Peso: 800 kg

Resultado esperado:
- KM Total: 500 km
- Valor KM: R$ 1.250,00 (500 × 2,50)
- Valor Peso: R$ 120,00 (800 × 0,15)
- Taxa Arrancada: R$ 394,00 (faixa 401-500)
- TOTAL: R$ 1.764,00
```

### Viagem 4 - Curta com Muito Peso
```
Data: 15/11/2025
KM Inicial: 1900
KM Final: 2050
Peso: 1000 kg

Resultado esperado:
- KM Total: 150 km
- Valor KM: R$ 375,00 (150 × 2,50)
- Valor Peso: R$ 150,00 (1000 × 0,15)
- Taxa Arrancada: R$ 157,00 (faixa 101-200)
- TOTAL: R$ 682,00
```

### Viagem 5 - Média
```
Data: 20/11/2025
KM Inicial: 2050
KM Final: 2350
Peso: 600 kg

Resultado esperado:
- KM Total: 300 km
- Valor KM: R$ 750,00 (300 × 2,50)
- Valor Peso: R$ 90,00 (600 × 0,15)
- Taxa Arrancada: R$ 315,00 (faixa 301-400)
- TOTAL: R$ 1.155,00
```

## 📊 Resultados Esperados no Dashboard (Novembro/2025)

Após inserir os 5 lançamentos acima:

```
Total de Viagens: 5
Total KM: 1.350 km
Total Peso: 3.200 kg
Receita Total: R$ 5.114,00
```

### Médias por Viagem:
```
KM Médio: 270 km
Peso Médio: 640 kg
Receita Média: R$ 1.022,80
```

## 🧪 Casos de Teste

### Teste 1: Viagem Sem Taxa de Arrancada
```
KM Inicial: 100
KM Final: 1200
KM Total: 1100 km

❌ Problema: Não há taxa para faixa > 1000 km
✅ Solução: Cadastrar taxa para 1001-1500 km
```

### Teste 2: Cálculo com Decimais
```
KM Inicial: 100.5
KM Final: 250.7
KM Total: 150.2 km
Peso: 456.8 kg

✅ Sistema deve aceitar e calcular corretamente
```

### Teste 3: Viagem no Mesmo KM
```
KM Inicial: 100
KM Final: 100

❌ KM Total = 0
❌ Sistema deve impedir (validação)
```

### Teste 4: KM Final Menor que Inicial
```
KM Inicial: 200
KM Final: 100

❌ Sistema deve impedir (validação)
```

## 🎯 Cenários Reais

### Cenário 1: Transportadora Regional
```
Preço/KM: R$ 3,00
Preço/KG: R$ 0,20
Taxas:
- 0-50 km: R$ 80,00
- 51-100 km: R$ 120,00
- 101-150 km: R$ 160,00
```

### Cenário 2: Frete Urbano
```
Preço/KM: R$ 4,50
Preço/KG: R$ 0,10
Taxas:
- 0-20 km: R$ 50,00
- 21-40 km: R$ 80,00
- 41-60 km: R$ 110,00
```

### Cenário 3: Transporte Interestadual
```
Preço/KM: R$ 1,80
Preço/KG: R$ 0,25
Taxas:
- 0-500 km: R$ 300,00
- 501-1000 km: R$ 500,00
- 1001-1500 km: R$ 700,00
```

## 📅 Dados de Mês Completo

Para testar relatórios, insira viagens distribuídas ao longo do mês:

```sql
-- Novembro 2025 - 20 viagens
INSERT INTO lancamentos (data, km_inicial, km_final, km_total, peso, valor_km, valor_peso, taxa_arrancada, preco_total) VALUES
  ('2025-11-01', 1000, 1180, 180, 400, 2.50, 0.15, 157.00, 667.00),
  ('2025-11-02', 1180, 1350, 170, 350, 2.50, 0.15, 157.00, 634.50),
  ('2025-11-03', 1350, 1600, 250, 500, 2.50, 0.15, 236.00, 936.00),
  ('2025-11-06', 1600, 1850, 250, 600, 2.50, 0.15, 236.00, 951.00),
  ('2025-11-07', 1850, 2100, 250, 450, 2.50, 0.15, 236.00, 928.50),
  ('2025-11-08', 2100, 2450, 350, 700, 2.50, 0.15, 315.00, 1295.00),
  ('2025-11-09', 2450, 2650, 200, 500, 2.50, 0.15, 157.00, 732.00),
  ('2025-11-10', 2650, 2900, 250, 600, 2.50, 0.15, 236.00, 951.00),
  ('2025-11-13', 2900, 3250, 350, 800, 2.50, 0.15, 315.00, 1310.00),
  ('2025-11-14', 3250, 3500, 250, 550, 2.50, 0.15, 236.00, 943.50),
  ('2025-11-15', 3500, 3700, 200, 450, 2.50, 0.15, 157.00, 724.50),
  ('2025-11-16', 3700, 4000, 300, 700, 2.50, 0.15, 315.00, 1170.00),
  ('2025-11-17', 4000, 4150, 150, 400, 2.50, 0.15, 157.00, 592.00),
  ('2025-11-20', 4150, 4500, 350, 750, 2.50, 0.15, 315.00, 1302.50),
  ('2025-11-21', 4500, 4750, 250, 600, 2.50, 0.15, 236.00, 951.00),
  ('2025-11-22', 4750, 5100, 350, 800, 2.50, 0.15, 315.00, 1310.00),
  ('2025-11-23', 5100, 5300, 200, 500, 2.50, 0.15, 157.00, 732.00),
  ('2025-11-24', 5300, 5600, 300, 650, 2.50, 0.15, 315.00, 1162.50),
  ('2025-11-27', 5600, 5850, 250, 550, 2.50, 0.15, 236.00, 943.50),
  ('2025-11-28', 5850, 6100, 250, 600, 2.50, 0.15, 236.00, 951.00);

-- Total esperado: 20 viagens, R$ 18.086,00
```

## 🔍 Validar Dados

Após inserir os dados, execute no SQL Editor:

```sql
-- Verificar total de lançamentos
SELECT COUNT(*) as total FROM lancamentos;

-- Verificar soma total
SELECT 
  COUNT(*) as viagens,
  SUM(km_total) as km,
  SUM(peso) as peso,
  SUM(preco_total) as receita
FROM lancamentos
WHERE EXTRACT(MONTH FROM data) = 11 
  AND EXTRACT(YEAR FROM data) = 2025;
```

---

**Use estes dados para testar todas as funcionalidades do sistema! 🚀**
