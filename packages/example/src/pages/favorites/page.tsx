import { useQuery } from '@tanstack/react-query'
import { Link } from '@crax/router'
import { Head } from '@crax/seo'
import { useFavorites } from '../../stores/favorites'

type PokemonDetail = {
  id: number
  name: string
  sprites: { front_default: string }
}

export default function FavoritesPage() {
  const { ids, toggle, isFavorite } = useFavorites()

  const { data: pokemon } = useQuery<PokemonDetail[]>({
    queryKey: ['favorites', ids],
    queryFn: () =>
      Promise.all(
        ids.map((id) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json())
        )
      ),
    enabled: ids.length > 0,
  })

  return (
    <>
      <Head>
        <title>Favorites | Pokedex</title>
        <meta name="description" content="Your favorite Pokemon" />
      </Head>

      <main className="min-h-screen bg-neutral-950 text-white">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-amber-400">Poke</span>dex
          </h1>
          <nav className="flex gap-4 text-sm">
            <Link to="/" prefetch="smart" className="text-neutral-400 hover:text-white">Home</Link>
            <Link to="/pokemon" prefetch="smart" className="text-neutral-400 hover:text-white">All Pokemon</Link>
            <Link to="/favorites" prefetch="smart" className="text-amber-400">Favorites</Link>
          </nav>
        </header>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">Your Favorites</h2>

          {ids.length === 0 ? (
            <p className="text-neutral-500">
              No favorites yet.{' '}
              <Link to="/pokemon" prefetch="smart" className="text-amber-400 hover:underline">
                Browse Pokemon
              </Link>{' '}
              to add some.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {pokemon?.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-2 rounded border border-neutral-800 bg-neutral-900 p-4 transition hover:border-amber-500"
                >
                  <Link to={`/pokemon/${p.id}`} prefetch="smart" className="flex flex-col items-center gap-2">
                    <img
                      src={p.sprites.front_default}
                      alt={p.name}
                      width={96}
                      height={96}
                      loading="lazy"
                    />
                    <span className="text-sm font-medium capitalize">{p.name}</span>
                    <span className="text-xs text-neutral-500">#{p.id}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="text-lg"
                  >
                    {isFavorite(p.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
