import { usePersistedRef } from './usePersistedRef'

// Module-level singleton — all callers share the same list.
const favorites = usePersistedRef('iradio:favorites', [])

export function useFavorites() {
  function isFavorite(name) {
    return favorites.value.includes(name)
  }
  function toggleFavorite(name) {
    const idx = favorites.value.indexOf(name)
    if (idx >= 0) favorites.value.splice(idx, 1)
    else favorites.value.push(name)
  }
  return { favorites, isFavorite, toggleFavorite }
}
