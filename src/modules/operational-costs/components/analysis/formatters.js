import {
  formatCurrencyFlat,
  formatCurrencySqFt,
  formatPercent2,
} from '../../utils/formatters'

export function formatBasisValue(value, basis) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  return basis === 'sqft' ? formatCurrencySqFt(value) : formatCurrencyFlat(value)
}

export function formatBasisAxis(value, basis) {
  if (value == null || !Number.isFinite(Number(value))) return ''
  if (basis === 'sqft') return `£${Number(value).toFixed(2)}`
  const n = Math.round(Number(value))
  if (Math.abs(n) >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n}`
}

export function formatKpi(value, kind) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  if (kind === 'sqft') return formatCurrencySqFt(value)
  if (kind === 'percent') return formatPercent2(value)
  return formatCurrencyFlat(value)
}
