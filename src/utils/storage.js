// ──────────────────────────────────────────────────────────────
// storage.js — centralised, defensive localStorage access.
// Every read/write is wrapped so corrupted data or a locked-down
// browser (private mode, disabled storage) can never crash the app.
// ──────────────────────────────────────────────────────────────

// Feature-detect real, writable storage (private mode can throw on write).
export function isStorageAvailable() {
  try {
    const probe = '__sticky_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

// Read + parse JSON. On corruption, wipe the bad key and fall back.
export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[storage] Corrupted value at "${key}" — resetting.`, err)
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* nothing we can do */
    }
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`[storage] Could not persist "${key}".`, err)
    return false
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}
