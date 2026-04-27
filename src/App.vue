<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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

const STORAGE_KEY = 'iradio:state'
function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}
const stored = loadStored()

const sound = ref(null)
const status = ref('idle') // 'idle' | 'loading' | 'playing' | 'error'
const errorMessage = ref('')
const currentStation = ref(null)
const volume = ref(typeof stored.volume === 'number' ? stored.volume : 50)
const muted = ref(!!stored.muted)

const isPlaying = computed(() => status.value === 'playing')
const isLoading = computed(() => status.value === 'loading')
const hasError = computed(() => status.value === 'error')

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

  howl.on('play', () => { status.value = 'playing' })
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

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: volume.value, muted: muted.value }))
  } catch { /* private mode / storage full */ }
}

watch(volume, () => { applyVolume(); persist() })
watch(muted, persist)

onMounted(() => {
  applyVolume()
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return
    if (e.key === 'm' || e.key === 'M') toggleMute()
    else if (e.code === 'Space' && currentStation.value !== null) {
      e.preventDefault()
      setStation(currentStation.value)
    }
  })
})
</script>

<template>
  <div>
    <h1 class="sr-only">רדיו ישראלי</h1>
    <ul class="station-list" aria-label="תחנות רדיו">
      <li
        v-for="(station, i) in stations"
        :key="station.name"
        class="station"
        :class="{ active: i === currentStation }"
      >
        <button
          type="button"
          :aria-current="i === currentStation ? 'true' : 'false'"
          :aria-label="`האזן ל${station.name}`"
          class="station-btn"
          @click="setStation(i)"
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
            <span v-if="i === currentStation && isLoading" class="spinner" aria-label="טוען"></span>
            <span v-else-if="i === currentStation && hasError" class="error-icon" :title="errorMessage" aria-label="שגיאה">!</span>
            <span v-else-if="i === currentStation && isPlaying" class="playing" aria-label="משדר עכשיו">
              <span class="rect1"></span>
              <span class="rect2"></span>
              <span class="rect3"></span>
              <span class="rect4"></span>
              <span class="rect5"></span>
            </span>
          </span>
        </button>
      </li>
    </ul>

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

.station-list { list-style: none; padding: 0; margin: 0; @apply flex flex-col px-4; }

.station {
  @apply my-2 w-full rounded-xxl py-2;
}
.station:hover,
.station:focus-within,
.station.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.station-btn {
  @apply w-full max-w-4xl mx-auto flex items-center justify-center;
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
