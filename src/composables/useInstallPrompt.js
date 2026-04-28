import { onMounted, onUnmounted, ref } from 'vue'

const DISMISS_KEY = 'iradio:installDismissedAt'
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000 // re-prompt after a week
const IOS_DELAY_MS = 4000

// PWA install offer. Chromium-based browsers fire `beforeinstallprompt`; iOS
// Safari doesn't fire anything and requires manual "Share → Add to Home Screen"
// instructions, so we detect iOS UA and show different copy.
export function useInstallPrompt() {
  const installPromptEvent = ref(null)
  const isIos = ref(false)
  const showBanner = ref(false)

  function isStandaloneInstalled() {
    return window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator.standalone === true
  }
  function shouldOffer() {
    if (isStandaloneInstalled()) return false
    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return false
    const dismissedAt = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10)
    return !dismissedAt || Date.now() - dismissedAt > DISMISS_MS
  }
  function rememberDismiss() {
    try { localStorage.setItem(DISMISS_KEY, Date.now().toString()) } catch { /* private mode */ }
  }

  function onBeforeInstallPrompt(e) {
    e.preventDefault()
    installPromptEvent.value = e
    if (shouldOffer()) showBanner.value = true
  }
  function onAppInstalled() {
    showBanner.value = false
    installPromptEvent.value = null
  }
  async function trigger() {
    if (!installPromptEvent.value) return
    installPromptEvent.value.prompt()
    const { outcome } = await installPromptEvent.value.userChoice
    installPromptEvent.value = null
    showBanner.value = false
    if (outcome !== 'accepted') rememberDismiss()
  }
  function dismiss() {
    showBanner.value = false
    rememberDismiss()
  }

  onMounted(() => {
    isIos.value = /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    // iOS never fires `beforeinstallprompt`. Show the banner after a small
    // delay so we don't slap the user the second they land.
    if (isIos.value && shouldOffer()) {
      setTimeout(() => { showBanner.value = true }, IOS_DELAY_MS)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onAppInstalled)
  })

  return { installPromptEvent, isIos, showBanner, trigger, dismiss }
}
