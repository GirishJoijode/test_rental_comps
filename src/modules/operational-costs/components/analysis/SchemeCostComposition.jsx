import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../../components/analysis/ChartCard'
import { CHART, TOOLTIP_STYLE } from '../../../../config/theme'
import { OPEX_CATEGORIES } from '../../config/costCategories'
import { buildSchemeCompositionRows } from '../../utils/analysis'
import { formatYear } from '../../utils/formatters'
import { horizontalBarLayout, useViewportHeight } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 11, fill: CHART.categoryText }

export default function SchemeCostComposition({ records, basis, onSchemeClick }) {
  const [viewportRef, viewportH] = useViewportHeight()
  const data = useMemo(() => buildSchemeCompositionRows(records, basis, 'desc'), [records, basis])
  const layout = horizontalBarLayout(data.length, { stacked: true })
  const contentH = Math.max(160, data.length * layout.rowBand + 36)
  const plotH = Math.max(contentH, viewportH || contentH)
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <ChartCard
      title="Scheme OpEx composition"
      subtitle={`Stacked ${basisLabel} by cost category · absolute values`}
      className="col-span-6"
      empty={data.length === 0}
      emptyMessage="Insufficient comparable records for this analysis."
    >
      <div className="chart-scroll" ref={viewportRef}>
        <ResponsiveContainer width="100%" height={plotH}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 16, bottom: 8, left: 4 }}
            barCategoryGap={layout.barCategoryGap}
          >
            <CartesianGrid horizontal={false} stroke={CHART.grid} />
            <XAxis
              type="number"
              tickFormatter={(v) => formatBasisAxis(v, basis)}
              tick={axisTick}
              stroke={CHART.axis}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={148}
              tick={catTick}
              stroke={CHART.axis}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,223,0,0.10)' }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v, name) => [formatBasisValue(v, basis), name]}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload
                if (!p) return ''
                return [
                  p.scheme,
                  p.location,
                  p.region,
                  `Year ${formatYear(p.year) || '—'}`,
                  p.actualOrForecast || '—',
                ]
                  .filter(Boolean)
                  .join(' · ')
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {OPEX_CATEGORIES.map((cat) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                name={cat.label}
                stackId="opex"
                fill={cat.color}
                maxBarSize={layout.maxBarSize}
                cursor={onSchemeClick ? 'pointer' : 'default'}
                onClick={(entry) => {
                  const rec = entry?.payload?.record ?? entry?.record
                  if (onSchemeClick && rec) onSchemeClick(rec)
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
