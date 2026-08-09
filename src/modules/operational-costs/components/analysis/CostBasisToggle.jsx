import { ANALYSIS_BASES } from '../../config/costCategories'

export default function CostBasisToggle({ value, onChange }) {
  return (
    <div className="segmented" role="group" aria-label="Cost basis">
      {ANALYSIS_BASES.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`segmented__btn${value === opt.id ? ' is-active' : ''}`}
          aria-pressed={value === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
