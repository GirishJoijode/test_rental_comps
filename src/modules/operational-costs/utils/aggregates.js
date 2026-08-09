// -----------------------------------------------------------------------------
// Reusable numeric aggregation helpers for OpEx analysis
// -----------------------------------------------------------------------------

/** Parse a finite number; reject null/undefined/''/NaN/Infinity. */
export function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n
}

/**
 * Average a numeric field across records.
 * @param {{ excludeZero?: boolean }} opts
 *   excludeZero — treat 0 as missing (typical for headline OpEx metrics)
 */
export function averageField(records, field, { excludeZero = true } = {}) {
  let sum = 0
  let count = 0
  for (const rec of records) {
    const n = toFiniteNumber(rec?.[field])
    if (n === null) continue
    if (excludeZero && n === 0) continue
    sum += n
    count += 1
  }
  if (count === 0) return { value: null, count: 0 }
  return { value: sum / count, count }
}

/** Average grouped by a categorical field. */
export function averageByGroup(records, groupField, valueField, { excludeZero = true } = {}) {
  const groups = new Map()
  for (const rec of records) {
    const raw = rec?.[groupField]
    if (raw === null || raw === undefined || String(raw).trim() === '') continue
    const name = String(raw).trim()
    const n = toFiniteNumber(rec?.[valueField])
    if (n === null) continue
    if (excludeZero && n === 0) continue
    if (!groups.has(name)) groups.set(name, { sum: 0, count: 0 })
    const g = groups.get(name)
    g.sum += n
    g.count += 1
  }
  const rows = []
  for (const [name, g] of groups) {
    if (g.count === 0) continue
    rows.push({ name, value: g.sum / g.count, count: g.count })
  }
  return rows.sort((a, b) => b.value - a.value)
}

/** Component value for stacking — missing → 0 (zero can be meaningful here). */
export function componentValue(record, field) {
  const n = toFiniteNumber(record?.[field])
  return n === null ? 0 : n
}
