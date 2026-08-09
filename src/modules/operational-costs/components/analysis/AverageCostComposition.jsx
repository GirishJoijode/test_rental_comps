import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../../components/analysis/ChartCard'
import { CHART, TOOLTIP_STYLE } from '../../../../config/theme'
import { buildAverageComposition } from '../../utils/analysis'
import { horizontalBarLayout } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 11, fill: CHART.categoryText }

export default function AverageCostComposition({ records, basis }) {
  const data = useMemo(() => buildAverageComposition(records, basis), [records, basis])
  const layout = horizontalBarLayout(data.length)
  const plotH = Math.max(200, data.length * layout.rowBand + 24)
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <ChartCard
      title="Average OpEx composition"
      subtitle={`Mean category contribution · ${basisLabel}`}
      className="col-span-3"
      empty={data.length === 0}
      emptyMessage="Insufficient comparable records for this analysis."
    >
      <ResponsiveContainer width="100%" height={plotH}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
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
            width={130}
            tick={catTick}
            stroke={CHART.axis}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,223,0,0.10)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, _n, p) => [
              `${formatBasisValue(v, basis)} · ${p?.payload?.count ?? 0} recs`,
              p?.payload?.name || 'Category',
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={layout.maxBarSize}>
            {data.map((d) => (
              <Cell key={d.id} fill={d.color} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v) => formatBasisValue(v, basis)}
              style={{ fontSize: 10, fill: CHART.axisText }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
