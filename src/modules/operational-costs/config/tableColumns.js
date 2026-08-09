// -----------------------------------------------------------------------------
// Operational Costs main table columns (Dashboard comparison view)
// -----------------------------------------------------------------------------

export const COLUMNS = [
  { key: 'Scheme', label: 'Scheme', type: 'text', sticky: true },
  { key: 'Location', label: 'Location', type: 'text' },
  { key: 'Region', label: 'Region', type: 'text' },
  { key: 'Operator', label: 'Operator', type: 'text' },
  { key: 'Units', label: 'Units', type: 'number', align: 'right' },
  { key: 'Year_Completed', label: 'Year completed', type: 'year', align: 'right' },
  { key: 'Stabilised', label: 'Stabilised', type: 'bool' },
  { key: 'Actual_Or_Forecast', label: 'Actual / Forecast', type: 'text' },
  { key: 'Year', label: 'Year', type: 'year', align: 'right' },
  { key: 'Occupancy', label: 'Occupancy', type: 'percent', align: 'right' },
  {
    key: 'Cost_Exc_ManFee_Per_Flat',
    label: 'OpEx exc. mgmt fee / flat',
    type: 'currencyFlat',
    align: 'right',
  },
  {
    key: 'Cost_Exc_ManFee_Per_SqFt',
    label: 'OpEx exc. mgmt fee / sq ft',
    type: 'currencySqFt',
    align: 'right',
  },
  {
    key: 'Cost_Inc_ManFee_Per_Flat',
    label: 'OpEx inc. mgmt fee / flat',
    type: 'currencyFlat',
    align: 'right',
  },
  {
    key: 'Cost_Inc_ManFee_Per_SqFt',
    label: 'OpEx inc. mgmt fee / sq ft',
    type: 'currencySqFt',
    align: 'right',
  },
  { key: 'Leakage_Pct', label: 'Leakage %', type: 'percent', align: 'right' },
  {
    key: 'Mgt_Fee_Pct_Income',
    label: 'Mgmt fee % of income',
    type: 'percent',
    align: 'right',
  },
  {
    key: 'Total_Expenditure_Per_Flat',
    label: 'OpEx / flat',
    type: 'currencyFlat',
    align: 'right',
  },
  {
    key: 'Total_Expenditure_Per_SqFt',
    label: 'OpEx / sq ft',
    type: 'currencySqFt',
    align: 'right',
  },
]
