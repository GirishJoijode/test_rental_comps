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
import { buildCompositionByGroup } from '../../utils/analysis'
import { horizontalBarLayout, useViewportHeight } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 12, fill: CHART.categoryText }

/** Stacked average OpEx composition by Region or Location. */
export default function GroupCompositionChart({
  records,
  groupField,
  groupLabel,
  basis,
  className = 'col-span-3',
}) {
  const [viewportRef, viewportH] = useViewportHeight()
  const data = useMemo(
    () => buildCompositionByGroup(records, groupField, basis),
    [records, groupField, basis]
  )
  const layout = horizontalBarLayout(data.length, { stacked: true })
  const contentH = Math.max(180, data.length * layout.rowBand + 40)
  const plotH = Math.max(contentH, viewportH || contentH)
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'
  const yWidth = groupField === 'Location' ? 120 : 100

  return (
    <ChartCard
      title={`Average OpEx composition by ${groupLabel}`}
      subtitle={`Stacked average ${basisLabel} components`}
      className={className}
      empty={data.length === 0}
      emptyMessage={`Insufficient comparable records for ${groupLabel} composition.`}
    >
      <div className="chart-scroll" ref={viewportRef}>
        <ResponsiveContainer width="100%" height={plotH}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 12, bottom: 8, left: 4 }}
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
              width={yWidth}
              tick={catTick}
              stroke={CHART.axis}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,223,0,0.10)' }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v, name) => [formatBasisValue(v, basis), name]}
              labelFormatter={(label, payload) => {
                const count = payload?.[0]?.payload?.count
                return count != null ? `${label} · ${count} recs` : label
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {OPEX_CATEGORIES.map((cat) => (
              <Bar
                key={cat.id}
                dataKey={cat.id}
                name={cat.label}
                stackId="comp"
                fill={cat.color}
                maxBarSize={layout.maxBarSize}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
