// -----------------------------------------------------------------------------
// Operational Costs Ninox data source
// -----------------------------------------------------------------------------
// URL comes from Vite env only (never commit real share URLs):
//   Local:  .env.local → VITE_OPERATIONAL_COSTS_URL
//   CI:     GitHub Actions secret → VITE_OPERATIONAL_COSTS_URL
// -----------------------------------------------------------------------------

const url = import.meta.env.VITE_OPERATIONAL_COSTS_URL

if (!url || typeof url !== 'string' || !url.trim()) {
  throw new Error(
    'Missing required environment variable: VITE_OPERATIONAL_COSTS_URL. ' +
      'Set it in .env.local for local development, or as a GitHub Actions secret for production builds.',
  )
}

export const OPERATIONAL_COSTS_NINOX_URL = url.trim()
