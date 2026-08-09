import { useMemo } from 'react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import ChartCard from '../../../../components/analysis/ChartCard'
import { CHART, TOOLTIP_STYLE } from '../../../../config/theme'
import { buildOccupancyLeakageScatter } from '../../utils/analysis'
import { formatPercent2, formatYear } from '../../utils/formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }

function pctTick(v) {
  return `${(Number(v) * 100).toFixed(0)}%`
}

export default function OccupancyLeakageChart({ records, onSchemeClick }) {
  const points = useMemo(() => buildOccupancyLeakageScatter(records), [records])

  return (
    <ChartCard
      title="Occupancy vs Leakage"
      subtitle="Evidence relationship only · Leakage incl. Management · not causation"
      className="col-span-6"
      empty={!points}
      emptyMessage="Insufficient comparable evidence for Occupancy vs Leakage analysis."
    >
      {points && (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 12, right: 16, bottom: 12, left: 4 }}>
            <CartesianGrid stroke={CHART.grid} />
            <XAxis
              type="number"
              dataKey="x"
              name="Occupancy"
              domain={[0, 1]}
              tickFormatter={pctTick}
              tick={axisTick}
              stroke={CHART.axis}
              label={{
                value: 'Occupancy',
                position: 'insideBottom',
                offset: -2,
                fill: CHART.axisText,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Leakage"
              tickFormatter={pctTick}
              tick={axisTick}
              stroke={CHART.axis}
              width={48}
              label={{
                value: 'Leakage incl. Mgmt',
                angle: -90,
                position: 'insideLeft',
                fill: CHART.axisText,
                fontSize: 11,
              }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const p = payload[0].payload
                return (
                  <div style={TOOLTIP_STYLE} className="opex-scatter-tooltip">
                    <strong>
                      {[p.scheme, formatYear(p.year), p.actualOrForecast]
                        .filter(Boolean)
                        .join(' · ')}
                    </strong>
                    <div>{[p.location, p.region].filter(Boolean).join(' · ')}</div>
                    <div>Occupancy: {formatPercent2(p.x) || '—'}</div>
                    <div>Leakage incl. Mgmt: {formatPercent2(p.y) || '—'}</div>
                  </div>
                )
              }}
            />
            <Scatter
              data={points}
              fill={CHART.primaryMid}
              cursor={onSchemeClick ? 'pointer' : 'default'}
              onClick={(entry) => {
                const rec = entry?.payload?.record ?? entry?.record
                if (onSchemeClick && rec) onSchemeClick(rec)
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
