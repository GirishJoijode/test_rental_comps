import RentalCompsModule from './RentalCompsModule'
import { rentalCompsMeta } from './meta'

export const rentalCompsModule = {
  ...rentalCompsMeta,
  Component: RentalCompsModule,
}
