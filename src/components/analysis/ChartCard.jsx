// Consistent card shell for every analysis chart.
export default function ChartCard({
  title,
  subtitle,
  className = '',
  empty,
  emptyMessage = 'No data for the current selection.',
  actions,
  children,
}) {
  return (
    <div className={`panel chart-card ${className}`}>
      <div className="panel__head">
        <div className="panel__head-main">
          <h3 className="panel__title">{title}</h3>
          {subtitle && <span className="panel__subtitle">{subtitle}</span>}
        </div>
        {actions}
      </div>
      <div className="panel__body chart-card__body">
        {empty ? <div className="chart-empty">{emptyMessage}</div> : children}
      </div>
    </div>
  )
}
