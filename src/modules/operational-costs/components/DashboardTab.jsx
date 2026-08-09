import FilterPanel from './FilterPanel'
import OperationalCostsTable from './OperationalCostsTable'
import SummaryCards from './SummaryCards'

export default function DashboardTab({
  records,
  summary,
  options,
  filters,
  search,
  selectedIds,
  onFilterChange,
  onSearchChange,
  onReset,
  onSelectAll,
  onClearSelection,
  onToggleRow,
  onToggleAll,
  onRowClick,
}) {
  return (
    <div className="tab-panel dashboard-panel">
      <SummaryCards summary={summary} />
      <FilterPanel
        options={options}
        filters={filters}
        search={search}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
        onReset={onReset}
        onSelectAll={onSelectAll}
        onClearSelection={onClearSelection}
        resultCount={records.length}
        selectedCount={selectedIds.size}
      />
      <OperationalCostsTable
        records={records}
        selectedIds={selectedIds}
        onToggleRow={onToggleRow}
        onToggleAll={onToggleAll}
        onRowClick={onRowClick}
      />
    </div>
  )
}
