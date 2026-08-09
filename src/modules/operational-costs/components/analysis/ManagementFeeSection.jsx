import { useMemo } from 'react'
import { buildMgmtFeeBasisRows, buildMgmtFeePctRows } from '../../utils/analysis'
import PercentSchemeChart from './PercentSchemeChart'
import SchemeMetricChart from './SchemeMetricChart'

export default function ManagementFeeSection({ records, basis, onSchemeClick }) {
  const pctRows = useMemo(() => buildMgmtFeePctRows(records), [records])
  const basisRows = useMemo(
    () => buildMgmtFeeBasisRows(records, basis),
    [records, basis]
  )
  const basisLabel = basis === 'sqft' ? '£ / Sq Ft' : '£ / Flat'

  return (
    <>
      <PercentSchemeChart
        title="Management Fee % of Income"
        subtitle="Primary cross-scheme management fee comparison"
        data={pctRows}
        valueLabel="Mgmt fee % of income"
        onSchemeClick={onSchemeClick}
        className="col-span-3"
      />
      <SchemeMetricChart
        title={`Management Fee ${basisLabel}`}
        subtitle="Absolute fee level on the selected cost basis"
        data={basisRows}
        basis={basis}
        valueLabel={`Management Fee ${basisLabel}`}
        onSchemeClick={onSchemeClick}
        className="col-span-3"
      />
    </>
  )
}
