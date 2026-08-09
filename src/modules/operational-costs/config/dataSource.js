// -----------------------------------------------------------------------------
// Operational Costs Ninox data source
// -----------------------------------------------------------------------------

const DEFAULT_NINOX_URL =
  'https://savills.ninoxdb.com/share/0zm8cap99olxtvo4o68ikjb0esrv0409ane3?locale=en-gb&utcoffset=60'

export const OPERATIONAL_COSTS_NINOX_URL =
  import.meta.env.VITE_OPERATIONAL_COSTS_NINOX_URL || DEFAULT_NINOX_URL
