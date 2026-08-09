import { useMemo, useState } from 'react'
import { BUILDING_DETAIL_ITEMS } from '../../config/costCategories'
import { formatCostByBasis, isBlank } from '../../utils/formatters'

function numericValue(record, key) {
  const raw = record?.[key]
  if (isBlank(raw)) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export default function BuildingBreakdown({ record }) {
  const [basis, setBasis] = useState('flat')

  const rows = useMemo(() => {
    return BUILDING_DETAIL_ITEMS.map((item) => {
      const key = basis === 'sqft' ? item.sqft : item.flat
      return {
        label: item.label,
        value: numericValue(record, key),
        key,
      }
    })
  }, [record, basis])

  const hasData = rows.some((r) => r.value > 0)
  if (!hasData) return null

  const max = Math.max(...rows.map((r) => r.value), 0)

  return (
    <section className="modal__section">
      <details className="opex-details">
        <summary className="opex-details__summary">Building operational breakdown</summary>
        <div className="opex-details__body">
          <div className="opex-basis-toggle opex-basis-toggle--compact" role="group" aria-label="Building cost basis">
            <button
              type="button"
              className={`opex-basis-toggle__btn${basis === 'flat' ? ' is-active' : ''}`}
              aria-pressed={basis === 'flat'}
              onClick={() => setBasis('flat')}
            >
              £ / Flat
            </button>
            <button
              type="button"
              className={`opex-basis-toggle__btn${basis === 'sqft' ? ' is-active' : ''}`}
              aria-pressed={basis === 'sqft'}
              onClick={() => setBasis('sqft')}
            >
              £ / Sq Ft
            </button>
          </div>

          <ul className="opex-bars opex-bars--compact">
            {rows.map((row) => {
              const width = max > 0 ? Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0) : 0
              return (
                <li key={row.key} className="opex-bars__row">
                  <div className="opex-bars__meta">
                    <span className="opex-bars__label">{row.label}</span>
                    <span className="opex-bars__value">
                      {formatCostByBasis(row.value, basis) || '—'}
                    </span>
                  </div>
                  <div className="opex-bars__track" aria-hidden="true">
                    <div
                      className="opex-bars__fill"
                      style={{ width: `${width}%`, background: '#3B5F8A' }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </details>
    </section>
  )
}
