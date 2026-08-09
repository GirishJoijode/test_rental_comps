// -----------------------------------------------------------------------------
// Operational Costs filtering + search (OR within field, AND across fields)
// -----------------------------------------------------------------------------
import { FILTER_FIELDS, SEARCH_FIELDS } from '../config/filterConfig'

export function asOption(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && (Number.isNaN(value) || value === 0)) return ''
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return ''
    const lower = trimmed.toLowerCase()
    if (lower === 'null' || lower === 'undefined' || lower === 'nan') return ''
    return trimmed
  }
  return String(value).trim()
}

export const EMPTY_FILTERS = Object.fromEntries(FILTER_FIELDS.map((f) => [f.key, []]))

export function getFilterSelections(filters, key) {
  const val = filters[key]
  if (Array.isArray(val)) return val
  if (val && val !== '') return [val]
  return []
}

export function hasAnyFilterSelection(filters) {
  return FILTER_FIELDS.some(({ key }) => getFilterSelections(filters, key).length > 0)
}

export function sanitizeFilters(filters) {
  return { ...filters }
}

function sortOptions(key, values) {
  if (key === 'Year' || key === 'Year_Completed') {
    return values.sort((a, b) => Number(b) - Number(a) || a.localeCompare(b, 'en'))
  }
  return values.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
}

function recordMatchesField(rec, key, selected) {
  if (!selected.length) return true
  return selected.includes(asOption(rec[key]))
}

export function applyFilters(records, filters, search) {
  const term = (search || '').trim().toLowerCase()

  return records.filter((rec) => {
    for (const { key } of FILTER_FIELDS) {
      if (!recordMatchesField(rec, key, getFilterSelections(filters, key))) return false
    }

    if (term) {
      const haystack = SEARCH_FIELDS.map((f) => rec[f])
        .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(term)) return false
    }

    return true
  })
}

/** Cascading options: each field ignores its own selection, keeps selected values visible. */
export function buildCascadingOptions(records, filters, search) {
  const options = {}
  for (const { key } of FILTER_FIELDS) {
    const others = { ...filters, [key]: [] }
    const subset = applyFilters(records, others, search)
    const set = new Set()
    for (const rec of subset) {
      const opt = asOption(rec[key])
      if (opt !== '') set.add(opt)
    }
    for (const sel of getFilterSelections(filters, key)) {
      if (sel) set.add(sel)
    }
    options[key] = sortOptions(key, Array.from(set))
  }
  return options
}
