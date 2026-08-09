import { useMemo } from 'react'
import {
  analysisContextLabel,
  buildCoreOpexBasisKpis,
  buildCoreOpexSummaryKpis,
} from '../../utils/analysis'
import AnalysisKPIs from './AnalysisKPIs'
import CostBasisToggle from './CostBasisToggle'
import GroupCompositionChart from './GroupCompositionChart'
import GroupOpexChart from './GroupOpexChart'

function AnalysisSection({ title, children, chartGrid = true }) {
  return (
    <section className="opex-analysis-block">
      <h2 className="opex-analysis-block__title">{title}</h2>
      {chartGrid ? (
        <div className="analysis-grid opex-analysis-grid">{children}</div>
      ) : (
        children
      )}
    </section>
  )
}

export default function AnalysisTab({
  records,
  selected,
  filtered,
  basis,
  onBasisChange,
}) {
  const contextLabel = useMemo(
    () => analysisContextLabel(records, { selected, filtered }),
    [records, selected, filtered]
  )

  const isSummary = basis === 'summary'
  const costBasis = basis === 'sqft' ? 'sqft' : 'flat'

  const coreCards = useMemo(
    () =>
      isSummary
        ? buildCoreOpexSummaryKpis(records)
        : buildCoreOpexBasisKpis(records, costBasis),
    [records, isSummary, costBasis]
  )

  return (
    <div className="tab-panel analysis-panel opex-analysis-panel">
      <div className="analysis-toolbar">
        <span className="analysis-toolbar__label">Cost basis</span>
        <CostBasisToggle value={basis} onChange={onBasisChange} />
        <span
          className={`analysis-basis${selected ? ' analysis-basis--selected' : ''}`}
        >
          {contextLabel}
        </span>
      </div>

      <AnalysisSection title="Core OpEx" chartGrid={false}>
        <AnalysisKPIs cards={coreCards} columns={isSummary ? 4 : 3} />
      </AnalysisSection>

      <AnalysisSection title="By Region">
        {isSummary ? (
          <>
            <GroupOpexChart
              records={records}
              groupField="Region"
              groupLabel="Region"
              basis="flat"
              className="col-span-3"
              title="Average OpEx / Flat by Region"
              subtitle="Headline regional comparison · £ / Flat"
            />
            <GroupOpexChart
              records={records}
              groupField="Region"
              groupLabel="Region"
              basis="sqft"
              className="col-span-3"
              title="Average OpEx / Sq Ft by Region"
              subtitle="Headline regional comparison · £ / Sq Ft"
            />
          </>
        ) : (
          <>
            <GroupOpexChart
              records={records}
              groupField="Region"
              groupLabel="Region"
              basis={costBasis}
              className="col-span-3"
            />
            <GroupCompositionChart
              records={records}
              groupField="Region"
              groupLabel="Region"
              basis={costBasis}
              className="col-span-3"
            />
          </>
        )}
      </AnalysisSection>

      <AnalysisSection title="By Location">
        {isSummary ? (
          <>
            <GroupOpexChart
              records={records}
              groupField="Location"
              groupLabel="Location"
              basis="flat"
              className="col-span-3"
              title="Average OpEx / Flat by Location"
              subtitle="Headline location comparison · £ / Flat"
            />
            <GroupOpexChart
              records={records}
              groupField="Location"
              groupLabel="Location"
              basis="sqft"
              className="col-span-3"
              title="Average OpEx / Sq Ft by Location"
              subtitle="Headline location comparison · £ / Sq Ft"
            />
          </>
        ) : (
          <>
            <GroupOpexChart
              records={records}
              groupField="Location"
              groupLabel="Location"
              basis={costBasis}
              className="col-span-3"
            />
            <GroupCompositionChart
              records={records}
              groupField="Location"
              groupLabel="Location"
              basis={costBasis}
              className="col-span-3"
            />
          </>
        )}
      </AnalysisSection>
    </div>
  )
}
