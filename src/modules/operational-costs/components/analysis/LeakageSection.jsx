import { useMemo } from 'react'
import {
  buildLeakageKpis,
  buildSchemeLeakageRows,
} from '../../utils/analysis'
import { formatPercent2 } from '../../utils/formatters'
import PercentSchemeChart from './PercentSchemeChart'

function MiniKpi({ label, value }) {
  return (
    <div className="opex-mini-kpi">
      <span className="opex-mini-kpi__value">{formatPercent2(value) || '—'}</span>
      <span className="opex-mini-kpi__label">{label}</span>
    </div>
  )
}

export default function LeakageSection({ records, onSchemeClick }) {
  const kpis = useMemo(() => buildLeakageKpis(records), [records])
  const inclMgmt = useMemo(
    () => buildSchemeLeakageRows(records, 'Leakage_Incl_Mgmt'),
    [records]
  )
  const base = useMemo(() => buildSchemeLeakageRows(records, 'Leakage_Pct'), [records])
  const adjusted = useMemo(
    () => buildSchemeLeakageRows(records, 'Leakage_Pct_Adjusted'),
    [records]
  )

  const hasAny =
    kpis.avgLeakage.count + kpis.avgAdjusted.count + kpis.avgInclMgmt.count > 0

  if (!hasAny) {
    return (
      <div className="chart-empty opex-section-empty">
        Insufficient comparable evidence for Leakage analysis.
      </div>
    )
  }

  return (
    <>
      <div className="opex-mini-kpi-grid col-span-6">
        <MiniKpi label="Average Leakage %" value={kpis.avgLeakage.value} />
        <MiniKpi label="Average Adjusted Leakage %" value={kpis.avgAdjusted.value} />
        <MiniKpi
          label="Average Leakage incl. Management %"
          value={kpis.avgInclMgmt.value}
        />
      </div>
      <PercentSchemeChart
        title="Leakage incl. Management by Scheme"
        subtitle="Source field kept separate · evidence records distinct by year"
        data={inclMgmt}
        valueLabel="Leakage incl. Management"
        onSchemeClick={onSchemeClick}
        className="col-span-3"
      />
      <PercentSchemeChart
        title="Leakage % by Scheme"
        subtitle="Base leakage measure · not combined with other definitions"
        data={base}
        valueLabel="Leakage %"
        onSchemeClick={onSchemeClick}
        className="col-span-3"
        accentFirst={false}
      />
      {adjusted.length > 0 && (
        <PercentSchemeChart
          title="Adjusted Leakage % by Scheme"
          subtitle="Adjusted leakage measure · shown only where populated"
          data={adjusted}
          valueLabel="Adjusted Leakage %"
          onSchemeClick={onSchemeClick}
          className="col-span-6"
          accentFirst={false}
        />
      )}
    </>
  )
}
