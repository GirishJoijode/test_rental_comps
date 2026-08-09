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
import { buildOpexByGroup } from '../../utils/analysis'
import { horizontalBarLayout, useViewportHeight, verticalBarLayout } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 12, fill: CHART.categoryText }

/**
 * Average OpEx by Region or Location.
 * Uses vertical bars for sparse sets; horizontal + internal scroll when dense.
 */
export default function GroupOpexChart({
  records,
  groupField,
  groupLabel,
  basis,
  className = 'col-span-3',
  title,
  subtitle,
}) {
  const data = useMemo(
    () => buildOpexByGroup(records, groupField, basis),
    [records, groupField, basis]
  )
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'
  const horizontal = data.length > 8
  const [viewportRef, viewportH] = useViewportHeight()
  const vLayout = verticalBarLayout(data.length)
  const hLayout = horizontalBarLayout(data.length)
  const contentH = Math.max(140, data.length * hLayout.rowBand + 20)
  const plotH = Math.max(contentH, viewportH || contentH)

  const chartTitle = title || `Average OpEx ${basisLabel} by ${groupLabel}`
  const chartSub =
    subtitle || `Mean OpEx ${basisLabel} within the currently analysed evidence`

  const chart = horizontal ? (
    <div className="chart-scroll" ref={viewportRef}>
      <ResponsiveContainer width="100%" height={plotH}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 56, bottom: 4, left: 4 }}
          barCategoryGap={hLayout.barCategoryGap}
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
            width={120}
            tick={catTick}
            stroke={CHART.axis}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,223,0,0.10)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, _n, p) => [
              `${formatBasisValue(v, basis)} · ${p?.payload?.count ?? 0} recs`,
              `Avg OpEx ${basisLabel}`,
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={hLayout.maxBarSize}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={i === 0 ? CHART.accent : CHART.primaryMid} />
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
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 18, right: 12, bottom: 8, left: 4 }}
        barCategoryGap={vLayout.barCategoryGap}
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
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={vLayout.maxBarSize}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={i === 0 ? CHART.accent : CHART.primaryMid} />
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
  )

  return (
    <ChartCard
      title={chartTitle}
      subtitle={chartSub}
      className={className}
      empty={data.length === 0}
      emptyMessage={`Insufficient comparable records for ${groupLabel} analysis.`}
    >
      {chart}
    </ChartCard>
  )
}
