import { computed, ref, watch } from 'vue'
import { Howl, Howler } from 'howler'
import { stations } from '@/data/stations'
import { useNowPlaying } from './useNowPlaying'
import { useWakeLock } from './useWakeLock'
import { useRecents } from './useRecents'

// Module-level singletons. The audio player is app-wide state by nature
// (playing one stream at a time) so multiple components share the same refs.

const STATE_KEY = 'iradio:state'
function loadStored() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {} } catch { return {} }
}
const stored = loadStored()

const sound = ref(null)
const status = ref('idle') // 'idle' | 'loading' | 'playing' | 'error'
const errorMessage = ref('')
const currentStation = ref(null)
const volume = ref(typeof stored.volume === 'number' ? stored.volume : 50)
const muted = ref(!!stored.muted)
const lastPlayedName = ref(stored.lastStation || null)

// Persist volume/muted/lastStation as a single blob — they're cheap and they
// always persist together.
function persistState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      volume: volume.value,
      muted: muted.value,
      lastStation: lastPlayedName.value
    }))
  } catch { /* private mode / quota */ }
}

const isPlaying = computed(() => status.value === 'playing')
const isLoading = computed(() => status.value === 'loading')
const hasError = computed(() => status.value === 'error')

const nowPlaying = useNowPlaying()
const wakeLock = useWakeLock()
const { recordRecent } = useRecents()

function applyVolume() {
  Howler.volume(volume.value / 100)
  Howler.mute(muted.value)
}

function teardownAudio() {
  if (sound.value) {
    sound.value.unload()
    sound.value = null
  }
  status.value = 'idle'
  errorMessage.value = ''
}

function setMediaSession(station) {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new window.MediaMetadata({
    title: station.name,
    artist: 'רדיו ישראלי',
    album: 'iradio',
    artwork: station.logo ? [{ src: station.logo, sizes: '512x512', type: 'image/jpeg' }] : []
  })
  navigator.mediaSession.setActionHandler('play', () => sound.value?.play())
  navigator.mediaSession.setActionHandler('pause', () => sound.value?.pause())
  navigator.mediaSession.setActionHandler('stop', stop)
  navigator.mediaSession.setActionHandler('previoustrack', prevStation)
  navigator.mediaSession.setActionHandler('nexttrack', nextStation)
}
function clearMediaSession() {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
  for (const a of ['play', 'pause', 'stop', 'previoustrack', 'nexttrack']) {
    try { navigator.mediaSession.setActionHandler(a, null) } catch { /* unsupported */ }
  }
}
function updateMediaSessionTitle(station, title) {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.metadata) return
  navigator.mediaSession.metadata = new window.MediaMetadata({
    title,
    artist: station.name,
    album: 'iradio',
    artwork: station.logo ? [{ src: station.logo, sizes: '512x512', type: 'image/jpeg' }] : []
  })
}

function setStation(i) {
  // Toggle off when clicking the active station while it's busy.
  if (currentStation.value === i && (isPlaying.value || isLoading.value)) {
    return stop()
  }

  if (sound.value) {
    sound.value.unload()
    sound.value = null
  }

  currentStation.value = i
  status.value = 'loading'
  errorMessage.value = ''
  nowPlaying.stop()

  const station = stations[i]
  const howl = new Howl({ src: station.src, html5: true, format: ['mp3', 'aac', 'aacp'] })

  howl.on('play', () => {
    status.value = 'playing'
    lastPlayedName.value = station.name
    recordRecent(station.name)
    persistState()
    wakeLock.request()
    nowPlaying.start(station, (title) => updateMediaSessionTitle(station, title))
  })
  howl.on('loaderror', () => {
    status.value = 'error'
    errorMessage.value = 'שגיאת חיבור'
    wakeLock.release()
  })
  howl.on('playerror', () => {
    status.value = 'error'
    errorMessage.value = 'שגיאת השמעה'
    wakeLock.release()
  })

  sound.value = howl
  applyVolume()
  howl.play()
  setMediaSession(station)
}

function stop() {
  teardownAudio()
  currentStation.value = null
  clearMediaSession()
  wakeLock.release()
  nowPlaying.stop()
}

function toggleMute() {
  muted.value = !muted.value
  applyVolume()
}

function toggleCurrent() {
  if (currentStation.value !== null) setStation(currentStation.value)
}

function nextStation() {
  if (currentStation.value === null) return
  setStation((currentStation.value + 1) % stations.length)
}
function prevStation() {
  if (currentStation.value === null) return
  setStation((currentStation.value - 1 + stations.length) % stations.length)
}

function shareCurrent() {
  if (currentStation.value === null) return
  const station = stations[currentStation.value]
  const text = `מאזין ל${station.name} ב-iradio`
  if (navigator.share) {
    navigator.share({ title: station.name, text, url: location.href }).catch(() => {})
  } else {
    navigator.clipboard?.writeText(`${text} - ${location.href}`).catch(() => {})
  }
}

// Browsers auto-release wake locks when the tab becomes hidden — re-request
// when it comes back if we're still playing.
function onVisibilityChange() {
  if (document.visibilityState === 'visible' && isPlaying.value && !wakeLock.isActive.value) {
    wakeLock.request()
  }
}

let visibilityHandlerInstalled = false
function ensureVisibilityHandler() {
  if (visibilityHandlerInstalled) return
  document.addEventListener('visibilitychange', onVisibilityChange)
  visibilityHandlerInstalled = true
}

watch(volume, () => { applyVolume(); persistState() })
watch(muted, persistState)

export function useAudioPlayer() {
  ensureVisibilityHandler()
  applyVolume()
  return {
    sound,
    status,
    errorMessage,
    currentStation,
    volume,
    muted,
    lastPlayedName,
    isPlaying,
    isLoading,
    hasError,
    nowPlayingTitle: nowPlaying.title,
    setStation,
    stop,
    toggleMute,
    toggleCurrent,
    nextStation,
    prevStation,
    shareCurrent
  }
}
