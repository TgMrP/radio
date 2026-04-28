<script setup>
import { onMounted } from 'vue'

import TopBar from './components/TopBar.vue'
import StationRow from './components/StationRow.vue'
import PlayerFooter from './components/PlayerFooter.vue'
import InstallBanner from './components/InstallBanner.vue'

import { useAudioPlayer } from './composables/useAudioPlayer'
import { useFavorites } from './composables/useFavorites'
import { useStationList } from './composables/useStationList'
import { useSleepTimer } from './composables/useSleepTimer'
import { useInstallPrompt } from './composables/useInstallPrompt'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'

const player = useAudioPlayer()
// Pull each ref out at the top of `<script setup>` so Vue auto-unwraps them
// in the template — keeps markup free of `.value` noise.
const {
  status,
  errorMessage,
  currentStation,
  volume,
  muted,
  lastPlayedName,
  nowPlayingTitle
} = player

const { isFavorite, toggleFavorite } = useFavorites()
const { searchQuery, visibleStations, stations } = useStationList()

const { minutes: sleepMinutes, label: sleepLabel, remaining: sleepRemaining, snooze } =
  useSleepTimer({ onExpire: player.stop })

const {
  installPromptEvent,
  isIos,
  showBanner: showInstallBanner,
  trigger: triggerInstall,
  dismiss: dismissInstall
} = useInstallPrompt()

useKeyboardShortcuts({
  player,
  focusSearch: () => document.querySelector('.search-input')?.focus()
})

onMounted(() => {
  // Bring the last-played station into view on initial load. We don't auto-
  // play because browser autoplay policies require an explicit user gesture
  // for media with sound.
  if (lastPlayedName.value) {
    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-station-name="${CSS.escape(lastPlayedName.value)}"]`
      )
      el?.scrollIntoView({ block: 'center', behavior: 'auto' })
    })
  }
})
</script>

<template>
  <div>
    <h1 class="sr-only">רדיו ישראלי</h1>

    <TopBar
      v-model:search="searchQuery"
      v-model:sleep-minutes="sleepMinutes"
      :sleep-label="sleepLabel"
      :sleep-remaining="sleepRemaining"
      @snooze="snooze"
    />

    <ul class="station-list" aria-label="תחנות רדיו">
      <StationRow
        v-for="station in visibleStations"
        :key="station.name"
        :station="station"
        :is-active="station.idx === currentStation"
        :is-favorite="isFavorite(station.name)"
        :is-last-played="station.name === lastPlayedName && station.idx !== currentStation"
        :status="station.idx === currentStation ? status : 'idle'"
        :error-message="errorMessage"
        @select="player.setStation(station.idx)"
        @toggle-favorite="toggleFavorite(station.name)"
      />
    </ul>

    <p v-if="visibleStations.length === 0" class="empty-state">
      לא נמצאו תחנות עבור "{{ searchQuery }}"
    </p>

    <Transition name="install-slide">
      <InstallBanner
        v-if="showInstallBanner"
        :is-ios="isIos"
        :can-prompt="!!installPromptEvent"
        :has-footer="currentStation !== null"
        @install="triggerInstall"
        @dismiss="dismissInstall"
      />
    </Transition>

    <PlayerFooter
      v-if="currentStation !== null"
      v-model:volume="volume"
      v-model:muted="muted"
      :station="stations[currentStation]"
      :status="status"
      :error-message="errorMessage"
      :now-playing-title="nowPlayingTitle"
      @toggle="player.toggleCurrent"
      @share="player.shareCurrent"
    />
  </div>
</template>
