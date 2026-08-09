// -----------------------------------------------------------------------------
// Operational Costs Analysis aggregations
// -----------------------------------------------------------------------------
import { OPEX_CATEGORIES, fieldForBasis, opexValueField } from '../config/costCategories'
import { averageByGroup, averageField, componentValue, toFiniteNumber } from './aggregates'
import { formatYear } from './formatters'
import { recordIdentity } from './indexRecords'

function shortActualForecast(value) {
  const s = String(value ?? '').trim()
  if (/actual/i.test(s)) return 'A'
  if (/forecast/i.test(s)) return 'F'
  if (!s) return '?'
  return s.slice(0, 1).toUpperCase()
}

/** Distinct evidence label — keeps multi-year scheme records separate. */
export function evidenceLabel(record) {
  const scheme = String(record?.Scheme ?? '—').trim() || '—'
  const year = formatYear(record?.Year) || '—'
  return `${scheme} — ${year} ${shortActualForecast(record?.Actual_Or_Forecast)}`
}

/** Headline Core OpEx KPIs for Summary mode. */
export function buildCoreOpexSummaryKpis(records) {
  return [
    {
      id: 'opex-flat',
      label: 'Average OpEx / Flat',
      value: averageField(records, 'Total_Expenditure_Per_Flat').value,
      format: 'flat',
    },
    {
      id: 'opex-sqft',
      label: 'Average OpEx / Sq Ft',
      value: averageField(records, 'Total_Expenditure_Per_SqFt').value,
      format: 'sqft',
    },
    {
      id: 'excl-flat',
      label: 'Average OpEx excl. Management Fee / Flat',
      value: averageField(records, 'Cost_Exc_ManFee_Per_Flat').value,
      format: 'flat',
    },
    {
      id: 'excl-sqft',
      label: 'Average OpEx excl. Management Fee / Sq Ft',
      value: averageField(records, 'Cost_Exc_ManFee_Per_SqFt').value,
      format: 'sqft',
    },
    {
      id: 'mgmt-flat',
      label: 'Average Management Fee / Flat',
      value: averageField(records, 'Mgt_Fee_Per_Flat').value,
      format: 'flat',
    },
    {
      id: 'mgmt-sqft',
      label: 'Average Management Fee / Sq Ft',
      value: averageField(records, 'Mgt_Fee_Per_SqFt').value,
      format: 'sqft',
    },
    {
      id: 'leakage',
      label: 'Average Leakage incl. Management',
      value: averageField(records, 'Leakage_Incl_Mgmt').value,
      format: 'percent',
    },
    {
      id: 'mgmt-pct',
      label: 'Average Management Fee % of Income',
      value: averageField(records, 'Mgt_Fee_Pct_Income').value,
      format: 'percent',
    },
  ]
}

/** Focused Core OpEx KPIs for £ / Flat or £ / Sq Ft mode. */
export function buildCoreOpexBasisKpis(records, basis) {
  if (basis === 'sqft') {
    return [
      {
        id: 'opex',
        label: 'Average OpEx / Sq Ft',
        value: averageField(records, 'Total_Expenditure_Per_SqFt').value,
        format: 'sqft',
      },
      {
        id: 'excl',
        label: 'Average OpEx excl. Management Fee / Sq Ft',
        value: averageField(records, 'Cost_Exc_ManFee_Per_SqFt').value,
        format: 'sqft',
      },
      {
        id: 'mgmt',
        label: 'Average Management Fee / Sq Ft',
        value: averageField(records, 'Mgt_Fee_Per_SqFt').value,
        format: 'sqft',
      },
    ]
  }
  return [
    {
      id: 'opex',
      label: 'Average OpEx / Flat',
      value: averageField(records, 'Total_Expenditure_Per_Flat').value,
      format: 'flat',
    },
    {
      id: 'excl',
      label: 'Average OpEx excl. Management Fee / Flat',
      value: averageField(records, 'Cost_Exc_ManFee_Per_Flat').value,
      format: 'flat',
    },
    {
      id: 'mgmt',
      label: 'Average Management Fee / Flat',
      value: averageField(records, 'Mgt_Fee_Per_Flat').value,
      format: 'flat',
    },
  ]
}

// Back-compat aliases used by older chart modules kept on disk.
export function buildAnalysisKpis(records) {
  const cards = buildCoreOpexSummaryKpis(records)
  const byId = Object.fromEntries(cards.map((c) => [c.id, c]))
  return {
    avgOpexFlat: { value: byId['opex-flat']?.value ?? null },
    avgOpexSqFt: { value: byId['opex-sqft']?.value ?? null },
    avgOpexExclFlat: { value: byId['excl-flat']?.value ?? null },
    avgOpexExclSqFt: { value: byId['excl-sqft']?.value ?? null },
    avgLeakage: { value: byId.leakage?.value ?? null },
    avgMgtFeePct: { value: byId['mgmt-pct']?.value ?? null },
  }
}

export function buildSummaryMetrics(records) {
  return buildCoreOpexSummaryKpis(records).slice(0, 4)
}

/**
 * One row per evidence record for scheme benchmarking.
 * sort: 'desc' | 'asc' | 'alpha'
 */
export function buildSchemeOpexRows(records, basis, sort = 'desc') {
  const field = opexValueField(basis)
  const rows = []
  for (const rec of records) {
    const value = toFiniteNumber(rec?.[field])
    if (value === null || value === 0) continue
    rows.push({
      id: recordIdentity(rec),
      name: evidenceLabel(rec),
      scheme: rec.Scheme,
      location: rec.Location,
      region: rec.Region,
      year: rec.Year,
      actualOrForecast: rec.Actual_Or_Forecast,
      value,
      opexFlat: toFiniteNumber(rec.Total_Expenditure_Per_Flat),
      opexSqFt: toFiniteNumber(rec.Total_Expenditure_Per_SqFt),
      record: rec,
    })
  }
  if (sort === 'asc') rows.sort((a, b) => a.value - b.value)
  else if (sort === 'alpha') {
    rows.sort((a, b) =>
      String(a.scheme ?? '').localeCompare(String(b.scheme ?? ''), 'en', { numeric: true })
    )
  } else rows.sort((a, b) => b.value - a.value)
  return rows
}

/** Average contribution of each OpEx category for the analysis set. */
export function buildAverageComposition(records, basis) {
  const rows = []
  for (const cat of OPEX_CATEGORIES) {
    const field = fieldForBasis(cat, basis)
    const avg = averageField(records, field, { excludeZero: true })
    if (avg.count === 0) continue
    rows.push({
      id: cat.id,
      name: cat.label,
      value: avg.value,
      count: avg.count,
      color: cat.color,
    })
  }
  return rows.sort((a, b) => b.value - a.value)
}

/** Stacked composition rows — one per evidence record (actual £ values). */
export function buildSchemeCompositionRows(records, basis, sort = 'desc') {
  const totalField = opexValueField(basis)
  const rows = []
  for (const rec of records) {
    const total = toFiniteNumber(rec?.[totalField])
    const entry = {
      id: recordIdentity(rec),
      name: evidenceLabel(rec),
      scheme: rec.Scheme,
      location: rec.Location,
      region: rec.Region,
      year: rec.Year,
      actualOrForecast: rec.Actual_Or_Forecast,
      record: rec,
      total: total ?? 0,
    }
    let stackSum = 0
    for (const cat of OPEX_CATEGORIES) {
      const v = componentValue(rec, fieldForBasis(cat, basis))
      entry[cat.id] = v
      stackSum += v
    }
    // Prefer stack sum for sorting when total missing
    entry.sortValue = total && total !== 0 ? total : stackSum
    if (entry.sortValue <= 0 && stackSum <= 0) continue
    rows.push(entry)
  }
  if (sort === 'asc') rows.sort((a, b) => a.sortValue - b.sortValue)
  else if (sort === 'alpha') {
    rows.sort((a, b) =>
      String(a.scheme ?? '').localeCompare(String(b.scheme ?? ''), 'en', { numeric: true })
    )
  } else rows.sort((a, b) => b.sortValue - a.sortValue)
  return rows
}

/** Average OpEx grouped by a categorical field (Region, Location, …). */
export function buildOpexByGroup(records, groupField, basis) {
  return averageByGroup(records, groupField, opexValueField(basis), { excludeZero: true })
}

export function buildRegionalOpex(records, basis) {
  return buildOpexByGroup(records, 'Region', basis)
}

/** Average OpEx category composition per group (absolute values). */
export function buildCompositionByGroup(records, groupField, basis) {
  const groups = new Map()
  for (const rec of records) {
    const key = String(rec?.[groupField] ?? '').trim()
    if (!key) continue
    if (!groups.has(key)) {
      groups.set(key, {
        name: key,
        count: 0,
        cats: OPEX_CATEGORIES.map(() => ({ sum: 0, n: 0 })),
      })
    }
    const g = groups.get(key)
    g.count += 1
    OPEX_CATEGORIES.forEach((cat, i) => {
      const v = toFiniteNumber(rec?.[fieldForBasis(cat, basis)])
      if (v === null || v === 0) return
      g.cats[i].sum += v
      g.cats[i].n += 1
    })
  }

  const rows = []
  for (const g of groups.values()) {
    const row = { name: g.name, count: g.count, total: 0 }
    OPEX_CATEGORIES.forEach((cat, i) => {
      const avg = g.cats[i].n > 0 ? g.cats[i].sum / g.cats[i].n : 0
      row[cat.id] = avg
      row.total += avg
    })
    if (row.total > 0) rows.push(row)
  }
  return rows.sort((a, b) => b.total - a.total)
}

export function buildRegionalComposition(records, basis) {
  return buildCompositionByGroup(records, 'Region', basis)
}

/**
 * Actual vs Forecast average OpEx for the active basis.
 * Returns null when fewer than two categories are present.
 */
export function buildActualForecastComparison(records, basis) {
  const field = opexValueField(basis)
  const buckets = new Map()
  for (const rec of records) {
    const label = String(rec?.Actual_Or_Forecast ?? '').trim()
    if (!label) continue
    const n = toFiniteNumber(rec?.[field])
    if (n === null || n === 0) continue
    if (!buckets.has(label)) buckets.set(label, { sum: 0, count: 0 })
    const b = buckets.get(label)
    b.sum += n
    b.count += 1
  }
  if (buckets.size < 2) return null
  return Array.from(buckets.entries())
    .map(([name, g]) => ({
      name,
      value: g.sum / g.count,
      count: g.count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

export function analysisContextLabel(records, { selected, filtered }) {
  const n = records.length.toLocaleString('en-GB')
  if (selected) {
    return `Analysing ${n} selected record${records.length === 1 ? '' : 's'}`
  }
  if (filtered) {
    return `Analysing ${n} filtered record${records.length === 1 ? '' : 's'}`
  }
  return `Analysing all ${n} record${records.length === 1 ? '' : 's'}`
}

export const ANALYSIS_SECTIONS = [
  { id: 'core', label: 'Core OpEx' },
  { id: 'performance', label: 'Operating Performance' },
  { id: 'trends', label: 'Trends' },
]

const MIN_SCATTER_POINTS = 3

function schemeMetricRows(records, field, { excludeZero = true } = {}) {
  const rows = []
  for (const rec of records) {
    const value = toFiniteNumber(rec?.[field])
    if (value === null) continue
    if (excludeZero && value === 0) continue
    rows.push({
      id: recordIdentity(rec),
      name: evidenceLabel(rec),
      scheme: rec.Scheme,
      location: rec.Location,
      region: rec.Region,
      year: rec.Year,
      actualOrForecast: rec.Actual_Or_Forecast,
      value,
      record: rec,
    })
  }
  return rows.sort((a, b) => b.value - a.value)
}

export function buildLeakageKpis(records) {
  return {
    avgLeakage: averageField(records, 'Leakage_Pct'),
    avgAdjusted: averageField(records, 'Leakage_Pct_Adjusted'),
    avgInclMgmt: averageField(records, 'Leakage_Incl_Mgmt'),
  }
}

/** Scheme-level leakage for a specific source field (kept separate). */
export function buildSchemeLeakageRows(records, field) {
  return schemeMetricRows(records, field)
}

export function buildMgmtFeePctRows(records) {
  return schemeMetricRows(records, 'Mgt_Fee_Pct_Income')
}

export function buildMgmtFeeBasisRows(records, basis) {
  const field = basis === 'sqft' ? 'Mgt_Fee_Per_SqFt' : 'Mgt_Fee_Per_Flat'
  return schemeMetricRows(records, field)
}

export function buildBadDebtPctRows(records) {
  return schemeMetricRows(records, 'Bad_Debt_Pct_Income')
}

/**
 * Occupancy (x) vs Leakage incl. management (y).
 * Returns null when fewer than MIN_SCATTER_POINTS valid observations.
 */
export function buildOccupancyLeakageScatter(records) {
  const points = []
  for (const rec of records) {
    const occupancy = toFiniteNumber(rec?.Occupancy)
    const leakage = toFiniteNumber(rec?.Leakage_Incl_Mgmt)
    if (occupancy === null || leakage === null) continue
    if (occupancy === 0 && leakage === 0) continue
    points.push({
      id: recordIdentity(rec),
      x: occupancy,
      y: leakage,
      scheme: rec.Scheme,
      location: rec.Location,
      region: rec.Region,
      year: rec.Year,
      actualOrForecast: rec.Actual_Or_Forecast,
      record: rec,
    })
  }
  if (points.length < MIN_SCATTER_POINTS) return null
  return points
}

/** Average OpEx by Year for the active analysis set. */
export function buildOpexByYear(records, basis) {
  const field = opexValueField(basis)
  const groups = new Map()
  for (const rec of records) {
    const year = formatYear(rec?.Year)
    if (!year) continue
    const n = toFiniteNumber(rec?.[field])
    if (n === null || n === 0) continue
    if (!groups.has(year)) groups.set(year, { sum: 0, count: 0 })
    const g = groups.get(year)
    g.sum += n
    g.count += 1
  }
  return Array.from(groups.entries())
    .map(([name, g]) => ({
      name,
      value: g.sum / g.count,
      count: g.count,
      yearNum: Number(name),
    }))
    .sort((a, b) => a.yearNum - b.yearNum)
}

/**
 * Multi-year scheme histories within the analysis set.
 * Returns series suitable for a multi-line chart (max 8 schemes by record count).
 */
export function buildSchemeYearTrends(records, basis) {
  const field = opexValueField(basis)
  const byScheme = new Map()

  for (const rec of records) {
    const scheme = String(rec?.Scheme ?? '').trim()
    const year = formatYear(rec?.Year)
    const value = toFiniteNumber(rec?.[field])
    if (!scheme || !year || value === null || value === 0) continue
    if (!byScheme.has(scheme)) byScheme.set(scheme, [])
    byScheme.get(scheme).push({
      year,
      yearNum: Number(year),
      value,
      actualOrForecast: rec.Actual_Or_Forecast,
      record: rec,
      id: recordIdentity(rec),
    })
  }

  const multi = []
  for (const [scheme, points] of byScheme) {
    const years = new Set(points.map((p) => p.year))
    if (years.size < 2) continue
    points.sort((a, b) => a.yearNum - b.yearNum || a.id.localeCompare(b.id))
    multi.push({ scheme, points, count: points.length })
  }

  multi.sort((a, b) => b.count - a.count || a.scheme.localeCompare(b.scheme))
  const selected = multi.slice(0, 8)
  if (selected.length === 0) return null

  const yearSet = new Set()
  for (const s of selected) for (const p of s.points) yearSet.add(p.year)
  const years = Array.from(yearSet).sort((a, b) => Number(a) - Number(b))

  const rows = years.map((year) => {
    const row = { year }
    for (const s of selected) {
      const matches = s.points.filter((p) => p.year === year)
      if (!matches.length) {
        row[s.scheme] = null
        row[`${s.scheme}__meta`] = null
        continue
      }
      // Prefer Actual if both exist for same year
      const preferred =
        matches.find((p) => /actual/i.test(String(p.actualOrForecast ?? ''))) || matches[0]
      row[s.scheme] = preferred.value
      row[`${s.scheme}__meta`] = preferred
    }
    return row
  })

  return {
    schemes: selected.map((s) => s.scheme),
    rows,
  }
}
