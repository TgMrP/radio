import { computed, ref } from 'vue'
import { stations } from '@/data/stations'
import { useFavorites } from './useFavorites'
import { useRecents } from './useRecents'

const searchQuery = ref('')

export function useStationList() {
  const { isFavorite } = useFavorites()
  const { recents } = useRecents()

  const visibleStations = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const list = stations.map((s, idx) => ({ ...s, idx }))
    if (q) return list.filter((s) => s.name.toLowerCase().includes(q))

    // Sort priority: favorites first, then recently-played (most recent first),
    // then everything else in original order.
    const recentIndex = (name) => {
      const i = recents.value.indexOf(name)
      return i < 0 ? Infinity : i
    }
    return list.sort((a, b) => {
      const fa = isFavorite(a.name) ? 0 : 1
      const fb = isFavorite(b.name) ? 0 : 1
      if (fa !== fb) return fa - fb
      const ra = recentIndex(a.name)
      const rb = recentIndex(b.name)
      if (ra !== rb) return ra - rb
      return a.idx - b.idx
    })
  })

  return { searchQuery, visibleStations, stations }
}
