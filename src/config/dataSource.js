// -----------------------------------------------------------------------------
// Data source configuration — BTR Rental Comparables
// -----------------------------------------------------------------------------
// URL comes from Vite env only (never commit real share URLs):
//   Local:  .env.local → VITE_RENTAL_COMPS_URL
//   CI:     GitHub Actions secret → VITE_RENTAL_COMPS_URL
// -----------------------------------------------------------------------------

const url = import.meta.env.VITE_RENTAL_COMPS_URL

if (!url || typeof url !== 'string' || !url.trim()) {
  throw new Error(
    'Missing required environment variable: VITE_RENTAL_COMPS_URL. ' +
      'Set it in .env.local for local development, or as a GitHub Actions secret for production builds.',
  )
}

export const NINOX_URL = url.trim()
