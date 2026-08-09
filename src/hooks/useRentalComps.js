// -----------------------------------------------------------------------------
// useRentalComps — fetches the live Ninox JSON on mount.
// Session cache avoids refetch when switching modules and returning.
// -----------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react'
import { NINOX_URL } from '../config/dataSource'

/** Session-level cache (survives module unmount). Cleared on full page reload. */
let sessionCache = null

async function fetchComps() {
  const res = await fetch(NINOX_URL, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Request failed (HTTP ${res.status} ${res.statusText})`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format: expected a JSON array.')
  }
  return data
}

// Returns { status, records, error, reload }.
//   status: 'loading' | 'ready' | 'error'
export function useRentalComps() {
  const [status, setStatus] = useState(() => (sessionCache ? 'ready' : 'loading'))
  const [records, setRecords] = useState(() => sessionCache?.records ?? [])
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = await fetchComps()
      sessionCache = { records: data }
      setRecords(data)
      setStatus('ready')
    } catch (err) {
      setError(err?.message || 'Unknown error')
      setStatus('error')
    }
  }, [])

  // Fetch on first visit; reuse session cache when returning from another module.
  useEffect(() => {
    if (sessionCache) {
      setRecords(sessionCache.records)
      setStatus('ready')
      return
    }
    reload()
  }, [reload])

  return { status, records, error, reload }
}
