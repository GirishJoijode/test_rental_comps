import {
  formatCurrencyFlat,
  formatCurrencySqFt,
  formatNumber,
} from '../utils/formatters'

export default function SummaryCards({ summary }) {
  const cards = [
    {
      label: 'Total records',
      value: formatNumber(summary.total) || '0',
    },
    {
      label: 'Unique schemes',
      value: formatNumber(summary.schemes) || '0',
    },
    {
      label: 'Average OpEx / flat',
      value:
        summary.avgTotalExpPerFlat == null
          ? '—'
          : formatCurrencyFlat(summary.avgTotalExpPerFlat),
    },
    {
      label: 'Average OpEx / sq ft',
      value:
        summary.avgTotalExpPerSqFt == null
          ? '—'
          : formatCurrencySqFt(summary.avgTotalExpPerSqFt),
    },
  ]

  return (
    <section className="summary-grid" aria-label="Summary statistics">
      {cards.map((card) => (
        <div className="summary-card" key={card.label}>
          <span className="summary-card__value">{card.value}</span>
          <span className="summary-card__label">{card.label}</span>
        </div>
      ))}
    </section>
  )
}
