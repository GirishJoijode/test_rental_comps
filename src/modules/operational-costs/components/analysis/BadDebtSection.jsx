import { useMemo } from 'react'
import { buildBadDebtPctRows } from '../../utils/analysis'
import { averageField } from '../../utils/aggregates'
import { formatCurrencyTotal, formatPercent2 } from '../../utils/formatters'
import PercentSchemeChart from './PercentSchemeChart'

export default function BadDebtSection({ records, onSchemeClick }) {
  const rows = useMemo(() => buildBadDebtPctRows(records), [records])
  const avgPct = useMemo(
    () => averageField(records, 'Bad_Debt_Pct_Income'),
    [records]
  )
  const avgAbs = useMemo(() => averageField(records, 'Bad_Debt'), [records])

  if (rows.length === 0) {
    return (
      <div className="chart-empty opex-section-empty col-span-6">
        Insufficient comparable evidence for Bad Debt analysis.
      </div>
    )
  }

  return (
    <>
      <div className="opex-mini-kpi-grid col-span-6">
        <div className="opex-mini-kpi">
          <span className="opex-mini-kpi__value">
            {formatPercent2(avgPct.value) || '—'}
          </span>
          <span className="opex-mini-kpi__label">Average Bad Debt % of Income</span>
        </div>
        <div className="opex-mini-kpi">
          <span className="opex-mini-kpi__value">
            {avgAbs.value != null ? formatCurrencyTotal(avgAbs.value) : '—'}
          </span>
          <span className="opex-mini-kpi__label">Average Bad Debt £ (context)</span>
        </div>
      </div>
      <PercentSchemeChart
        title="Bad Debt % of Income by Scheme"
        subtitle="Preferred cross-scheme comparison · absolute £ in tooltips via record detail"
        data={rows}
        valueLabel="Bad Debt % of Income"
        onSchemeClick={onSchemeClick}
        className="col-span-6"
      />
    </>
  )
}
