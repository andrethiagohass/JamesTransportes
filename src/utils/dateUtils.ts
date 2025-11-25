/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM/YYYY
 * Evita problemas de timezone ao não usar o construtor Date()
 */
export const formatDateBR = (dateString: string): string => {
  if (!dateString) return ''
  
  // Remove o timestamp se existir (2025-11-24T00:00:00 -> 2025-11-24)
  const datePart = dateString.split('T')[0]
  
  // Divide a data (YYYY-MM-DD)
  const [year, month, day] = datePart.split('-')
  
  // Retorna no formato brasileiro (DD/MM/YYYY)
  return `${day}/${month}/${year}`
}

/**
 * Formata uma data no formato YYYY-MM-DD para DD/MM
 * Versão curta para mobile
 */
export const formatDateShortBR = (dateString: string): string => {
  if (!dateString) return ''
  
  const datePart = dateString.split('T')[0]
  const [, month, day] = datePart.split('-')
  
  return `${day}/${month}`
}

/**
 * Converte uma data do input (YYYY-MM-DD) para o formato do Supabase
 * Garante que a data será salva exatamente como foi digitada
 */
export const dateToSupabase = (dateString: string): string => {
  return dateString // Supabase aceita YYYY-MM-DD diretamente
}
