// -----------------------------------------------------------------------------
// OpEx cost category mappings (labels + JSON field keys by basis)
// -----------------------------------------------------------------------------

export const COST_BASES = [
  { id: 'flat', label: '£ / Flat' },
  { id: 'sqft', label: '£ / Sq Ft' },
  { id: 'total', label: '£ Total' },
]

export const DEFAULT_COST_BASIS = 'flat'

/** Analysis tab cost-basis modes (Summary + per-unit bases). */
export const ANALYSIS_BASES = [
  { id: 'summary', label: 'Summary' },
  { id: 'flat', label: '£ / Flat' },
  { id: 'sqft', label: '£ / Sq Ft' },
]

export const DEFAULT_ANALYSIS_BASIS = 'summary'

export function opexValueField(basis) {
  return basis === 'sqft' ? 'Total_Expenditure_Per_SqFt' : 'Total_Expenditure_Per_Flat'
}

export function opexExclMgmtField(basis) {
  return basis === 'sqft' ? 'Cost_Exc_ManFee_Per_SqFt' : 'Cost_Exc_ManFee_Per_Flat'
}

/** Primary OpEx categories for the breakdown visual. */
export const OPEX_CATEGORIES = [
  {
    id: 'staff',
    label: 'Staff / Office',
    color: '#25273A',
    total: 'Staff_Office',
    flat: 'Staff_Office_Per_Flat',
    sqft: 'Staff_Office_Per_SqFt',
  },
  {
    id: 'building',
    label: 'Building Operational',
    color: '#3B5F8A',
    total: 'Building_Operational',
    flat: 'Building_Operational_Per_Flat',
    sqft: 'Building_Operational_Per_SqFt',
  },
  {
    id: 'amenity',
    label: 'Amenity Operational',
    color: '#6B8A9E',
    total: 'Amenity_Operational',
    flat: 'Amenity_Operational_Per_Flat',
    sqft: 'Amenity_Operational_Per_SqFt',
  },
  {
    id: 'tenancy',
    label: 'Tenancy Operational',
    color: '#8FA3B8',
    total: 'Tenancy_Operational',
    flat: 'Tenancy_Operational_Per_Flat',
    sqft: 'Tenancy_Operational_Per_SqFt',
  },
  {
    id: 'marketing',
    label: 'Marketing / Leasing',
    color: '#B8973F',
    total: 'Marketing_Leasing',
    flat: 'Marketing_Leasing_Per_Flat',
    sqft: 'Marketing_Leasing_Per_SqFt',
  },
  {
    id: 'other',
    label: 'Other / Ground Rent',
    color: '#8B7355',
    total: 'Other_Inc_Ground_Rent',
    flat: 'Other_Inc_Ground_Rent_Per_Flat',
    sqft: 'Other_Inc_Ground_Rent_Per_SqFt',
  },
  {
    id: 'mgmt',
    label: 'Management Fee',
    color: '#C4A21A',
    total: 'Mgt_Fee',
    flat: 'Mgt_Fee_Per_Flat',
    sqft: 'Mgt_Fee_Per_SqFt',
  },
]

/** Secondary building operational line items. */
export const BUILDING_DETAIL_ITEMS = [
  {
    label: 'Insurance',
    flat: 'Bldg_Insurance_Per_Flat',
    sqft: 'Bldg_Insurance_Per_SqFt',
  },
  {
    label: 'Cleaning',
    flat: 'Bldg_Cleaning_Per_Flat',
    sqft: 'Bldg_Cleaning_Per_SqFt',
  },
  {
    label: 'Estate',
    flat: 'Bldg_Estate_Per_Flat',
    sqft: 'Bldg_Estate_Per_SqFt',
  },
  {
    label: 'Common parts',
    flat: 'Bldg_CommonParts_Per_Flat',
    sqft: 'Bldg_CommonParts_Per_SqFt',
  },
  {
    label: 'M&E',
    flat: 'Bldg_ME_Per_Flat',
    sqft: 'Bldg_ME_Per_SqFt',
  },
  {
    label: 'Health & safety',
    flat: 'Bldg_HealthSafety_Per_Flat',
    sqft: 'Bldg_HealthSafety_Per_SqFt',
  },
  {
    label: 'Other',
    flat: 'Bldg_Other_Per_Flat',
    sqft: 'Bldg_Other_Per_SqFt',
  },
]

export function fieldForBasis(category, basis) {
  if (basis === 'sqft') return category.sqft
  if (basis === 'total') return category.total
  return category.flat
}
