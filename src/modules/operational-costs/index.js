import OperationalCostsModule from './OperationalCostsModule'
import { operationalCostsMeta } from './meta'

export const operationalCostsModule = {
  ...operationalCostsMeta,
  Component: OperationalCostsModule,
}
