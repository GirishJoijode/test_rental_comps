// -----------------------------------------------------------------------------
// useOperationalCosts — lazy-loads the Operational Costs Ninox JSON once per
// session, then serves the cached records + indexes on subsequent visits.
// -----------------------------------------------------------------------------
import { useCallback, useEffect, useState } from 'react'
import { OPERATIONAL_COSTS_NINOX_URL } from '../config/dataSource'
import { buildOperationalCostIndexes } from '../utils/indexRecords'

/** Session-level cache (survives module unmount / tab switches). */
let sessionCache = null

function normalizeRecords(data) {
  return data.map((rec, i) => ({
    ...rec,
    Id: rec?.Id ?? `oc-${i}-${rec?.Scheme ?? 'row'}-${rec?.Year ?? ''}`,
  }))
}

async function fetchOperationalCosts() {
  const res = await fetch(OPERATIONAL_COSTS_NINOX_URL, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Request failed (HTTP ${res.status} ${res.statusText})`)
  }
  const data = await res.json()
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response format: expected a JSON array.')
  }
  return normalizeRecords(data)
}

/**
 * @param {{ enabled?: boolean }} options
 *   enabled — when false, no network request is made (idle until first visit).
 * @returns {{ status, records, indexes, error, reload }}
 *   status: 'idle' | 'loading' | 'ready' | 'error'
 */
export function useOperationalCosts({ enabled = false } = {}) {
  const [status, setStatus] = useState(() =>
    sessionCache ? 'ready' : enabled ? 'loading' : 'idle'
  )
  const [records, setRecords] = useState(() => sessionCache?.records ?? [])
  const [indexes, setIndexes] = useState(() => sessionCache?.indexes ?? null)
  const [error, setError] = useState('')

  const applyCache = useCallback((cache) => {
    setRecords(cache.records)
    setIndexes(cache.indexes)
    setStatus('ready')
    setError('')
  }, [])

  const reload = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = await fetchOperationalCosts()
      const next = {
        records: data,
        indexes: buildOperationalCostIndexes(data),
      }
      sessionCache = next
      applyCache(next)
    } catch (err) {
      setError(err?.message || 'Unknown error')
      setStatus('error')
    }
  }, [applyCache])

  useEffect(() => {
    if (!enabled) return

    if (sessionCache) {
      applyCache(sessionCache)
      return
    }

    let cancelled = false
    ;(async () => {
      setStatus('loading')
      setError('')
      try {
        const data = await fetchOperationalCosts()
        if (cancelled) return
        const next = {
          records: data,
          indexes: buildOperationalCostIndexes(data),
        }
        sessionCache = next
        applyCache(next)
      } catch (err) {
        if (cancelled) return
        setError(err?.message || 'Unknown error')
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, applyCache])

  return { status, records, indexes, error, reload }
}
