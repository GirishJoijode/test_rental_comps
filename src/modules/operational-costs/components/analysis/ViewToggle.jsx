export default function ViewToggle({ value, onChange, label = 'Chart or table' }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      <button
        type="button"
        className={`segmented__btn${value === 'chart' ? ' is-active' : ''}`}
        aria-pressed={value === 'chart'}
        onClick={() => onChange('chart')}
      >
        Chart
      </button>
      <button
        type="button"
        className={`segmented__btn${value === 'table' ? ' is-active' : ''}`}
        aria-pressed={value === 'table'}
        onClick={() => onChange('table')}
      >
        Table
      </button>
    </div>
  )
}
