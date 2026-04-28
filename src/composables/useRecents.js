import { usePersistedRef } from './usePersistedRef'

const RECENTS_LIMIT = 5
const recents = usePersistedRef('iradio:recents', [])

export function useRecents() {
  function recordRecent(name) {
    recents.value = [name, ...recents.value.filter((n) => n !== name)].slice(0, RECENTS_LIMIT)
  }
  return { recents, recordRecent }
}
