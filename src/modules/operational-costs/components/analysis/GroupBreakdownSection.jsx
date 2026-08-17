import { useMemo, useState } from 'react'
import { buildCompositionByGroup } from '../../utils/analysis'
import CompositionMatrix from './CompositionMatrix'
import GroupCompositionChart from './GroupCompositionChart'
import GroupOpexChart from './GroupOpexChart'
import ViewToggle from './ViewToggle'

export default function GroupBreakdownSection({
  title,
  groupField,
  groupLabel,
  records,
  costBasis,
}) {
  const [view, setView] = useState('chart')
  const compositionData = useMemo(
    () => buildCompositionByGroup(records, groupField, costBasis),
    [records, groupField, costBasis]
  )
  const basisLabel = costBasis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <section className="opex-analysis-block">
      <div className="opex-analysis-block__head">
        <h2 className="opex-analysis-block__title">{title}</h2>
        <ViewToggle
          value={view}
          onChange={setView}
          label={`${title} chart or table`}
        />
      </div>

      <div className="opex-breakdown-slot">
        {view === 'table' ? (
          <div className="panel opex-matrix-panel">
            <div className="panel__head">
              <div className="panel__head-main">
                <h3 className="panel__title">
                  Average OpEx composition by {groupLabel}
                </h3>
                <span className="panel__subtitle">
                  {basisLabel} component breakdown
                </span>
              </div>
            </div>
            <div className="panel__body opex-matrix-panel__body">
              <CompositionMatrix
                data={compositionData}
                groupLabel={groupLabel}
                basis={costBasis}
              />
            </div>
          </div>
        ) : (
          <div className="analysis-grid opex-analysis-grid">
            <GroupOpexChart
              records={records}
              groupField={groupField}
              groupLabel={groupLabel}
              basis={costBasis}
              className="col-span-3"
            />
            <GroupCompositionChart
              records={records}
              groupField={groupField}
              groupLabel={groupLabel}
              basis={costBasis}
              data={compositionData}
              className="col-span-3"
            />
          </div>
        )}
      </div>
    </section>
  )
}
