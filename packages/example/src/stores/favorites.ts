import { createStore, useStore } from '@crax/store'

const favoritesStore = createStore<number[]>([])

export function useFavorites() {
  const [ids, setIds] = useStore(favoritesStore)

  const toggle = (id: number) => {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const isFavorite = (id: number) => ids.includes(id)

  return { ids, toggle, isFavorite }
}
