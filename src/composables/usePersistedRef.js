import { ref, watch } from 'vue'

// Tiny localStorage-backed ref. Failures (private mode, quota) are silent so
// the app keeps working in-memory.
export function usePersistedRef(key, fallback) {
  let initial = fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw != null) initial = JSON.parse(raw)
  } catch { /* corrupt or unavailable */ }

  const r = ref(initial)
  watch(r, (v) => {
    try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* quota */ }
  }, { deep: true })
  return r
}
