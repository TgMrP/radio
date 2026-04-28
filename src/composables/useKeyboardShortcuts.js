import { onMounted, onUnmounted } from 'vue'

// Global keyboard shortcuts for the player. Anything typed inside form fields
// is left alone so the user can search etc. without surprises.
export function useKeyboardShortcuts({ player, focusSearch }) {
  function onKeydown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return

    if (e.key === 'm' || e.key === 'M') {
      player.toggleMute()
    } else if (e.code === 'Space' && player.currentStation.value !== null) {
      e.preventDefault()
      player.toggleCurrent()
    } else if (e.key === '/') {
      e.preventDefault()
      focusSearch?.()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      player.volume.value = Math.min(100, player.volume.value + 5)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      player.volume.value = Math.max(0, player.volume.value - 5)
    } else if (e.key === 'ArrowRight' && player.currentStation.value !== null) {
      // RTL: ArrowRight is visually "previous" — feels right for Hebrew users.
      e.preventDefault()
      player.prevStation()
    } else if (e.key === 'ArrowLeft' && player.currentStation.value !== null) {
      e.preventDefault()
      player.nextStation()
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
