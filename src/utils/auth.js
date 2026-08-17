// -----------------------------------------------------------------------------
// Lightweight frontend auth gate (prototype access restriction).
// Stores only an absolute expiry timestamp — never the password itself.
// Expected credential is a SHA-256 hex hash from VITE_APP_PASSWORD_HASH.
// -----------------------------------------------------------------------------

export const AUTH_STORAGE_KEY = 'btrAnalyticsAuthExpiry'

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000

function getExpectedPasswordHash() {
  const hash = import.meta.env.VITE_APP_PASSWORD_HASH
  if (!hash || typeof hash !== 'string' || !hash.trim()) {
    throw new Error(
      'Missing required environment variable: VITE_APP_PASSWORD_HASH. ' +
        'Set it in .env.local for local development, or as a GitHub Actions secret for production builds.',
    )
  }
  return hash.trim().toLowerCase()
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

/** Returns true when the SHA-256 of `input` matches VITE_APP_PASSWORD_HASH. */
export async function verifyPassword(input) {
  if (typeof input !== 'string' || input === '') return false
  const expected = getExpectedPasswordHash()
  const enteredHash = await sha256Hex(input)
  return enteredHash === expected
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
