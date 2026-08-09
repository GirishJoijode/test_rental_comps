// -----------------------------------------------------------------------------
// Lightweight frontend auth gate (prototype access restriction).
// Stores only an absolute expiry timestamp — never the password itself.
// -----------------------------------------------------------------------------

export const AUTH_STORAGE_KEY = 'btrAnalyticsAuthExpiry'

const ACCESS_PASSWORD = 'Operational123Savills'
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000

export function verifyPassword(input) {
  return input === ACCESS_PASSWORD
}

export function isAuthenticated() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw == null || raw === '') return false
    const expiry = Number(raw)
    if (!Number.isFinite(expiry) || Date.now() >= expiry) {
      clearAuthentication()
      return false
    }
    return true
  } catch {
    return false
  }
}

/** Persist a fresh 15-day window from the moment of successful login. */
export function persistAuthentication() {
  const expiry = Date.now() + FIFTEEN_DAYS_MS
  localStorage.setItem(AUTH_STORAGE_KEY, String(expiry))
  return expiry
}

export function clearAuthentication() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}
