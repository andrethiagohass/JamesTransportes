import { subDays, subMonths, subYears, isAfter, parseISO } from 'date-fns'

export type QuickPeriod =
  | 'currentYear'
  | 'last30days'
  | 'last12months'
  | 'last5years'
  | 'currentMonth'
  | 'lastMonth'
  | 'all'

export type PeriodFilterValue =
  | { type: 'quick'; period: QuickPeriod }
  | { type: 'month'; year: number; month: number } // month: 0-11

export const DEFAULT_PERIOD_FILTER: PeriodFilterValue = { type: 'quick', period: 'currentMonth' }

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function getPeriodFilterLabel(filter: PeriodFilterValue): string {
  if (filter.type === 'month') {
    return `${MONTH_NAMES[filter.month]} de ${filter.year}`
  }

  const now = new Date()
  switch (filter.period) {
    case 'all':
      return 'Todos'
    case 'currentYear':
      return `Ano atual - ${now.getFullYear()}`
    case 'last30days':
      return 'Últimos 30 dias'
    case 'last12months':
      return 'Últimos 12 meses'
    case 'last5years':
      return 'Últimos 5 anos'
    case 'currentMonth':
      return 'Mês atual'
    case 'lastMonth':
      return 'Mês passado'
  }
}

export function matchesPeriodFilter(dateStr: string, filter: PeriodFilterValue): boolean {
  const date = parseISO(dateStr)
  const now = new Date()

  if (filter.type === 'month') {
    return date.getFullYear() === filter.year && date.getMonth() === filter.month
  }

  switch (filter.period) {
    case 'all':
      return true
    case 'currentYear':
      return date.getFullYear() === now.getFullYear()
    case 'last30days':
      return isAfter(date, subDays(now, 30))
    case 'last12months':
      return isAfter(date, subMonths(now, 12))
    case 'last5years':
      return isAfter(date, subYears(now, 5))
    case 'currentMonth':
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1)
      return date.getFullYear() === lastMonth.getFullYear() && date.getMonth() === lastMonth.getMonth()
    }
    default:
      return true
  }
}
