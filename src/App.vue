<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Howl, Howler } from 'howler'

import kan88Logo from '@/assets/kan88.png'
import kanBetLogo from '@/assets/kan_bet.png'
import kanGimelLogo from '@/assets/kan_gimel.png'
import kanTarbutLogo from '@/assets/kan_tarbut.svg'
import galatzLogo from '@/assets/galatz.png'
import glglzLogo from '@/assets/glglz.png'
import tlv102Logo from '@/assets/tlv102.jpg'
import eco99Logo from '@/assets/eco99.png'
import radius100Logo from '@/assets/radius100.png'
import fm103Logo from '@/assets/fm103.png'
import lev91Logo from '@/assets/lev91.png'
import haifaLogo from '@/assets/haifa.jpg'
import galeiIsraelLogo from '@/assets/galei_il.png'
import darom97Logo from '@/assets/darom97.png'
import kolchaiLogo from '@/assets/kolchai.png'

// All URLs verified live & HTTPS — browsers block mixed-content audio when the
// page is served over HTTPS.
const stations = [
  { name: 'כאן 88', logo: kan88Logo, src: 'https://29073.live.streamtheworld.com/KAN_88.mp3' },
  { name: 'כאן ב', logo: kanBetLogo, src: 'https://28563.live.streamtheworld.com/KAN_BET.mp3' },
  { name: 'כאן גימל', logo: kanGimelLogo, src: 'https://27873.live.streamtheworld.com/KAN_GIMMEL.mp3' },
  { name: 'כאן תרבות', logo: kanTarbutLogo, src: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KAN_TARBUT.mp3' },
  { name: 'גלי צה"ל', logo: galatzLogo, src: 'https://glzwizzlv.bynetcdn.com/glz_mp3' },
  { name: 'גלגל"צ', logo: glglzLogo, src: 'https://glzicylv01.bynetcdn.com/glglz_mp3' },
  { name: 'רדיו תל אביב 102', logo: tlv102Logo, src: 'https://102.livecdn.biz/102fm_mp3' },
  { name: 'אקו 99', logo: eco99Logo, src: 'https://eco-live.mediacast.co.il/99fm_aac' },
  { name: 'רדיוס 100FM', logo: radius100Logo, src: 'https://cdn.cybercdn.live/Radios_100FM/Audio/icecast.audio' },
  { name: 'רדיו ללא הפסקה 103FM', logo: fm103Logo, src: 'https://cdn.cybercdn.live/103FM/Live/icecast.audio' },
  { name: 'רדיו לב המדינה 91FM', logo: lev91Logo, src: 'https://cdn.cybercdn.live/Lev_Hamedina/Audio/icecast.audio' },
  { name: 'רדיו חיפה', logo: haifaLogo, src: 'https://1075.livecdn.biz/radiohaifa' },
  { name: 'גלי ישראל', logo: galeiIsraelLogo, src: 'https://cdn.cybercdn.live/Galei_Israel/Live/icecast.audio' },
  { name: 'רדיו דרום 97FM', logo: darom97Logo, src: 'https://cdn.cybercdn.live/Darom_97FM/Live/icecast.audio' },
  { name: 'קול חי 93FM', logo: kolchaiLogo, src: 'https://media2.93fm.co.il/live-new' }
]

const STATE_KEY = 'iradio:state'
const FAV_KEY = 'iradio:favorites'

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key))
    return v == null ? fallback : v
  } catch { return fallback }
}
const stored = loadJSON(STATE_KEY, {})

const sound = ref(null)
const status = ref('idle') // 'idle' | 'loading' | 'playing' | 'error'
const errorMessage = ref('')
const currentStation = ref(null)
const volume = ref(typeof stored.volume === 'number' ? stored.volume : 50)
const muted = ref(!!stored.muted)
const lastPlayedName = ref(stored.lastStation || null)

const favorites = ref(loadJSON(FAV_KEY, []))
const searchQuery = ref('')
const sleepMinutes = ref(0)
const sleepRemaining = ref(0)

const isPlaying = computed(() => status.value === 'playing')
const isLoading = computed(() => status.value === 'loading')
const hasError = computed(() => status.value === 'error')
const isFavorite = (name) => favorites.value.includes(name)

const visibleStations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = stations.map((s, i) => ({ ...s, idx: i }))
  if (q) {
    return list.filter((s) => s.name.toLowerCase().includes(q))
  }
  // favorites first, then original order
  return list.sort((a, b) => {
    const fa = isFavorite(a.name) ? 0 : 1
    const fb = isFavorite(b.name) ? 0 : 1
    return fa !== fb ? fa - fb : a.idx - b.idx
  })
})

const sleepLabel = computed(() => {
  if (!sleepRemaining.value) return ''
  const m = Math.floor(sleepRemaining.value / 60)
  const s = sleepRemaining.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

function applyVolume() {
  Howler.volume(volume.value / 100)
  Howler.mute(muted.value)
}

function teardown() {
  if (sound.value) {
    sound.value.unload()
    sound.value = null
  }
  status.value = 'idle'
  errorMessage.value = ''
}

function setStation(i) {
  if (currentStation.value === i && (isPlaying.value || isLoading.value)) {
    teardown()
    currentStation.value = null
    clearMediaSession()
    return
  }

  if (sound.value) {
    sound.value.unload()
    sound.value = null
  }

  currentStation.value = i
  status.value = 'loading'
  errorMessage.value = ''

  const station = stations[i]
  const howl = new Howl({
    src: station.src,
    html5: true,
    format: ['mp3', 'aac', 'aacp']
  })

  howl.on('play', () => {
    status.value = 'playing'
    lastPlayedName.value = station.name
    persistState()
  })
  howl.on('loaderror', () => {
    status.value = 'error'
    errorMessage.value = 'שגיאת חיבור'
  })
  howl.on('playerror', () => {
    status.value = 'error'
    errorMessage.value = 'שגיאת השמעה'
  })

  sound.value = howl
  applyVolume()
  howl.play()
  setMediaSession(station)
}

function toggleMute() {
  muted.value = !muted.value
  applyVolume()
}

function nextStation() {
  if (currentStation.value === null) return
  setStation((currentStation.value + 1) % stations.length)
}
function prevStation() {
  if (currentStation.value === null) return
  setStation((currentStation.value - 1 + stations.length) % stations.length)
}

function toggleFavorite(name) {
  const idx = favorites.value.indexOf(name)
  if (idx >= 0) favorites.value.splice(idx, 1)
  else favorites.value.push(name)
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites.value)) } catch { /* storage full */ }
}

let sleepTicker = null
function startSleepTimer(minutes) {
  if (sleepTicker) {
    clearInterval(sleepTicker)
    sleepTicker = null
  }
  if (!minutes) {
    sleepRemaining.value = 0
    return
  }
  sleepRemaining.value = minutes * 60
  sleepTicker = setInterval(() => {
    sleepRemaining.value--
    if (sleepRemaining.value <= 0) {
      clearInterval(sleepTicker)
      sleepTicker = null
      sleepMinutes.value = 0
      teardown()
      currentStation.value = null
      clearMediaSession()
    }
  }, 1000)
}

watch(sleepMinutes, (n) => startSleepTimer(n))

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
  navigator.mediaSession.setActionHandler('stop', () => { teardown(); currentStation.value = null })
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

function avatarLetter(name) {
  return [...name].find((c) => c.trim() && !'"\'`'.includes(c)) || '?'
}
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360}, 55%, 45%)`
}

function persistState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      volume: volume.value,
      muted: muted.value,
      lastStation: lastPlayedName.value
    }))
  } catch { /* private mode / storage full */ }
}

watch(volume, () => { applyVolume(); persistState() })
watch(muted, persistState)

function onKeydown(e) {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return
  if (e.key === 'm' || e.key === 'M') toggleMute()
  else if (e.code === 'Space' && currentStation.value !== null) {
    e.preventDefault()
    setStation(currentStation.value)
  } else if (e.key === '/') {
    e.preventDefault()
    document.querySelector('.search-input')?.focus()
  }
}

onMounted(() => {
  applyVolume()
  window.addEventListener('keydown', onKeydown)

  if (lastPlayedName.value) {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-station-name="${CSS.escape(lastPlayedName.value)}"]`)
      el?.scrollIntoView({ block: 'center', behavior: 'auto' })
    })
  }
})

onUnmounted(() => {
  if (sleepTicker) clearInterval(sleepTicker)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>
    <h1 class="sr-only">רדיו ישראלי</h1>

    <header class="topbar">
      <div class="search-wrapper">
        <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current text-white opacity-70" aria-hidden="true">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          class="search-input"
          placeholder="חיפוש תחנה…"
          aria-label="חיפוש תחנה"
        />
        <button v-if="searchQuery" type="button" class="search-clear" aria-label="נקה חיפוש" @click="searchQuery = ''">×</button>
      </div>

      <label class="sleep-control">
        <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current text-white" aria-hidden="true">
          <path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8m0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6m.5-10H11v5l4.25 2.52.75-1.23-3.5-2.08z"/>
        </svg>
        <select v-model.number="sleepMinutes" class="sleep-select" aria-label="טיימר שינה">
          <option :value="0">ללא טיימר</option>
          <option :value="15">15 דק'</option>
          <option :value="30">30 דק'</option>
          <option :value="45">45 דק'</option>
          <option :value="60">60 דק'</option>
          <option :value="90">90 דק'</option>
        </select>
        <span v-if="sleepLabel" class="sleep-countdown" aria-live="polite">{{ sleepLabel }}</span>
      </label>
    </header>

    <ul class="station-list" aria-label="תחנות רדיו">
      <li
        v-for="station in visibleStations"
        :key="station.name"
        class="station"
        :class="{
          active: station.idx === currentStation,
          'last-played': station.name === lastPlayedName && station.idx !== currentStation
        }"
        :data-station-name="station.name"
      >
        <div class="station-row">
          <button
            type="button"
            class="fav-btn"
            :aria-label="isFavorite(station.name) ? `הסר את ${station.name} ממועדפים` : `הוסף את ${station.name} למועדפים`"
            :aria-pressed="isFavorite(station.name)"
            @click="toggleFavorite(station.name)"
          >
            <svg v-if="isFavorite(station.name)" viewBox="0 0 24 24" class="h-7 w-7 fill-current text-yellow-300">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-7 w-7 fill-current text-white opacity-50">
              <path d="m12 15.4-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28zM22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03z"/>
            </svg>
          </button>

          <button
            type="button"
            :aria-current="station.idx === currentStation ? 'true' : 'false'"
            :aria-label="`האזן ל${station.name}`"
            class="station-btn"
            @click="setStation(station.idx)"
          >
            <span class="logo-cell">
              <img v-if="station.logo" :src="station.logo" alt="" class="logo" loading="lazy" />
              <span
                v-else
                class="avatar"
                :style="{ backgroundColor: avatarColor(station.name) }"
                aria-hidden="true"
              >{{ avatarLetter(station.name) }}</span>
            </span>
            <span class="name text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl text-white font-light">
              {{ station.name }}
            </span>
            <span class="indicator">
              <span v-if="station.idx === currentStation && isLoading" class="spinner" aria-label="טוען"></span>
              <span v-else-if="station.idx === currentStation && hasError" class="error-icon" :title="errorMessage" aria-label="שגיאה">!</span>
              <span v-else-if="station.idx === currentStation && isPlaying" class="playing" aria-label="משדר עכשיו">
                <span class="rect1"></span>
                <span class="rect2"></span>
                <span class="rect3"></span>
                <span class="rect4"></span>
                <span class="rect5"></span>
              </span>
            </span>
          </button>
        </div>
      </li>
    </ul>

    <p v-if="visibleStations.length === 0" class="empty-state">
      לא נמצאו תחנות עבור "{{ searchQuery }}"
    </p>

    <div v-if="currentStation !== null" class="footer-spacer"></div>
    <div v-if="currentStation !== null" class="footer" role="region" aria-label="פקדי השמעה">
      <div class="volume">
        <button
          type="button"
          class="mute-btn"
          :aria-label="muted ? 'בטל השתקה' : 'השתק'"
          :aria-pressed="muted"
          @click="toggleMute"
        >
          <svg v-if="muted" viewBox="0 0 24 24" class="fill-current text-white h-6">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="fill-current text-white h-6">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </button>
        <input v-model.number="volume" type="range" min="0" max="100" :disabled="muted" aria-label="עוצמת קול" />
      </div>
      <div class="statName">
        <span v-if="isLoading">טוען…</span>
        <span v-else-if="hasError">⚠ {{ errorMessage }}</span>
        <span v-else>{{ stations[currentStation].name }}</span>
      </div>
      <div class="playpause">
        <button type="button" :aria-label="isPlaying || isLoading ? 'עצור' : 'הפעל'" @click="setStation(currentStation)">
          <svg v-if="isPlaying || isLoading" class="h-10 w-10 fill-current text-white" viewBox="0 0 512 512">
            <path d="M224 435.8V76.1c0-6.7-5.4-12.1-12.2-12.1h-71.6c-6.8 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.8 0 12.2-5.4 12.2-12.2zM371.8 64h-71.6c-6.7 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.7 0 12.2-5.4 12.2-12.2V76.1c0-6.7-5.4-12.1-12.2-12.1z" />
          </svg>
          <svg v-else class="h-10 w-10 fill-current text-white" viewBox="0 0 512 512">
            <path d="M96 64v384l320-192L96 64z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;700&display=swap');

html { height: 100%; width: 100%; direction: rtl; }
body {
  height: 100%;
  width: 99%;
  font-family: 'Rubik', sans-serif;
  @apply bg-green-500;
}

button {
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
button:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 4px; }

.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  @apply bg-green-500;
  background: rgba(72, 187, 120, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  padding: 0.4rem 1rem;

  &:focus-within {
    background: rgba(255, 255, 255, 0.28);
    outline: 2px solid #fff;
  }
}
.search-input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: 0;
  color: #fff;
  font-size: 1rem;
  font-family: inherit;
  &::placeholder { color: rgba(255, 255, 255, 0.7); }
  &::-webkit-search-cancel-button { display: none; }
}
.search-clear {
  color: #fff;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0 0.25rem;
  opacity: 0.7;
  &:hover { opacity: 1; }
}

.sleep-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
}
.sleep-select {
  background: transparent;
  border: 0;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  &:focus { outline: 0; }
  option { color: #000; }
}
.sleep-countdown {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
}

.station-list { list-style: none; padding: 0; margin: 0; @apply flex flex-col px-4; }

.station {
  @apply my-2 w-full rounded-xxl py-2;
  position: relative;
}
.station:hover,
.station:focus-within,
.station.active {
  background-color: rgba(255, 255, 255, 0.1);
}
.station.last-played {
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    bottom: 12px;
    inset-inline-end: 0;
    width: 3px;
    background: rgba(255, 255, 255, 0.55);
    border-radius: 2px;
  }
}

.station-row {
  @apply w-full max-w-4xl mx-auto flex items-center;
  gap: 0.5rem;
}

.fav-btn {
  flex-shrink: 0;
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  transition: transform 0.15s ease;
  &:hover { transform: scale(1.15); }
  &:active { transform: scale(0.95); }
}

.station-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
}

.logo-cell {
  width: 30%;
  display: flex;
  justify-content: flex-end;
  padding-inline-end: 1rem;
}
.logo {
  @apply w-20 h-20 rounded-xxl border-2 border-black;
  object-fit: cover;
}
.avatar {
  @apply w-20 h-20 rounded-xxl border-2 border-black flex items-center justify-center text-white font-bold;
  font-size: 2rem;
}

.name { width: 50%; }

.indicator {
  width: 20%;
  padding-inline-start: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 40px;
}

.playing {
  width: 100px;
  height: 40px;
  display: inline-flex;
  align-items: stretch;
}
.playing > span {
  background-color: #fff;
  height: 100%;
  width: 6px;
  display: inline-block;
  animation: wavy 1s ease infinite forwards;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.33);
}
.playing .rect2 { animation-delay: 0.25s; margin-inline-start: 1px; }
.playing .rect3 { animation-delay: 0.5s; margin-inline-start: 1px; }
.playing .rect4 { animation-delay: 0.75s; margin-inline-start: 1px; }
.playing .rect5 { animation-delay: 1s; margin-inline-start: 1px; }

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #cc1919;
  color: #fff;
  font-weight: 700;
  font-size: 1.25rem;
}

.empty-state {
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  padding: 4rem 1rem;
  font-size: 1.125rem;
}

.footer-spacer { padding-top: 5rem; }

.footer {
  width: 90%;
  z-index: 10;
  bottom: 0;
  right: 5%;
  position: fixed;
  @apply bg-green-800 text-center h-16 border-t-2 border-green-300 flex items-center justify-between rounded-tr-xxl rounded-tl-xxl mx-auto;

  .volume {
    @apply mr-6 flex items-center;
    width: 30%;
    gap: 0.5rem;

    input { width: 100%; cursor: pointer; }
    input:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  .mute-btn { display: inline-flex; flex-shrink: 0; }
  .statName {
    @apply text-white font-bold;
    width: 50%;
    @media (min-width: 768px) { @apply text-xl; }
  }
  .playpause {
    @apply ml-6;
    width: 10%;
    display: flex;
    justify-content: center;
  }
}

@keyframes wavy {
  0%   { transform: scaleY(1); }
  50%  { transform: scaleY(0.6); }
  100% { transform: scaleY(1); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
