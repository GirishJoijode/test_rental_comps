import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  LabelList,
  Cell,
} from 'recharts'
import ChartCard from '../../../../components/analysis/ChartCard'
import { CHART, TOOLTIP_STYLE } from '../../../../config/theme'
import { buildOpexByYear, buildSchemeYearTrends } from '../../utils/analysis'
import { verticalBarLayout } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 12, fill: CHART.categoryText }

const SCHEME_COLORS = [
  '#25273A',
  '#3B5F8A',
  '#B8973F',
  '#6B8A9E',
  '#8B7355',
  '#C4A21A',
  '#5A7A9A',
  '#8FA3B8',
]

export default function OpexTrendsSection({ records, basis }) {
  const byYear = useMemo(() => buildOpexByYear(records, basis), [records, basis])
  const schemeTrends = useMemo(
    () => buildSchemeYearTrends(records, basis),
    [records, basis]
  )
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'
  const layout = verticalBarLayout(byYear.length)

  return (
    <>
      <ChartCard
        title={`Average OpEx ${basisLabel} by Year`}
        subtitle="Mean across the currently analysed evidence set"
        className="col-span-3"
        empty={byYear.length < 2}
        emptyMessage="Insufficient multi-year evidence for OpEx trend analysis."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={byYear}
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
              {byYear.map((d, i) => (
                <Cell key={d.name} fill={i === byYear.length - 1 ? CHART.accent : CHART.primaryMid} />
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

      <ChartCard
        title={`Scheme OpEx history · ${basisLabel}`}
        subtitle="Schemes with multiple years in the active set · Actual/Forecast shown in tooltips"
        className="col-span-3"
        empty={!schemeTrends}
        emptyMessage="No schemes with multiple years in the current analysis set."
      >
        {schemeTrends && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={schemeTrends.rows}
              margin={{ top: 12, right: 12, bottom: 8, left: 4 }}
            >
              <CartesianGrid stroke={CHART.grid} />
              <XAxis dataKey="year" tick={catTick} stroke={CHART.axis} />
              <YAxis
                tickFormatter={(v) => formatBasisAxis(v, basis)}
                tick={axisTick}
                stroke={CHART.axis}
                width={52}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v, name, item) => {
                  const meta = item?.payload?.[`${name}__meta`]
                  const type = meta?.actualOrForecast
                    ? ` · ${meta.actualOrForecast}`
                    : ''
                  return [
                    `${formatBasisValue(v, basis)}${type}`,
                    name,
                  ]
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {schemeTrends.schemes.map((scheme, i) => (
                <Line
                  key={scheme}
                  type="monotone"
                  dataKey={scheme}
                  stroke={SCHEME_COLORS[i % SCHEME_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3.5 }}
                  connectNulls={false}
                  name={scheme}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </>
  )
}
