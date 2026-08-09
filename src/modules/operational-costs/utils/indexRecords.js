// -----------------------------------------------------------------------------
// Build in-memory indexes over the Operational Costs dataset so views can
// look up by Scheme / Year without repeatedly scanning the full array.
// -----------------------------------------------------------------------------

export function schemeKey(value) {
  return String(value ?? '').trim()
}

function yearKey(value) {
  if (value == null || value === '') return ''
  return String(value)
}

function isActual(value) {
  return /actual/i.test(String(value ?? ''))
}

/** Stable identity for a scheme evidence record (handles missing Id). */
export function recordIdentity(record) {
  if (record?.Id != null && record.Id !== '') return String(record.Id)
  return [
    schemeKey(record?.Scheme),
    yearKey(record?.Year),
    String(record?.Actual_Or_Forecast ?? ''),
  ].join('::')
}

/** Sort newest Year first; Actual before Forecast within the same Year. */
export function sortSchemeRecords(records) {
  return [...records].sort((a, b) => {
    const ya = Number(a?.Year)
    const yb = Number(b?.Year)
    const aYear = Number.isFinite(ya) ? ya : -Infinity
    const bYear = Number.isFinite(yb) ? yb : -Infinity
    if (bYear !== aYear) return bYear - aYear

    const aAct = isActual(a?.Actual_Or_Forecast)
    const bAct = isActual(b?.Actual_Or_Forecast)
    if (aAct !== bAct) return aAct ? -1 : 1

    return recordIdentity(a).localeCompare(recordIdentity(b))
  })
}

export function buildOperationalCostIndexes(records) {
  const byScheme = new Map()
  const byYear = new Map()
  const bySchemeYear = new Map()

  for (const record of records) {
    const scheme = schemeKey(record?.Scheme)
    const year = yearKey(record?.Year)

    if (scheme) {
      const list = byScheme.get(scheme)
      if (list) list.push(record)
      else byScheme.set(scheme, [record])
    }

    if (year) {
      const list = byYear.get(year)
      if (list) list.push(record)
      else byYear.set(year, [record])
    }

    if (scheme && year) {
      const key = `${scheme}::${year}`
      const list = bySchemeYear.get(key)
      if (list) list.push(record)
      else bySchemeYear.set(key, [record])
    }
  }

  // Pre-sort each scheme's records once for O(1) retrieval order later.
  for (const [scheme, list] of byScheme) {
    byScheme.set(scheme, sortSchemeRecords(list))
  }

  return {
    byScheme,
    byYear,
    bySchemeYear,
    schemeCount: byScheme.size,
    yearCount: byYear.size,
  }
}

/** Efficient Scheme → records lookup (already sorted newest-first). */
export function getSchemeRecords(indexes, schemeName) {
  if (!indexes?.byScheme) return []
  return indexes.byScheme.get(schemeKey(schemeName)) || []
}

/** Default evidence record: most recent Year (Actual preferred if tied). */
export function getDefaultSchemeRecord(schemeRecords) {
  if (!schemeRecords?.length) return null
  return schemeRecords[0]
}
