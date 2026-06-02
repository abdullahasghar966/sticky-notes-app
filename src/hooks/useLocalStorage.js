import { useCallback, useEffect, useRef, useState } from 'react'
import { isStorageAvailable, readJSON, writeJSON } from '../utils/storage'

// ──────────────────────────────────────────────────────────────
// useLocalStorage — generic, reusable, error-safe persisted state.
//
// Mirrors useState's API: returns [value, setValue]. The third tuple
// member reports whether persistence is actually available, so the UI
// can warn the user in private-browsing / locked-down contexts.
//
//   const [theme, setTheme, { available }] = useLocalStorage('theme', 'dark')
// ──────────────────────────────────────────────────────────────
export function useLocalStorage(key, initialValue) {
  // Probe once per mount — cheap and stable.
  const available = useRef(isStorageAvailable()).current

  const [value, setValue] = useState(() =>
    available ? readJSON(key, resolveInitial(initialValue)) : resolveInitial(initialValue),
  )

  // Persist on every change. No-op (but never throws) when unavailable.
  useEffect(() => {
    if (!available) return
    writeJSON(key, value)
  }, [key, value, available])

  // Stable setter supporting both values and updater functions.
  const set = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next))
  }, [])

  return [value, set, { available }]
}

function resolveInitial(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue
}
