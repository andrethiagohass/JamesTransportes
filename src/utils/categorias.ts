export const CATEGORIAS = [
  { value: 'combustivel', label: 'Combustível' },
  { value: 'pedagio', label: 'Pedágio' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'lavacao', label: 'Lavação' },
  { value: 'honorarios', label: 'Honorários' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'telefonia', label: 'Telefonia' },
  { value: 'parcela_caminhao', label: 'Parcela Caminhão' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'arla', label: 'ARLA' },
  { value: 'outros', label: 'Outros' },
] as const

export type CategoriaValue = (typeof CATEGORIAS)[number]['value']

export const ALL_CATEGORIAS: CategoriaValue[] = CATEGORIAS.map((c) => c.value)

export const categoriaLabel = (value: string) =>
  CATEGORIAS.find((c) => c.value === value)?.label || value
