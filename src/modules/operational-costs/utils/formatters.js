// -----------------------------------------------------------------------------
// Operational Costs display formatters
// -----------------------------------------------------------------------------
import { formatNumber, isBlank } from '../../../utils/formatters'

const currencyFlatFmt = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const currencySqFtFmt = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function isValidNumber(value) {
  if (isBlank(value)) return false
  const n = Number(value)
  return Number.isFinite(n)
}

/** Whole-pound currency for totals / per-flat, e.g. 4447.57 → "£4,448". */
export function formatCurrencyFlat(value) {
  if (!isValidNumber(value)) return ''
  return currencyFlatFmt.format(Math.round(Number(value)))
}

/** Alias for total OpEx £ figures. */
export const formatCurrencyTotal = formatCurrencyFlat

/** Two-decimal currency for per-sqft figures, e.g. 6.9613 → "£6.96". */
export function formatCurrencySqFt(value) {
  if (!isValidNumber(value)) return ''
  return currencySqFtFmt.format(Number(value))
}

/** Format a cost value for the active OpEx basis. */
export function formatCostByBasis(value, basis) {
  if (basis === 'sqft') return formatCurrencySqFt(value)
  return formatCurrencyFlat(value)
}

export function formatSqFt(value) {
  if (!isValidNumber(value)) return ''
  return `${formatNumber(Math.round(Number(value)))} sq ft`
}

export function formatUnitSize(value) {
  if (!isValidNumber(value)) return ''
  return `${formatNumber(Math.round(Number(value)))} sq ft`
}

/** Fraction → percentage with 2 d.p., e.g. 0.1948 → "19.48%". */
export function formatPercent2(value) {
  if (!isValidNumber(value)) return ''
  return `${(Number(value) * 100).toFixed(2)}%`
}

/** Year / integer-like values without treating 0 as blank. */
export function formatYear(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return String(Math.trunc(n))
}

export function formatUnits(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (!Number.isFinite(n) || n === 0) return ''
  return formatNumber(n)
}

/** Accepts booleans or Yes/No strings from Ninox. */
export function formatBool(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase()
    if (v === 'yes' || v === 'y' || v === 'true') return 'Yes'
    if (v === 'no' || v === 'n' || v === 'false') return 'No'
  }
  return ''
}

export { formatNumber, isBlank }
