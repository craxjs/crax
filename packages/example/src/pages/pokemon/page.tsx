import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@crax/router'
import { Head } from '@crax/seo'
import { useFavorites } from '../../stores/favorites'

type Pokemon = { name: string; url: string }
type PokemonListResponse = { results: Pokemon[]; count: number }

const PAGE_SIZE = 20

function getId(url: string) {
  return Number(url.split('/').filter(Boolean).pop())
}

export default function AllPokemonPage() {
  const [page, setPage] = useState(0)
  const { toggle, isFavorite } = useFavorites()
  const offset = page * PAGE_SIZE

  const { data, isLoading } = useQuery<PokemonListResponse>({
    queryKey: ['pokemon-all', offset],
    queryFn: () =>
      fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${offset}`).then((r) => r.json()),
  })

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0

  return (
    <>
      <Head>
        <title>All Pokemon | Pokedex</title>
        <meta name="description" content="Browse all Pokemon" />
      </Head>

      <main className="min-h-screen bg-neutral-950 text-white">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-amber-400">Poke</span>dex
          </h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" prefetch="smart" className="text-neutral-400 hover:text-white">Home</Link>
            <Link to="/pokemon" prefetch="smart" className="text-amber-400">All Pokemon</Link>
            <Link to="/favorites" prefetch="smart" className="text-neutral-400 hover:text-white">Favorites</Link>
          </nav>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">All Pokemon</h2>
          {isLoading ? (
            <p className="text-neutral-500">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {data?.results.map((pokemon) => {
                  const id = getId(pokemon.url)
                  return (
                    <div
                      key={pokemon.name}
                      className="flex flex-col items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-4 transition hover:border-amber-500"
                    >
                      <Link to={`/pokemon/${id}`} prefetch="smart" className="flex flex-col items-center gap-2">
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                          alt={pokemon.name}
                          width={96}
                          height={96}
                          loading="lazy"
                        />
                        <span className="text-sm font-medium capitalize">{pokemon.name}</span>
                        <span className="text-xs text-neutral-500">#{id}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="text-lg"
                      >
                        {isFavorite(id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-amber-500 hover:text-amber-400 disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:border-amber-500 hover:text-amber-400 disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  )
}
