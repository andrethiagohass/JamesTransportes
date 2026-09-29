-- Execute uma vez no SQL Editor do Supabase para permitir as novas categorias
-- em tabelas despesas já existentes. Não remove nem altera registros existentes.
ALTER TABLE public.despesas
  DROP CONSTRAINT IF EXISTS despesas_categoria_check;

ALTER TABLE public.despesas
  ADD CONSTRAINT despesas_categoria_check
  CHECK (categoria IN (
    'combustivel', 'pedagio', 'alimentacao', 'manutencao',
    'lavacao', 'honorarios', 'impostos', 'outros'
  ));