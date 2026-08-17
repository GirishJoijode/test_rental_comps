import { useMemo, useState } from 'react'
import AnalysisTab from '../../components/analysis/AnalysisTab'
import { ErrorMessage, Loading } from '../../components/common/States'
import Tabs from '../../components/common/Tabs'
import DashboardTab from '../../components/dashboard/DashboardTab'
import MapView from '../../components/map/MapView'
import SchemeDetailModal from '../../components/detail/SchemeDetailModal'
import { useRentalComps } from '../../hooks/useRentalComps'
import {
  applyFilters,
  buildCascadingOptions,
  EMPTY_FILTERS,
  hasAnyFilterSelection,
  sanitizeFilters,
} from '../../utils/filters'
import { groupByScheme } from '../../utils/dateUtils'
import { buildSummary } from '../../utils/analysis'
import { exportToXlsx } from '../../utils/exportXlsx'
import ModuleSwitcher from '../ModuleSwitcher'
import { rentalCompsMeta } from './meta'

export default function RentalCompsModule({
  activeModuleId,
  onModuleChange,
  logoutControl,
}) {
  const { status, records, error, reload } = useRentalComps()

  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [tab, setTab] = useState('dashboard')
  const [activeRecord, setActiveRecord] = useState(null)

  const options = useMemo(
    () => buildCascadingOptions(records, filters, search),
    [records, filters, search]
  )
  const filtered = useMemo(
    () => applyFilters(records, filters, search),
    [records, filters, search]
  )
  const schemeGroups = useMemo(() => groupByScheme(filtered), [filtered])
  const rows = useMemo(
    () => schemeGroups.map((entries) => entries[0]),
    [schemeGroups]
  )
  const summary = useMemo(() => buildSummary(filtered), [filtered])

  const isFiltering = search.trim() !== '' || hasAnyFilterSelection(filters)

  // Analysis-only derivation — skip work while Dashboard / Map are active.
  const analysisRecords = useMemo(() => {
    if (tab !== 'analysis') return null
    return selectedIds.size > 0
      ? records.filter((r) => selectedIds.has(r.Id))
      : filtered
  }, [tab, records, filtered, selectedIds])

  const analysisBasis =
    tab !== 'analysis'
      ? ''
      : selectedIds.size > 0
        ? `Analysis based on ${analysisRecords.length.toLocaleString('en-GB')} selected record${
            analysisRecords.length === 1 ? '' : 's'
          }`
        : isFiltering
          ? 'Analysis based on filtered records'
          : 'Analysis based on all records'

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
      const allSelected = rows.length > 0 && rows.every((r) => prev.has(r.Id))
      return allSelected ? new Set() : new Set(rows.map((r) => r.Id))
    })

  const selectAllFiltered = () => setSelectedIds(new Set(rows.map((r) => r.Id)))
  const clearSelection = () => setSelectedIds(new Set())

  const handleExport = () => {
    const out =
      selectedIds.size > 0 ? records.filter((r) => selectedIds.has(r.Id)) : rows
    exportToXlsx(out)
  }

  const statusText =
    status === 'ready'
      ? `${records.length.toLocaleString('en-GB')} records · live from Ninox`
      : status === 'loading'
        ? 'Loading…'
        : 'Connection error'

  return (
    <div className="app">
      <header className="app-header">
        <ModuleSwitcher
          activeModuleId={activeModuleId}
          onModuleChange={onModuleChange}
          title={rentalCompsMeta.title}
          subtitle={rentalCompsMeta.subtitle}
        />

        <Tabs
          tabs={rentalCompsMeta.tabs}
          active={tab}
          onChange={setTab}
          disabled={status !== 'ready'}
        />

        <div className="app-header__status">
          <span className="status-dot" aria-hidden="true" />
          {statusText}
          {logoutControl}
        </div>
      </header>

      <main className="app-main">
        {status === 'loading' && <Loading message="Loading live rental comparables…" />}
        {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}

        {status === 'ready' && tab === 'dashboard' && (
          <DashboardTab
            records={rows}
            summary={summary}
            options={options}
            filters={filters}
            search={search}
            selectedIds={selectedIds}
            onFilterChange={handleFilterChange}
            onSearchChange={setSearch}
            onReset={handleReset}
            onExport={handleExport}
            onSelectAll={selectAllFiltered}
            onClearSelection={clearSelection}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={setActiveRecord}
          />
        )}

        {status === 'ready' && tab === 'map' && (
          <MapView
            schemeGroups={schemeGroups}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onRowClick={setActiveRecord}
            onClearSelection={clearSelection}
          />
        )}

        {status === 'ready' && tab === 'analysis' && analysisRecords && (
          <AnalysisTab records={analysisRecords} basisLabel={analysisBasis} />
        )}
      </main>

      {activeRecord && (
        <SchemeDetailModal
          key={activeRecord.Id ?? `${activeRecord.Scheme}-${activeRecord.Date_Filter}`}
          record={activeRecord}
          allRecords={records}
          onClose={() => setActiveRecord(null)}
        />
      )}
    </div>
  )
}
