import { ref } from 'vue'

// Wake Lock keeps the screen awake while audio is playing — important for
// listening at night or in the car when the page is in foreground. Browsers
// auto-release the lock when the tab is hidden, so callers should re-request
// on `visibilitychange`.
export function useWakeLock() {
  let lock = null
  const isActive = ref(false)

  async function request() {
    if (!('wakeLock' in navigator) || lock) return
    try {
      lock = await navigator.wakeLock.request('screen')
      isActive.value = true
      lock.addEventListener('release', () => {
        lock = null
        isActive.value = false
      })
    } catch { /* user denied or unsupported — no-op */ }
  }

  function release() {
    if (!lock) return
    lock.release().catch(() => { /* already released */ })
    lock = null
    isActive.value = false
  }

  return { isActive, request, release }
}
