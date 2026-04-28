<script setup>
defineProps({
  isIos: { type: Boolean, default: false },
  canPrompt: { type: Boolean, default: false },
  hasFooter: { type: Boolean, default: false }
})
defineEmits(['install', 'dismiss'])
</script>

<template>
  <div
    class="install-banner"
    :class="{ 'with-footer': hasFooter }"
    role="dialog"
    aria-label="התקנת האפליקציה למסך הבית"
  >
    <img src="/img/icons/apple-touch-icon-180x180.png" alt="" class="install-icon" />
    <div class="install-text">
      <strong>הוסף למסך הבית</strong>
      <span v-if="isIos">הקש על
        <svg viewBox="0 0 24 24" class="install-share-icon" aria-hidden="true">
          <path fill="currentColor" d="M12 2 8 6h3v9h2V6h3zm-7 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9h-2v9H7v-9z"/>
        </svg>
        ואז "הוסף למסך הבית"</span>
      <span v-else>פתח כאפליקציה — מהיר יותר, בלי כתובת</span>
    </div>
    <div class="install-actions">
      <button
        v-if="!isIos && canPrompt"
        type="button"
        class="install-btn"
        @click="$emit('install')"
      >התקן</button>
      <button
        type="button"
        class="install-dismiss"
        aria-label="סגור הצעה"
        @click="$emit('dismiss')"
      >×</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.install-banner {
  position: fixed;
  bottom: 1rem;
  inset-inline: 1rem;
  z-index: 20;
  background: #fff;
  color: #1a4731;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  // The banner is mobile-first; on desktop we tuck it into the bottom-right.
  @media (min-width: 768px) {
    inset-inline: auto;
    inset-inline-start: 1rem;
    max-width: 380px;
  }
  // When the player footer is visible, lift the banner so it doesn't collide.
  &.with-footer { bottom: 5.25rem; }
}

.install-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
}

.install-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  line-height: 1.3;
  strong { font-weight: 700; }
  span {
    font-size: 0.78rem;
    color: rgba(26, 71, 49, 0.75);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: wrap;
  }
}
.install-share-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  color: #2563eb;
}

.install-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}
.install-btn {
  background: #48bb78;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  transition: background 0.15s ease, transform 0.1s ease;
  &:hover { background: #38a169; }
  &:active { transform: scale(0.95); }
}
.install-dismiss {
  background: transparent;
  color: #6b7280;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  &:hover { background: rgba(0, 0, 0, 0.06); color: #1a4731; }
}
</style>
