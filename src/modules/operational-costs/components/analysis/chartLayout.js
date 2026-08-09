import { useEffect, useRef, useState } from 'react'

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

export function useViewportHeight() {
  const ref = useRef(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect?.height
      if (Number.isFinite(h)) setHeight(h)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, height]
}

/** Shared bar proportions for sparse vs dense category sets. */
export function horizontalBarLayout(count, { stacked = false } = {}) {
  const n = Math.max(count, 1)
  const maxBarSize = stacked
    ? clamp(Math.round(44 - (n - 1) * 2.2), 14, 40)
    : clamp(Math.round(52 - (n - 1) * 3.2), 16, 48)
  const barCategoryGap =
    n <= 1 ? '16%' : n <= 2 ? '12%' : n <= 4 ? '9%' : n <= 8 ? '7%' : '5%'
  const rowBand = clamp(maxBarSize + (stacked ? 18 : 12), 28, 58)
  return { maxBarSize, barCategoryGap, rowBand }
}

export function verticalBarLayout(count) {
  const n = Math.max(count, 1)
  const maxBarSize = clamp(Math.round(72 - (n - 1) * 6), 28, 72)
  const barCategoryGap =
    n <= 1 ? '28%' : n <= 2 ? '22%' : n <= 4 ? '16%' : n <= 6 ? '12%' : '8%'
  return { maxBarSize, barCategoryGap }
}
