import { computed, onUnmounted, ref, watch } from 'vue'

export function useSleepTimer({ onExpire } = {}) {
  const minutes = ref(0)
  const remaining = ref(0)
  let ticker = null

  function tearDownTicker() {
    if (ticker) {
      clearInterval(ticker)
      ticker = null
    }
  }

  function start(mins) {
    tearDownTicker()
    if (!mins) {
      remaining.value = 0
      return
    }
    remaining.value = mins * 60
    ticker = setInterval(() => {
      remaining.value--
      if (remaining.value <= 0) {
        tearDownTicker()
        minutes.value = 0
        onExpire?.()
      }
    }, 1000)
  }

  function snooze() {
    // Add 5 minutes to whatever's already on the clock without resetting it.
    if (remaining.value <= 0) return
    remaining.value += 5 * 60
  }

  watch(minutes, start)
  onUnmounted(tearDownTicker)

  const label = computed(() => {
    if (!remaining.value) return ''
    const m = Math.floor(remaining.value / 60)
    const s = remaining.value % 60
    return `${m}:${String(s).padStart(2, '0')}`
  })

  return { minutes, remaining, label, snooze }
}
