import { useEffect, useMemo, useState } from 'react'
import {
  formatBool,
  formatCurrencyFlat,
  formatCurrencySqFt,
  formatCurrencyTotal,
  formatPercent2,
  formatSqFt,
  formatUnitSize,
  formatUnits,
  formatYear,
  isBlank,
} from '../../utils/formatters'
import {
  getDefaultSchemeRecord,
  getSchemeRecords,
  recordIdentity,
} from '../../utils/indexRecords'
import BuildingBreakdown from './BuildingBreakdown'
import OpexBreakdown from './OpexBreakdown'

const DASH = '—'

function dash(value) {
  return value === '' || value === null || value === undefined ? DASH : value
}

function Metric({ label, value, emphasize = false }) {
  return (
    <div className={`metric${emphasize ? ' metric--emphasize' : ''}`}>
      <span className="metric__label">{label}</span>
      <span className="metric__value">{value}</span>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className="info-row__value">{value}</span>
    </div>
  )
}

function recordChipLabel(rec) {
  const year = formatYear(rec?.Year) || '—'
  const type = String(rec?.Actual_Or_Forecast ?? '').trim() || '—'
  return `${year} · ${type}`
}

export default function SchemeDetailModal({
  seedRecord,
  indexes,
  onClose,
  preferSeed = false,
}) {
  const schemeRecords = useMemo(() => {
    const fromIndex = getSchemeRecords(indexes, seedRecord?.Scheme)
    if (fromIndex.length > 0) return fromIndex
    return seedRecord ? [seedRecord] : []
  }, [indexes, seedRecord])

  const [activeId, setActiveId] = useState(() => {
    if (preferSeed && seedRecord) return recordIdentity(seedRecord)
    const preferred = getDefaultSchemeRecord(schemeRecords)
    return recordIdentity(preferred || seedRecord)
  })

  const active = useMemo(() => {
    return (
      schemeRecords.find((r) => recordIdentity(r) === activeId) ||
      getDefaultSchemeRecord(schemeRecords) ||
      seedRecord
    )
  }, [schemeRecords, activeId, seedRecord])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!seedRecord || !active) return null

  const hasMultiple = schemeRecords.length > 1
  const comments =
    typeof active.Comments === 'string' ? active.Comments.trim() : active.Comments
  const hasComments = comments !== null && comments !== undefined && String(comments).trim() !== ''

  const subtitle = [active.Location, active.Region].filter(Boolean).join('  ·  ') || DASH

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal modal--opex"
        role="dialog"
        aria-modal="true"
        aria-label={`${seedRecord.Scheme || 'Scheme'} operational costs`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <div className="modal__heading">
            <h2 className="modal__title">{seedRecord.Scheme || 'Unnamed scheme'}</h2>
            <p className="modal__sub">{subtitle}</p>
            <div className="modal__badges">
              {!isBlank(active.Actual_Or_Forecast) && (
                <span className="badge badge--soft">{active.Actual_Or_Forecast}</span>
              )}
              {!isBlank(active.Year) && (
                <span className="badge badge--verified">{formatYear(active.Year)}</span>
              )}
              {!isBlank(active.Operator) && (
                <span className="badge badge--soft">{active.Operator}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="modal__close"
            aria-label="Close scheme details"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"
              />
            </svg>
          </button>
        </header>

        {hasMultiple ? (
          <div className="period-switch" role="tablist" aria-label="Evidence year">
            <span className="period-switch__label">Evidence</span>
            {schemeRecords.map((rec) => {
              const id = recordIdentity(rec)
              const selected = id === recordIdentity(active)
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`period-chip${selected ? ' is-active' : ''}`}
                  onClick={() => setActiveId(id)}
                >
                  {recordChipLabel(rec)}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="period-switch period-switch--single">
            <span className="period-switch__label">Evidence</span>
            <span className="period-chip is-active">{recordChipLabel(active)}</span>
          </div>
        )}

        <div className="modal__body">
          <section className="modal__section">
            <h3 className="modal__section-title">Scheme overview</h3>
            <div className="info-grid">
              <InfoRow label="Scheme" value={dash(active.Scheme)} />
              <InfoRow label="Location" value={dash(active.Location)} />
              <InfoRow label="Region" value={dash(active.Region)} />
              <InfoRow label="Operator" value={dash(active.Operator)} />
              <InfoRow label="Units" value={dash(formatUnits(active.Units))} />
              <InfoRow
                label="Year completed"
                value={dash(formatYear(active.Year_Completed))}
              />
              <InfoRow label="Sq ft" value={dash(formatSqFt(active.Sq_Ft))} />
              <InfoRow
                label="Average unit size"
                value={dash(formatUnitSize(active.Average_Unit_Size))}
              />
              <InfoRow label="Amenity grade" value={dash(active.Amenity_Grade)} />
              <InfoRow label="Stabilised" value={dash(formatBool(active.Stabilised))} />
              <InfoRow
                label="Actual / Forecast"
                value={dash(active.Actual_Or_Forecast)}
              />
              <InfoRow label="Evidence year" value={dash(formatYear(active.Year))} />
              <InfoRow
                label="Occupancy"
                value={dash(formatPercent2(active.Occupancy))}
              />
            </div>
          </section>

          <section className="modal__section">
            <h3 className="modal__section-title">Headline OpEx</h3>
            <div className="metric-grid metric-grid--opex">
              <Metric
                label="OpEx excl. management fee / flat"
                value={dash(formatCurrencyFlat(active.Cost_Exc_ManFee_Per_Flat))}
                emphasize
              />
              <Metric
                label="OpEx excl. management fee / sq ft"
                value={dash(formatCurrencySqFt(active.Cost_Exc_ManFee_Per_SqFt))}
                emphasize
              />
              <Metric
                label="OpEx incl. management fee / flat"
                value={dash(formatCurrencyFlat(active.Cost_Inc_ManFee_Per_Flat))}
                emphasize
              />
              <Metric
                label="OpEx incl. management fee / sq ft"
                value={dash(formatCurrencySqFt(active.Cost_Inc_ManFee_Per_SqFt))}
                emphasize
              />
              <Metric
                label="Total OpEx"
                value={dash(formatCurrencyTotal(active.Total_Expenditure))}
              />
              <Metric
                label="Management fee"
                value={dash(formatCurrencyTotal(active.Mgt_Fee))}
              />
              <Metric
                label="Leakage"
                value={dash(formatPercent2(active.Leakage_Pct))}
              />
              <Metric
                label="OpEx / flat"
                value={dash(formatCurrencyFlat(active.Total_Expenditure_Per_Flat))}
              />
            </div>
          </section>

          <OpexBreakdown key={recordIdentity(active)} record={active} />

          <section className="modal__section">
            <h3 className="modal__section-title">Income &amp; leakage</h3>
            <div className="info-grid">
              <InfoRow
                label="Rental income"
                value={dash(formatCurrencyTotal(active.Rental_Income))}
              />
              <InfoRow
                label="Income / sq ft"
                value={dash(formatCurrencySqFt(active.Income_Per_SqFt))}
              />
              <InfoRow
                label="Bad debt"
                value={dash(formatCurrencyTotal(active.Bad_Debt))}
              />
              <InfoRow
                label="Bad debt % of income"
                value={dash(formatPercent2(active.Bad_Debt_Pct_Income))}
              />
              <InfoRow
                label="Leakage"
                value={dash(formatPercent2(active.Leakage_Pct))}
              />
              <InfoRow
                label="Adjusted leakage"
                value={dash(formatPercent2(active.Leakage_Pct_Adjusted))}
              />
              <InfoRow
                label="Leakage incl. management"
                value={dash(formatPercent2(active.Leakage_Incl_Mgmt))}
              />
              <InfoRow
                label="Management fee % of income"
                value={dash(formatPercent2(active.Mgt_Fee_Pct_Income))}
              />
              <InfoRow
                label="Occupancy"
                value={dash(formatPercent2(active.Occupancy))}
              />
              <InfoRow
                label="Adjusted for occupancy"
                value={dash(
                  formatBool(active.Adjusted_For_Occupancy) ||
                    (active.Adjusted_For_Occupancy != null &&
                    active.Adjusted_For_Occupancy !== ''
                      ? String(active.Adjusted_For_Occupancy)
                      : '')
                )}
              />
            </div>
          </section>

          <BuildingBreakdown key={`bldg-${recordIdentity(active)}`} record={active} />

          {hasComments && (
            <section className="modal__section">
              <h3 className="modal__section-title">Comments</h3>
              <p className="opex-comments">{String(comments)}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
