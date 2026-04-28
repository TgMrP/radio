import { ref } from 'vue'

const POLL_MS = 30_000

// Fetches the current song/program from the /api/now-playing Edge Function and
// keeps polling every 30s while a station is active.
export function useNowPlaying() {
  const title = ref('')
  let timer = null
  let activeStation = null

  async function fetchOnce(station, onUpdate) {
    try {
      const r = await fetch(`/api/now-playing?url=${encodeURIComponent(station.src)}`)
      if (!r.ok) return
      const data = await r.json()
      if (data?.title && data.title !== title.value) {
        title.value = data.title
        onUpdate?.(data.title)
      }
    } catch { /* offline / API down — keep last value */ }
  }

  function start(station, onUpdate) {
    stop()
    activeStation = station
    fetchOnce(station, onUpdate)
    timer = setInterval(() => fetchOnce(activeStation, onUpdate), POLL_MS)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    activeStation = null
    title.value = ''
  }

  return { title, start, stop }
}
