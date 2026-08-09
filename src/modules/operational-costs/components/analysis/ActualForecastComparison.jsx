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
import { buildActualForecastComparison } from '../../utils/analysis'
import { verticalBarLayout } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 12, fill: CHART.categoryText }

export default function ActualForecastComparison({ records, basis }) {
  const data = useMemo(
    () => buildActualForecastComparison(records, basis),
    [records, basis]
  )
  if (!data) return null

  const layout = verticalBarLayout(data.length)
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <ChartCard
      title="Actual vs Forecast OpEx"
      subtitle={`Average OpEx ${basisLabel} by evidence classification · not same-period variance`}
      className="col-span-3"
      empty={data.length === 0}
      emptyMessage="Insufficient comparable records for this analysis."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 18, right: 12, bottom: 8, left: 4 }}
          barCategoryGap={layout.barCategoryGap}
        >
          <CartesianGrid vertical={false} stroke={CHART.grid} />
          <XAxis dataKey="name" tick={catTick} stroke={CHART.axis} interval={0} />
          <YAxis
            tickFormatter={(v) => formatBasisAxis(v, basis)}
            tick={axisTick}
            stroke={CHART.axis}
            width={52}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,223,0,0.10)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, _n, p) => [
              `${formatBasisValue(v, basis)} · ${p?.payload?.count ?? 0} recs`,
              `Avg OpEx ${basisLabel}`,
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={layout.maxBarSize}>
            {data.map((d) => (
              <Cell
                key={d.name}
                fill={/actual/i.test(d.name) ? CHART.accent : CHART.primaryMid}
              />
            ))}
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v) => formatBasisValue(v, basis)}
              style={{ fontSize: 11, fill: CHART.categoryText, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
