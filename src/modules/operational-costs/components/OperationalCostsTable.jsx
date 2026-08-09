import { useMemo, useState } from 'react'
import { COLUMNS } from '../config/tableColumns'
import {
  formatBool,
  formatCurrencyFlat,
  formatCurrencySqFt,
  formatPercent2,
  formatUnits,
  formatYear,
  isBlank,
} from '../utils/formatters'

function formatCell(col, value) {
  switch (col.type) {
    case 'currencyFlat':
      return formatCurrencyFlat(value)
    case 'currencySqFt':
      return formatCurrencySqFt(value)
    case 'percent':
      return formatPercent2(value)
    case 'number':
      return formatUnits(value)
    case 'year':
      return formatYear(value)
    case 'bool':
      return formatBool(value)
    default:
      return value === null || value === undefined || value === '' ? '' : String(value)
  }
}

const NUMERIC = new Set(['currencyFlat', 'currencySqFt', 'percent', 'number', 'year'])

function boolRank(value) {
  const formatted = formatBool(value)
  if (formatted === 'Yes') return 1
  if (formatted === 'No') return 0
  return null
}

function isMissing(col, value) {
  if (col.type === 'bool') return boolRank(value) == null
  if (col.type === 'year' || col.type === 'text') {
    return value === null || value === undefined || value === ''
  }
  return isBlank(value)
}

function compare(a, b, col) {
  const va = a[col.key]
  const vb = b[col.key]
  const aBlank = isMissing(col, va)
  const bBlank = isMissing(col, vb)
  if (aBlank && bBlank) return 0
  if (aBlank) return 1
  if (bBlank) return -1

  if (NUMERIC.has(col.type)) return Number(va) - Number(vb)
  if (col.type === 'bool') return boolRank(vb) - boolRank(va)
  return String(va).localeCompare(String(vb), 'en', { numeric: true })
}

function cellClass(col) {
  return [
    col.align === 'right' ? 'is-right' : '',
    col.sticky ? 'is-sticky' : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function Checkbox({ checked, onChange, label }) {
  return (
    <span className="checkbox-wrap">
      <input type="checkbox" aria-label={label} checked={checked} onChange={onChange} />
    </span>
  )
}

export default function OperationalCostsTable({
  records,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })

  const sorted = useMemo(() => {
    if (!sort.key) return records
    const col = COLUMNS.find((c) => c.key === sort.key)
    if (!col) return records
    const out = [...records].sort((a, b) => compare(a, b, col))
    return sort.dir === 'asc' ? out : out.reverse()
  }, [records, sort])

  function toggleSort(key) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return { key: null, dir: 'asc' }
    })
  }

  const allSelected =
    records.length > 0 && records.every((r) => selectedIds.has(r.Id))

  if (records.length === 0) {
    return <div className="table-empty">No records match the current filters.</div>
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th className="col-select is-sticky-check" scope="col">
              <Checkbox
                checked={allSelected}
                onChange={onToggleAll}
                label="Select all filtered rows"
              />
            </th>
            {COLUMNS.map((col) => {
              const active = sort.key === col.key
              return (
                <th
                  key={col.key}
                  className={cellClass(col)}
                  aria-sort={
                    active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                >
                  <button
                    type="button"
                    className="th-button"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    <span className="th-arrow">
                      {active ? (sort.dir === 'asc' ? '▲' : '▼') : ''}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((rec, i) => {
            const selected = selectedIds.has(rec.Id)
            const handleRowClick = (e) => {
              if (!onRowClick) return
              if (e.target.closest('.col-select')) return
              onRowClick(rec)
            }
            const handleRowKeyDown = (e) => {
              if (!onRowClick) return
              if (e.target.closest('.col-select')) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onRowClick(rec)
              }
            }
            return (
              <tr
                key={rec.Id ?? i}
                className={`is-clickable${selected ? ' is-selected' : ''}`}
                onClick={handleRowClick}
                onKeyDown={handleRowKeyDown}
                tabIndex={0}
                aria-label={`View details for ${rec.Scheme ?? 'scheme'}`}
              >
                <td className="col-select is-sticky-check">
                  <Checkbox
                    checked={selected}
                    onChange={() => onToggleRow(rec.Id)}
                    label={`Select ${rec.Scheme ?? 'row'}`}
                  />
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className={cellClass(col)}>
                    {formatCell(col, rec[col.key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
