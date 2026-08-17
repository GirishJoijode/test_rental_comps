import { OPEX_CATEGORIES } from '../../config/costCategories'
import { formatBasisValue } from './formatters'

/** Full-width OpEx composition matrix. Consumes already-aggregated rows. */
export default function CompositionMatrix({ data, groupLabel, basis }) {
  const totalLabel = basis === 'sqft' ? 'Total OpEx / Sq Ft' : 'Total OpEx / Flat'

  if (!data.length) {
    return (
      <div className="chart-empty">
        Insufficient comparable records for {groupLabel} composition.
      </div>
    )
  }

  return (
    <div className="opex-matrix-wrap">
      <table className="data-table opex-matrix">
        <colgroup>
          <col className="opex-matrix__col-name" />
          {OPEX_CATEGORIES.map((cat) => (
            <col key={cat.id} className="opex-matrix__col-cat" />
          ))}
          <col className="opex-matrix__col-total" />
        </colgroup>
        <thead>
          <tr>
            <th className="is-sticky">{groupLabel}</th>
            {OPEX_CATEGORIES.map((cat) => (
              <th key={cat.id} className="is-center" title={cat.label}>
                {cat.label}
              </th>
            ))}
            <th className="is-center">{totalLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td className="is-sticky" title={row.name}>
                {row.name}
              </td>
              {OPEX_CATEGORIES.map((cat) => (
                <td key={cat.id} className="is-center">
                  {formatBasisValue(row[cat.id], basis)}
                </td>
              ))}
              <td className="is-center opex-matrix__total">
                {formatBasisValue(row.total, basis)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
