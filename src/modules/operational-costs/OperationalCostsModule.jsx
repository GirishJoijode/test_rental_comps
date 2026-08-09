import { useMemo, useState } from 'react'
import { ErrorMessage, Loading } from '../../components/common/States'
import Tabs from '../../components/common/Tabs'
import ModuleSwitcher from '../ModuleSwitcher'
import AnalysisTab from './components/analysis/AnalysisTab'
import DashboardTab from './components/DashboardTab'
import SchemeDetailModal from './components/detail/SchemeDetailModal'
import { DEFAULT_ANALYSIS_BASIS } from './config/costCategories'
import { operationalCostsMeta } from './meta'
import { useOperationalCosts } from './hooks/useOperationalCosts'
import {
  applyFilters,
  buildCascadingOptions,
  EMPTY_FILTERS,
  hasAnyFilterSelection,
  sanitizeFilters,
} from './utils/filters'
import { buildSummary } from './utils/summary'
import { recordIdentity } from './utils/indexRecords'

export default function OperationalCostsModule({ activeModuleId, onModuleChange }) {
  const { status, records, indexes, error, reload } = useOperationalCosts({ enabled: true })

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [tab, setTab] = useState('dashboard')
  const [activeSchemeRecord, setActiveSchemeRecord] = useState(null)
  const [analysisBasis, setAnalysisBasis] = useState(DEFAULT_ANALYSIS_BASIS)

  const options = useMemo(
    () => buildCascadingOptions(records, filters, search),
    [records, filters, search]
  )
  const filtered = useMemo(
    () => applyFilters(records, filters, search),
    [records, filters, search]
  )
  const summary = useMemo(() => buildSummary(filtered), [filtered])

  const isFiltering = search.trim() !== '' || hasAnyFilterSelection(filters)
  const hasSelection = selectedIds.size > 0

  // Selected → Filtered/Search → All
  const analysisRecords = useMemo(
    () =>
      hasSelection ? records.filter((r) => selectedIds.has(r.Id)) : filtered,
    [records, filtered, selectedIds, hasSelection]
  )

  const openSchemeRecord = (rec) => {
    // Always open on the clicked evidence record (year / Actual-Forecast).
    setActiveSchemeRecord(rec)
  }

  const handleFilterChange = (key, value) =>
    setFilters((prev) => sanitizeFilters({ ...prev, [key]: value }))

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setSearch('')
  }

  const toggleRow = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds((prev) => {
      const allSelected = filtered.length > 0 && filtered.every((r) => prev.has(r.Id))
      return allSelected ? new Set() : new Set(filtered.map((r) => r.Id))
    })

  const selectAllFiltered = () => setSelectedIds(new Set(filtered.map((r) => r.Id)))
  const clearSelection = () => setSelectedIds(new Set())

  const statusText =
    status === 'ready'
      ? `${records.length.toLocaleString('en-GB')} records · ${
          indexes?.schemeCount?.toLocaleString('en-GB') ?? 0
        } schemes · live from Ninox`
      : status === 'loading'
        ? 'Loading…'
        : status === 'idle'
          ? 'Ready to load'
          : 'Connection error'

  return (
    <div className="app">
      <header className="app-header">
        <ModuleSwitcher
          activeModuleId={activeModuleId}
          onModuleChange={onModuleChange}
          title={operationalCostsMeta.title}
          subtitle={operationalCostsMeta.subtitle}
        />

        <Tabs
          tabs={operationalCostsMeta.tabs}
          active={tab}
          onChange={setTab}
          disabled={status !== 'ready'}
        />

        <div className="app-header__status">
          <span className="status-dot" aria-hidden="true" />
          {statusText}
        </div>
      </header>

      <main className="app-main">
        {status === 'loading' && <Loading message="Loading operational costs…" />}
        {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}

        {status === 'ready' && tab === 'dashboard' && (
          <DashboardTab
            records={filtered}
            summary={summary}
            options={options}
            filters={filters}
            search={search}
            selectedIds={selectedIds}
            onFilterChange={handleFilterChange}
            onSearchChange={setSearch}
            onReset={handleReset}
            onSelectAll={selectAllFiltered}
            onClearSelection={clearSelection}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={openSchemeRecord}
          />
        )}

        {status === 'ready' && tab === 'analysis' && (
          <AnalysisTab
            records={analysisRecords}
            selected={hasSelection}
            filtered={isFiltering}
            basis={analysisBasis}
            onBasisChange={setAnalysisBasis}
          />
        )}
      </main>

      {activeSchemeRecord && (
        <SchemeDetailModal
          key={recordIdentity(activeSchemeRecord)}
          seedRecord={activeSchemeRecord}
          indexes={indexes}
          preferSeed
          onClose={() => setActiveSchemeRecord(null)}
        />
      )}
    </div>
  )
}
