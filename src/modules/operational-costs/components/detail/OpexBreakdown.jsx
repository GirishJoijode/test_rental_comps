import { useMemo, useState } from 'react'
import {
  COST_BASES,
  DEFAULT_COST_BASIS,
  OPEX_CATEGORIES,
  fieldForBasis,
} from '../../config/costCategories'
import { formatCostByBasis, isBlank } from '../../utils/formatters'

function numericValue(record, key) {
  const raw = record?.[key]
  if (isBlank(raw)) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export default function OpexBreakdown({ record }) {
  const [basis, setBasis] = useState(DEFAULT_COST_BASIS)

  const rows = useMemo(() => {
    return OPEX_CATEGORIES.map((cat) => {
      const key = fieldForBasis(cat, basis)
      const value = numericValue(record, key)
      return { ...cat, value, fieldKey: key }
    })
  }, [record, basis])

  const max = Math.max(...rows.map((r) => r.value), 0)

  return (
    <section className="modal__section">
      <div className="opex-breakdown__head">
        <h3 className="modal__section-title opex-breakdown__title">OpEx breakdown</h3>
        <div className="opex-basis-toggle" role="group" aria-label="Cost basis">
          {COST_BASES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`opex-basis-toggle__btn${basis === opt.id ? ' is-active' : ''}`}
              aria-pressed={basis === opt.id}
              onClick={() => setBasis(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="opex-breakdown__hint">Where this scheme&apos;s OpEx is being spent</p>

      <ul className="opex-bars">
        {rows.map((row) => {
          const width = max > 0 ? Math.max((row.value / max) * 100, row.value > 0 ? 2 : 0) : 0
          const display = formatCostByBasis(row.value, basis) || '—'
          return (
            <li key={row.id} className="opex-bars__row">
              <div className="opex-bars__meta">
                <span className="opex-bars__label">
                  <span
                    className="opex-bars__swatch"
                    style={{ background: row.color }}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="opex-bars__value">{display}</span>
              </div>
              <div className="opex-bars__track" aria-hidden="true">
                <div
                  className="opex-bars__fill"
                  style={{ width: `${width}%`, background: row.color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
