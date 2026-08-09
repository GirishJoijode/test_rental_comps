// -----------------------------------------------------------------------------
// On-screen table column definitions
// -----------------------------------------------------------------------------
// Each column declares how its value is formatted (`type`) and how it sorts.
// `type` drives display formatting and blank/zero handling in the table.
// -----------------------------------------------------------------------------

// Dashboard table columns only. Unit rents / sizes / £psf are omitted here so
// the evidence browser stays concise — they remain in source data, Scheme
// popup, Analysis aggregations and XLSX export (see exportColumns.js).
export const COLUMNS = [
  { key: 'Scheme', label: 'Scheme', type: 'text', sticky: true },
  { key: 'Date_Filter', label: 'Date', type: 'text' },
  { key: 'Town', label: 'Town', type: 'text' },
  { key: 'PostCode', label: 'Postcode', type: 'text' },
  { key: 'Operator', label: 'Operator', type: 'text' },
  { key: 'Amenity_Grade', label: 'Amenity grade', type: 'text' },
  { key: 'Stabilised', label: 'Stabilised', type: 'bool' },
  { key: 'Occupancy', label: 'Occupancy', type: 'percent', align: 'right' },
  { key: 'Units', label: 'Units', type: 'number', align: 'right' },
  { key: 'Source', label: 'Source', type: 'text' },
  { key: 'Source_Verified', label: 'Verified', type: 'bool' },
  { key: 'Comments', label: 'Comments', type: 'text', wide: true },
]
