import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartCard from '../../../../components/analysis/ChartCard'
import { CHART, TOOLTIP_STYLE } from '../../../../config/theme'
import { buildSchemeOpexRows } from '../../utils/analysis'
import { averageField } from '../../utils/aggregates'
import { opexValueField } from '../../config/costCategories'
import { formatYear } from '../../utils/formatters'
import { horizontalBarLayout, useViewportHeight } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 11, fill: CHART.categoryText }

const SORT_OPTIONS = [
  { id: 'desc', label: 'Highest → Lowest' },
  { id: 'asc', label: 'Lowest → Highest' },
  { id: 'alpha', label: 'Scheme A–Z' },
]

export default function SchemeOpexChart({ records, basis, onSchemeClick }) {
  const [sort, setSort] = useState('desc')
  const [viewportRef, viewportH] = useViewportHeight()

  const data = useMemo(
    () => buildSchemeOpexRows(records, basis, sort),
    [records, basis, sort]
  )
  const avg = useMemo(
    () => averageField(records, opexValueField(basis)).value,
    [records, basis]
  )

  const layout = horizontalBarLayout(data.length)
  const contentH = Math.max(140, data.length * layout.rowBand + 20)
  const plotH = Math.max(contentH, viewportH || contentH)
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <ChartCard
      title="OpEx by Scheme"
      subtitle={`${basisLabel} · evidence records kept distinct by year`}
      className="col-span-3"
      empty={data.length === 0}
      emptyMessage="Insufficient comparable records for this analysis."
      actions={
        <label className="opex-chart-sort">
          <span className="opex-chart-sort__label">Sort</span>
          <select
            className="opex-chart-sort__select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div className="chart-scroll" ref={viewportRef}>
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
              width={148}
              tick={catTick}
              stroke={CHART.axis}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,223,0,0.10)' }}
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [formatBasisValue(v, basis), `OpEx ${basisLabel}`]}
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
            {avg != null && (
              <ReferenceLine
                x={avg}
                stroke={CHART.accent}
                strokeWidth={2}
                strokeDasharray="4 3"
                label={{
                  value: 'Avg',
                  position: 'insideTopRight',
                  fill: CHART.primary,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              maxBarSize={layout.maxBarSize}
              cursor={onSchemeClick ? 'pointer' : 'default'}
              onClick={(entry) => {
                const rec = entry?.payload?.record ?? entry?.record
                if (onSchemeClick && rec) onSchemeClick(rec)
              }}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={CHART.primaryMid} />
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
    </ChartCard>
  )
}
