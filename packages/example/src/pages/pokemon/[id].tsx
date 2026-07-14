import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@crax/router'
import { Head } from '@crax/seo'
import { useFavorites } from '../../stores/favorites'

type PokemonDetail = {
  id: number
  name: string
  sprites: { front_default: string; other?: { 'official-artwork'?: { front_default: string } } }
  types: { type: { name: string } }[]
  stats: { base_stat: number; stat: { name: string } }[]
}

export default function PokemonDetailPage() {
  const router = useRouter()
  const id = Number(router.params.id)
  const { toggle, isFavorite } = useFavorites()

  const { data, isLoading, error } = useQuery<PokemonDetail>({
    queryKey: ['pokemon-detail', id],
    queryFn: () =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((r) => r.json()),
  })

  const name = data?.name ?? 'Pokemon'
  const artwork =
    data?.sprites?.other?.['official-artwork']?.front_default ??
    data?.sprites?.front_default ??
    ''

  return (
    <>
      <Head>
        <title>{name} | Pokedex</title>
        <meta name="description" content={`Stats and info for ${name}`} />
      </Head>

      {isLoading ? (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
          <p className="text-neutral-500">Loading...</p>
        </main>
      ) : error || !data ? (
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
          <p className="text-red-500">Failed to load Pokemon.</p>
        </main>
      ) : (
        <main className="min-h-screen bg-neutral-950 text-white">
          <header className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold">
              <span className="text-amber-400">Poke</span>dex
            </h1>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="text-neutral-400 hover:text-white">Home</a>
              <a href="/pokemon" className="text-neutral-400 hover:text-white">All Pokemon</a>
              <a href="/favorites" className="text-neutral-400 hover:text-white">Favorites</a>
            </nav>
          </header>

          <section className="mx-auto max-w-lg px-6 py-8">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold capitalize">{data.name}</h2>
                  <span className="text-neutral-500">#{data.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(data.id)}
                  className="text-2xl"
                >
                  {isFavorite(data.id) ? '❤️' : '🤍'}
                </button>
              </div>

              <img
                src={artwork}
                alt={data.name}
                width={200}
                height={200}
                className="mx-auto my-4"
              />

              <div className="flex flex-wrap gap-2 mb-6">
                {data.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400"
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-neutral-400">Stats</h3>
                {data.stats.map((s) => (
                  <div key={s.stat.name} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-neutral-500 capitalize">
                      {s.stat.name.replace('-', ' ')}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.min((s.base_stat / 255) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-neutral-400">{s.base_stat}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  )
}
