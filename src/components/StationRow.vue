<script setup>
const props = defineProps({
  station: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isLastPlayed: { type: Boolean, default: false },
  status: { type: String, default: 'idle' }, // 'idle' | 'loading' | 'playing' | 'error'
  errorMessage: { type: String, default: '' }
})
defineEmits(['select', 'toggleFavorite'])

function avatarLetter(name) {
  return [...name].find((c) => c.trim() && !'"\'`'.includes(c)) || '?'
}
function avatarColor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return `hsl(${h % 360}, 55%, 45%)`
}
</script>

<template>
  <li
    class="station"
    :class="{ active: isActive, 'last-played': isLastPlayed }"
    :data-station-name="station.name"
  >
    <div class="station-row">
      <button
        type="button"
        class="fav-btn"
        :aria-label="isFavorite ? `הסר את ${station.name} ממועדפים` : `הוסף את ${station.name} למועדפים`"
        :aria-pressed="isFavorite"
        @click="$emit('toggleFavorite')"
      >
        <svg v-if="isFavorite" viewBox="0 0 24 24" class="h-7 w-7 fill-current text-yellow-300">
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" class="h-7 w-7 fill-current text-white opacity-50">
          <path d="m12 15.4-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28zM22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03z"/>
        </svg>
      </button>

      <button
        type="button"
        :aria-current="isActive ? 'true' : 'false'"
        :aria-label="`האזן ל${station.name}`"
        class="station-btn"
        @click="$emit('select')"
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
          <span v-if="isActive && status === 'loading'" class="spinner" aria-label="טוען"></span>
          <span v-else-if="isActive && status === 'error'" class="error-icon" :title="errorMessage" aria-label="שגיאה">!</span>
          <span v-else-if="isActive && status === 'playing'" class="playing" aria-label="משדר עכשיו">
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
</template>

<style lang="scss" scoped>
.station {
  @apply my-2 w-full rounded-xxl py-2;
  position: relative;
}
.station:hover,
.station:focus-within,
.station.active {
  background-color: rgba(255, 255, 255, 0.1);
}
.station.last-played::before {
  content: '';
  position: absolute;
  top: 12px;
  bottom: 12px;
  inset-inline-end: 0;
  width: 3px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 2px;
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

@keyframes wavy {
  0%   { transform: scaleY(1); }
  50%  { transform: scaleY(0.6); }
  100% { transform: scaleY(1); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
