import { formatKpi } from './formatters'

export default function AnalysisKPIs({ cards, columns }) {
  const colClass =
    columns === 3
      ? 'opex-kpi-grid opex-kpi-grid--3'
      : columns === 4
        ? 'opex-kpi-grid opex-kpi-grid--4'
        : 'opex-kpi-grid opex-kpi-grid--8'

  return (
    <section className={colClass} aria-label="Core OpEx summary">
      {cards.map((card) => (
        <div className="summary-card opex-kpi-card" key={card.id || card.label}>
          <span className="summary-card__value">
            {formatKpi(card.value, card.format)}
          </span>
          <span className="summary-card__label">{card.label}</span>
        </div>
      ))}
    </section>
  )
}
