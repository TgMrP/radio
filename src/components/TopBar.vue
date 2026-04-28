<script setup>
defineProps({
  search: { type: String, required: true },
  sleepMinutes: { type: Number, required: true },
  sleepLabel: { type: String, default: '' },
  sleepRemaining: { type: Number, default: 0 }
})
defineEmits(['update:search', 'update:sleepMinutes', 'snooze'])
</script>

<template>
  <header class="topbar">
    <div class="search-wrapper">
      <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current text-white opacity-70" aria-hidden="true">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input
        :value="search"
        type="search"
        class="search-input"
        placeholder="חיפוש תחנה…"
        aria-label="חיפוש תחנה"
        @input="$emit('update:search', $event.target.value)"
      />
      <button
        v-if="search"
        type="button"
        class="search-clear"
        aria-label="נקה חיפוש"
        @click="$emit('update:search', '')"
      >×</button>
    </div>

    <label class="sleep-control">
      <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current text-white" aria-hidden="true">
        <path d="M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8m0 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6m.5-10H11v5l4.25 2.52.75-1.23-3.5-2.08z"/>
      </svg>
      <select
        :value="sleepMinutes"
        class="sleep-select"
        aria-label="טיימר שינה"
        @change="$emit('update:sleepMinutes', Number($event.target.value))"
      >
        <option :value="0">ללא טיימר</option>
        <option :value="15">15 דק'</option>
        <option :value="30">30 דק'</option>
        <option :value="45">45 דק'</option>
        <option :value="60">60 דק'</option>
        <option :value="90">90 דק'</option>
      </select>
      <span v-if="sleepLabel" class="sleep-countdown" aria-live="polite">{{ sleepLabel }}</span>
    </label>
    <button
      v-if="sleepRemaining > 0"
      type="button"
      class="snooze-btn"
      aria-label="הוסף 5 דקות לטיימר"
      @click="$emit('snooze')"
    >+5</button>
  </header>
</template>

<style lang="scss" scoped>
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

.snooze-btn {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.18);
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover { background: rgba(255, 255, 255, 0.28); }
  &:active { transform: scale(0.95); }
}
</style>
