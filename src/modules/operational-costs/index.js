import { lazy } from 'react'
import { operationalCostsMeta } from './meta'

// Lazy-load the Op Costs module so the default Rental Comparables startup
// bundle does not pull in Op Costs dashboard/analysis code.
export const operationalCostsModule = {
  ...operationalCostsMeta,
  Component: lazy(() => import('./OperationalCostsModule')),
}
