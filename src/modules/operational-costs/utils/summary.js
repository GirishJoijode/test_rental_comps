// -----------------------------------------------------------------------------
// Operational Costs KPI summary (from filtered/searched records)
// -----------------------------------------------------------------------------
import { isBlank } from './formatters'

function averageValid(records, key) {
  let sum = 0
  let count = 0
  for (const rec of records) {
    const raw = rec[key]
    if (isBlank(raw)) continue
    const n = Number(raw)
    if (!Number.isFinite(n) || n === 0) continue
    sum += n
    count += 1
  }
  return count > 0 ? sum / count : null
}

export function buildSummary(records) {
  const schemes = new Set()
  for (const rec of records) {
    const scheme = rec?.Scheme
    if (scheme !== null && scheme !== undefined && String(scheme).trim() !== '') {
      schemes.add(String(scheme).trim())
    }
  }

  return {
    total: records.length,
    schemes: schemes.size,
    avgTotalExpPerFlat: averageValid(records, 'Total_Expenditure_Per_Flat'),
    avgTotalExpPerSqFt: averageValid(records, 'Total_Expenditure_Per_SqFt'),
  }
}
