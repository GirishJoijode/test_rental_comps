import ChartCard from '../../../../components/analysis/ChartCard'
import { formatKpi } from './formatters'

export default function SummaryOverview({ metrics }) {
  const hasData = metrics.some((m) => m.value != null)
  return (
    <ChartCard
      title="Headline OpEx summary"
      subtitle="Key averages for the currently analysed evidence"
      className="col-span-6"
      empty={!hasData}
      emptyMessage="Insufficient comparable records for this analysis."
    >
      <div className="opex-summary-metrics">
        {metrics.map((m) => (
          <div key={m.id} className="opex-summary-metric">
            <span className="opex-summary-metric__value">
              {formatKpi(m.value, m.format)}
            </span>
            <span className="opex-summary-metric__label">{m.label}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}
