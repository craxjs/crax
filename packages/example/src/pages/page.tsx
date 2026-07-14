import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@crax/router'
import { Head } from '@crax/seo'
import { useFavorites } from '../stores/favorites'

type Pokemon = { name: string; url: string }
type PokemonListResponse = { results: Pokemon[]; count: number }
type PokemonDetail = {
  id: number
  name: string
  sprites: { front_default: string }
  types: { type: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
}

function getId(url: string) {
  return Number(url.split('/').filter(Boolean).pop())
}

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { toggle, isFavorite } = useFavorites()

  const { data, isLoading } = useQuery<PokemonListResponse>({
    queryKey: ['pokemon-home'],
    queryFn: () =>
      fetch('https://pokeapi.co/api/v2/pokemon?limit=12').then((r) => r.json()),
  })

  const { data: detail } = useQuery<PokemonDetail>({
    queryKey: ['pokemon-detail', selectedId],
    queryFn: () =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${selectedId}`).then((r) => r.json()),
    enabled: selectedId !== null,
  })

  return (
    <>
      <Head>
        <title>Pokedex | Home</title>
        <meta name="description" content="Browse the first 12 Pokemon" />
      </Head>

      <main className="min-h-screen bg-neutral-950 text-white">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-amber-400">Poke</span>dex
          </h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" prefetch="smart" className="text-amber-400">Home</Link>
            <Link to="/pokemon" prefetch="smart" className="text-neutral-400 hover:text-white">All Pokemon</Link>
            <Link to="/favorites" prefetch="smart" className="text-neutral-400 hover:text-white">Favorites</Link>
          </nav>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">First 12 Pokemon</h2>
          {isLoading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data?.results.map((pokemon) => {
                const id = getId(pokemon.url)
                return (
                  <div
                    key={pokemon.name}
                    className="flex flex-col items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-4 transition hover:border-amber-500"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(id)}
                      className="flex flex-col items-center gap-2"
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                        alt={pokemon.name}
                        width={96}
                        height={96}
                        loading="lazy"
                      />
                      <span className="text-sm font-medium capitalize">{pokemon.name}</span>
                      <span className="text-xs text-neutral-500">#{id}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggle(id) }}
                      className="text-lg"
                    >
                      {isFavorite(id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {selectedId && detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold capitalize">{detail.name}</h3>
                  <span className="text-sm text-neutral-500">#{detail.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <img
                src={detail.sprites?.front_default ?? ''}
                alt={detail.name}
                width={120}
                height={120}
                className="mx-auto my-4"
              />
              <div className="flex flex-wrap gap-2 mb-4">
                {detail.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400"
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggle(detail.id)}
                  className="flex-1 rounded bg-amber-500 px-4 py-2 font-semibold text-white transition hover:bg-amber-600"
                >
                  {isFavorite(detail.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <Link
                  to={`/pokemon/${detail.id}`}
                  prefetch="smart"
                  className="flex-1 rounded border border-neutral-700 px-4 py-2 text-center font-semibold text-neutral-300 transition hover:border-amber-500 hover:text-amber-400"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
