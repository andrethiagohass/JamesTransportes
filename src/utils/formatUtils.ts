/**
 * Formata número com separador de milhar (ponto)
 * Exemplo: 5000 -> "5.000"
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Formata quilometragem (sem decimais, com separador de milhar)
 * Exemplo: 5000 -> "5.000"
 */
export const formatKm = (value: number): string => {
  return formatNumber(value, 0)
}

/**
 * Formata peso em kg (com 2 decimais e separadores brasileiros)
 * Exemplo: 4887.10 -> "4.887,10"
 */
export const formatPeso = (value: number): string => {
  return formatNumber(value, 2)
}

/**
 * Formata valores monetários (R$ com separadores brasileiros)
 * Exemplo: 1000.10 -> "R$ 1.000,10"
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formata valores monetários sem o símbolo R$
 * Exemplo: 1000.10 -> "1.000,10"
 */
export const formatCurrencyValue = (value: number): string => {
  return formatNumber(value, 2)
}

/**
 * Extrai o valor em centavos a partir de uma string digitada livremente
 * Usado para mascarar inputs de valor monetário enquanto o usuário digita
 * Exemplo: "1050" -> 1050 (ou seja, R$ 10,50)
 */
export const parseCurrencyInputToCents = (raw: string): number => {
  const digits = raw.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}
