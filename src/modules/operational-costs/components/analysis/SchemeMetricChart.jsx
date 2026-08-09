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
import { formatYear } from '../../utils/formatters'
import { horizontalBarLayout, useViewportHeight } from './chartLayout'
import { formatBasisAxis, formatBasisValue } from './formatters'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 11, fill: CHART.categoryText }

export default function SchemeMetricChart({
  title,
  subtitle,
  data,
  basis,
  valueLabel,
  className = 'col-span-3',
  onSchemeClick,
}) {
  const [viewportRef, viewportH] = useViewportHeight()
  const rows = data || []
  const layout = horizontalBarLayout(rows.length)
  const contentH = Math.max(140, rows.length * layout.rowBand + 20)
  const plotH = Math.max(contentH, viewportH || contentH)

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      className={className}
      empty={rows.length === 0}
      emptyMessage="Insufficient comparable evidence for this analysis."
    >
      <div className="chart-scroll" ref={viewportRef}>
        <ResponsiveContainer width="100%" height={plotH}>
          <BarChart
            layout="vertical"
            data={rows}
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
              formatter={(v) => [formatBasisValue(v, basis), valueLabel]}
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
              {rows.map((d) => (
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
