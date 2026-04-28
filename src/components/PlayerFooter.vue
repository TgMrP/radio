<script setup>
import { computed } from 'vue'

const props = defineProps({
  station: { type: Object, required: true },
  status: { type: String, default: 'idle' },
  errorMessage: { type: String, default: '' },
  nowPlayingTitle: { type: String, default: '' },
  volume: { type: Number, required: true },
  muted: { type: Boolean, required: true }
})
const emit = defineEmits(['update:volume', 'update:muted', 'toggle', 'share'])

const isLoading = computed(() => props.status === 'loading')
const isPlaying = computed(() => props.status === 'playing')
const hasError = computed(() => props.status === 'error')
const isBusy = computed(() => isPlaying.value || isLoading.value)
</script>

<template>
  <div class="footer-spacer"></div>
  <div class="footer" role="region" aria-label="פקדי השמעה">
    <div class="volume">
      <button
        type="button"
        class="mute-btn"
        :aria-label="muted ? 'בטל השתקה' : 'השתק'"
        :aria-pressed="muted"
        @click="emit('update:muted', !muted)"
      >
        <svg v-if="muted" viewBox="0 0 24 24" class="fill-current text-white h-6">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="fill-current text-white h-6">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      </button>
      <input
        :value="volume"
        type="range"
        min="0"
        max="100"
        :disabled="muted"
        aria-label="עוצמת קול"
        :style="{ '--volume-pct': muted ? '0%' : `${volume}%` }"
        @input="emit('update:volume', Number($event.target.value))"
      />
    </div>
    <div class="statName">
      <span v-if="isLoading" class="stat-line stat-primary">טוען…</span>
      <span v-else-if="hasError" class="stat-line stat-primary">⚠ {{ errorMessage }}</span>
      <template v-else>
        <span class="stat-line stat-primary">{{ station.name }}</span>
        <span v-if="nowPlayingTitle" class="stat-line stat-now-playing" :title="nowPlayingTitle">
          <svg viewBox="0 0 24 24" class="h-3 w-3 fill-current inline" aria-hidden="true">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/>
          </svg>
          {{ nowPlayingTitle }}
        </span>
      </template>
    </div>
    <div class="footer-actions">
      <button type="button" class="share-btn" aria-label="שתף תחנה" @click="emit('share')">
        <svg viewBox="0 0 24 24" class="h-6 w-6 fill-current text-white">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92"/>
        </svg>
      </button>
      <button
        type="button"
        class="play-btn"
        :aria-label="isBusy ? 'עצור' : 'הפעל'"
        @click="emit('toggle')"
      >
        <svg v-if="isBusy" class="h-10 w-10 fill-current text-white" viewBox="0 0 512 512">
          <path d="M224 435.8V76.1c0-6.7-5.4-12.1-12.2-12.1h-71.6c-6.8 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.8 0 12.2-5.4 12.2-12.2zM371.8 64h-71.6c-6.7 0-12.2 5.4-12.2 12.1v359.7c0 6.7 5.4 12.2 12.2 12.2h71.6c6.7 0 12.2-5.4 12.2-12.2V76.1c0-6.7-5.4-12.1-12.2-12.1z" />
        </svg>
        <svg v-else class="h-10 w-10 fill-current text-white" viewBox="0 0 512 512">
          <path d="M96 64v384l320-192L96 64z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-spacer { padding-top: 5rem; }

.footer {
  width: 100%;
  z-index: 10;
  bottom: 0;
  inset-inline: 0;
  position: fixed;
  height: 4rem;
  padding: 0 1rem;
  gap: 1rem;
  @apply bg-green-800 text-center border-t-2 border-green-300 flex items-center justify-between mx-auto;

  @media (min-width: 640px) {
    width: 90%;
    inset-inline: auto;
    right: 5%;
    @apply rounded-tr-xxl rounded-tl-xxl;
  }
}

.volume {
  flex: 1;
  max-width: 30%;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type='range'] {
    flex: 1;
    width: 100%;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    height: 4px;
    // RTL slider: handle is X% from the right (start), so the filled segment
    // is on the right and empty on the left. CSS gradient angles are absolute
    // (`to left` = right→left), so `to left` paints fill→empty correctly.
    background: linear-gradient(to left,
      #fff 0%,
      #fff calc(var(--volume-pct, 50%)),
      rgba(255, 255, 255, 0.3) calc(var(--volume-pct, 50%)),
      rgba(255, 255, 255, 0.3) 100%);
    border-radius: 9999px;
    outline: 0;

    &::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      transition: transform 0.15s ease;
    }
    &::-webkit-slider-thumb:hover { transform: scale(1.2); }
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      border: 0;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }
    &:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
.mute-btn { display: inline-flex; flex-shrink: 0; padding: 0.25rem; }

.statName {
  @apply text-white;
  flex: 1;
  min-width: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
  gap: 2px;
}
.stat-line {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.stat-primary {
  @apply font-bold;
  @media (min-width: 768px) { @apply text-lg; }
}
.stat-now-playing {
  font-size: 0.75rem;
  opacity: 0.85;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  @media (min-width: 768px) { font-size: 0.85rem; }
}

.footer-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.share-btn,
.play-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background 0.15s ease;
  &:hover { background: rgba(255, 255, 255, 0.15); }
}

// On phones the footer is already cramped — drop the share button to give the
// volume slider more room to breathe.
@media (max-width: 480px) {
  .footer .share-btn { display: none; }
  .volume { max-width: 38%; }
}
</style>
