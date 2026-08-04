import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART, TOOLTIP_STYLE } from '../../config/theme'
import {
  averageByGroupForField,
  averageByGroupForUnits,
  averageOverallByUnits,
  countByDateFilter,
  occupancyByStabilisation,
  UNIT_DEFS,
  UNIT_TOGGLE_OPTIONS,
} from '../../utils/analysis'
import { latestPerScheme } from '../../utils/dateUtils'
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters'
import ChartCard from './ChartCard'

const axisTick = { fontSize: 11, fill: CHART.axisText }
const catTick = { fontSize: 12, fill: CHART.categoryText }

const money = {
  axis: formatCurrencyShort,
  value: formatCurrency,
  label: 'Avg rent',
}
const psf = {
  axis: (v) => `£${v}`,
  value: (v) => `£${Number(v).toFixed(2)}`,
  label: 'Avg £ psf',
}
const percent = (v) => `${(Number(v) * 100).toFixed(1)}%`

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

// Track the visible chart viewport so scrollable plots can fill short datasets
// and overflow (scroll) when there are many categories.
function useViewportHeight() {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height
      if (Number.isFinite(h)) setHeight(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, height]
}

// Shared town/region bar proportions — thicker for sparse sets, floored for dense.
function horizontalBarLayout(count, { grouped = false } = {}) {
  const n = Math.max(count, 1)

  if (grouped) {
    const maxBarSize = clamp(20 - (n - 1) * 2, 10, 18)
    return {
      maxBarSize,
      barCategoryGap: n <= 1 ? '14%' : n <= 3 ? '10%' : '8%',
      barGap: 3,
      rowBand: maxBarSize * UNIT_DEFS.length + 16,
    }
  }

  // Single-series (town or region): same curve so Analysis feels consistent.
  // n=1 → ~48px cap; many towns → 16px floor (still readable while scrolling).
  const maxBarSize = clamp(Math.round(52 - (n - 1) * 3.2), 16, 48)
  const barCategoryGap =
    n <= 1 ? '16%' : n <= 2 ? '12%' : n <= 4 ? '9%' : n <= 8 ? '7%' : '5%'
  // Scrollable plot grows with category count using a band tied to bar size.
  const rowBand = clamp(maxBarSize + 12, 28, 56)

  return {
    maxBarSize,
    barCategoryGap,
    barGap: 0,
    rowBand,
  }
}

// Horizontal bar chart (category on Y).
// scroll=true → viewport fills the card; plot grows with categories and scrolls.
function HorizontalBars({ data, fmt, scroll = false }) {
  const [viewportRef, viewportH] = useViewportHeight()
  const layout = horizontalBarLayout(data.length)
  const contentH = Math.max(120, data.length * layout.rowBand + 16)
  // Fill the card when there are few rows; grow beyond it (and scroll) when many.
  const plotH = scroll ? Math.max(contentH, viewportH || contentH) : '100%'

  const chart = (
    <ResponsiveContainer width="100%" height={plotH}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 64, bottom: 4, left: 6 }}
        barCategoryGap={layout.barCategoryGap}
      >
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis type="number" tickFormatter={fmt.axis} tick={axisTick} stroke={CHART.axis} />
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
          formatter={(v, _n, p) => [`${fmt.value(v)}  ·  ${p?.payload?.count ?? 0} recs`, fmt.label]}
          contentStyle={TOOLTIP_STYLE}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={layout.maxBarSize}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={i === 0 ? CHART.accent : CHART.primaryMid} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={fmt.value}
            style={{ fontSize: 11, fill: CHART.axisText }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  if (!scroll) return chart
  return (
    <div className="chart-scroll" ref={viewportRef}>
      {chart}
    </div>
  )
}

// Summary top charts: exactly four overall-average bars (Studio → 3 Bed).
function SummaryOverallBars({ data, fmt }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 16, right: 12, bottom: 8, left: 4 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="name" tick={catTick} stroke={CHART.axis} interval={0} />
        <YAxis tickFormatter={fmt.axis} tick={axisTick} stroke={CHART.axis} width={48} />
        <Tooltip
          cursor={{ fill: 'rgba(255,223,0,0.10)' }}
          formatter={(v, _n, p) => [
            `${fmt.value(v)}  ·  ${p?.payload?.count ?? 0} recs`,
            fmt.label,
          ]}
          contentStyle={TOOLTIP_STYLE}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={72}>
          {data.map((d) => (
            <Cell key={d.key} fill={CHART.units[d.key] || CHART.primaryMid} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={fmt.value}
            style={{ fontSize: 11, fill: CHART.categoryText, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Summary regional charts: grouped bars per region for all four unit types.
function SummaryGroupedBars({ data, fmt }) {
  const layout = horizontalBarLayout(data.length, { grouped: true })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 28, bottom: 4, left: 6 }}
        barCategoryGap={layout.barCategoryGap}
        barGap={layout.barGap}
      >
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis type="number" tickFormatter={fmt.axis} tick={axisTick} stroke={CHART.axis} />
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
          formatter={(v, name, p) => {
            const unit = UNIT_DEFS.find((u) => u.label === name || u.key === name)
            const key = unit?.key
            const count = key ? p?.payload?.[`${key}_count`] : undefined
            const countBit = count != null ? `  ·  ${count} recs` : ''
            return [`${fmt.value(v)}${countBit}`, unit?.label || name]
          }}
          contentStyle={TOOLTIP_STYLE}
        />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: CHART.categoryText }}
        />
        {UNIT_DEFS.map((u) => (
          <Bar
            key={u.key}
            dataKey={u.key}
            name={u.label}
            fill={CHART.units[u.key]}
            radius={[0, 3, 3, 0]}
            maxBarSize={layout.maxBarSize}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

function UnitToggle({ value, onChange }) {
  return (
    <div className="segmented" role="tablist" aria-label="Unit type">
      {UNIT_TOGGLE_OPTIONS.map((u) => (
        <button
          key={u.key}
          type="button"
          role="tab"
          aria-selected={value === u.key}
          className={`segmented__btn${value === u.key ? ' is-active' : ''}`}
          onClick={() => onChange(u.key)}
        >
          {u.label}
        </button>
      ))}
    </div>
  )
}

export default function AnalysisTab({ records, basisLabel }) {
  const [unit, setUnit] = useState('Summary')
  const isSummary = unit === 'Summary'
  const unitDef = UNIT_DEFS.find((u) => u.key === unit) || UNIT_DEFS[0]

  const latestRecords = useMemo(() => latestPerScheme(records), [records])

  // Top charts: Summary = overall 4-bar averages; otherwise ALL towns (scroll).
  const rentByTown = useMemo(() => {
    if (isSummary) return averageOverallByUnits(latestRecords, 'rent')
    return averageByGroupForField(latestRecords, 'Town', unitDef.rent)
  }, [latestRecords, isSummary, unitDef])

  const psfByTown = useMemo(() => {
    if (isSummary) return averageOverallByUnits(latestRecords, 'psf', { round: 2 })
    return averageByGroupForField(latestRecords, 'Town', unitDef.psf, { round: 2 })
  }, [latestRecords, isSummary, unitDef])

  const rentByRegion = useMemo(() => {
    if (isSummary) return averageByGroupForUnits(latestRecords, 'Regional_Filter', 'rent')
    return averageByGroupForField(latestRecords, 'Regional_Filter', unitDef.rent)
  }, [latestRecords, isSummary, unitDef])

  const psfByRegion = useMemo(() => {
    if (isSummary)
      return averageByGroupForUnits(latestRecords, 'Regional_Filter', 'psf', { round: 2 })
    return averageByGroupForField(latestRecords, 'Regional_Filter', unitDef.psf, { round: 2 })
  }, [latestRecords, isSummary, unitDef])

  const byDate = useMemo(() => countByDateFilter(records), [records])
  const occupancy = useMemo(() => occupancyByStabilisation(latestRecords), [latestRecords])

  const townRentSub = isSummary
    ? 'Overall average · £ pcm · Studio / 1 Bed / 2 Bed / 3 Bed'
    : `${unitDef.label} · £ pcm · ${rentByTown.length.toLocaleString('en-GB')} town${
        rentByTown.length === 1 ? '' : 's'
      }`
  const townPsfSub = isSummary
    ? 'Overall average · £ psf · Studio / 1 Bed / 2 Bed / 3 Bed'
    : `${unitDef.label} · £ psf · ${psfByTown.length.toLocaleString('en-GB')} town${
        psfByTown.length === 1 ? '' : 's'
      }`
  const regionRentSub = isSummary
    ? 'All unit types · £ pcm · grouped by region'
    : `${unitDef.label} · £ pcm`
  const regionPsfSub = isSummary
    ? 'All unit types · £ psf · grouped by region'
    : `${unitDef.label} · £ psf`

  return (
    <div className="tab-panel analysis-panel">
      <div className="analysis-toolbar">
        <span className="analysis-toolbar__label">Unit type</span>
        <UnitToggle value={unit} onChange={setUnit} />
        {basisLabel && (
          <span
            className={`analysis-basis${
              basisLabel.includes('selected') ? ' analysis-basis--selected' : ''
            }`}
          >
            {basisLabel}
          </span>
        )}
      </div>

      <div className="analysis-grid">
        <ChartCard
          title={isSummary ? 'Average rent by unit type' : 'Average rent by town'}
          subtitle={townRentSub}
          className="col-span-2"
          empty={rentByTown.length === 0}
        >
          {isSummary ? (
            <SummaryOverallBars data={rentByTown} fmt={money} />
          ) : (
            <HorizontalBars data={rentByTown} fmt={money} scroll />
          )}
        </ChartCard>

        <ChartCard
          title={isSummary ? 'Average £ psf by unit type' : 'Average £ psf by town'}
          subtitle={townPsfSub}
          className="col-span-2"
          empty={psfByTown.length === 0}
        >
          {isSummary ? (
            <SummaryOverallBars data={psfByTown} fmt={psf} />
          ) : (
            <HorizontalBars data={psfByTown} fmt={psf} scroll />
          )}
        </ChartCard>

        <ChartCard
          title="Records by date"
          subtitle="Count per Date filter (oldest → newest)"
          className="col-span-2"
          empty={byDate.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDate} margin={{ top: 14, right: 12, bottom: 46, left: 4 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis
                dataKey="name"
                angle={-30}
                textAnchor="end"
                height={56}
                interval={0}
                tick={axisTick}
                stroke={CHART.axis}
              />
              <YAxis allowDecimals={false} tick={axisTick} stroke={CHART.axis} width={30} />
              <Tooltip
                cursor={{ fill: 'rgba(255,223,0,0.10)' }}
                formatter={(v) => [v, 'Records']}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={CHART.primary} maxBarSize={40}>
                <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: CHART.axisText }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average rent by region"
          subtitle={regionRentSub}
          className="col-span-2"
          empty={rentByRegion.length === 0}
        >
          {isSummary ? (
            <SummaryGroupedBars data={rentByRegion} fmt={money} />
          ) : (
            <HorizontalBars data={rentByRegion} fmt={money} />
          )}
        </ChartCard>

        <ChartCard
          title="Average £ psf by region"
          subtitle={regionPsfSub}
          className="col-span-2"
          empty={psfByRegion.length === 0}
        >
          {isSummary ? (
            <SummaryGroupedBars data={psfByRegion} fmt={psf} />
          ) : (
            <HorizontalBars data={psfByRegion} fmt={psf} />
          )}
        </ChartCard>

        <ChartCard
          title="Occupancy by stabilisation status"
          subtitle="Average occupancy · stabilised vs not"
          className="col-span-2"
          empty={occupancy.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupancy} margin={{ top: 16, right: 12, bottom: 8, left: 4 }}>
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="name" tick={catTick} stroke={CHART.axis} interval={0} />
              <YAxis
                tickFormatter={percent}
                domain={[0, 1]}
                tick={axisTick}
                stroke={CHART.axis}
                width={44}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,223,0,0.10)' }}
                formatter={(v, _n, p) => [
                  `${percent(v)}  ·  ${p?.payload?.count ?? 0} schemes`,
                  'Avg occupancy',
                ]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={90}>
                {occupancy.map((d) => (
                  <Cell
                    key={d.name}
                    fill={d.name === 'Stabilised' ? CHART.accent : CHART.primaryMid}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={percent}
                  style={{ fontSize: 12, fill: CHART.categoryText, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
