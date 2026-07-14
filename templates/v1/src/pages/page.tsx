import { Link } from '@crax/router'

const features = [
  {
    title: 'File-based Routing',
    description: 'Drop a file in src/pages and it becomes a route. Supports dynamic segments, layouts, and catch-all patterns.',
  },
  {
    title: 'State Management',
    description: 'createStore gives you reactive global state with history, subscriptions, and useStoreEffect for side effects.',
  },
  {
    title: 'Image Optimization',
    description: 'The Image and Picture components handle lazy loading, CDN-aware sizing, and format fallbacks out of the box.',
  },
  {
    title: 'Data Fetching',
    description: 'React Query is pre-configured with sensible defaults and DevTools enabled. Add loaders via React Router for route-level data.',
  },
  {
    title: 'MDX Pages',
    description: 'Any .mdx file in src/pages is a route. Write content in Markdown and drop in React components wherever you need.',
  },
  {
    title: 'View Transitions',
    description: 'useViewTransition wraps navigations in the native View Transitions API with a no-op fallback for older browsers.',
  },
  {
    title: 'Smart Prefetching',
    description: 'Link ships with three prefetch strategies: smart uses IntersectionObserver, foresight tracks cursor intent, none disables it.',
  },
  {
    title: 'PWA and Deployment',
    description: 'Manifest, service worker hooks, and a production Dockerfile with Caddy serving the SPA are included from the start.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="flex flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <img
          src="/crax-icon.png"
          alt="Crax"
          width={72}
          height={72}
          className="select-none"
        />
        <div>
          <h1 className="text-5xl font-bold tracking-tight">
            Build faster with <span className="text-amber-400">Crax</span>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400">
            A lightweight React framework built on Vite. File-based routing, built-in state management, image optimization, and more, without the server overhead.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <a
            href="https://github.com/craxjs/crax"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded bg-amber-500 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-600"
          >
            GitHub
          </a>
          <Link
            to="/about"
            prefetch="smart"
            className="rounded border border-neutral-700 px-5 py-2.5 font-semibold text-neutral-300 transition hover:border-amber-500 hover:text-amber-400"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-px border border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2 border border-neutral-800 bg-neutral-950 p-6 transition hover:bg-neutral-900"
            >
              <h2 className="font-semibold text-white">{f.title}</h2>
              <p className="text-sm leading-relaxed text-neutral-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-800 px-6 py-6 text-center text-sm text-neutral-600">
        Edit <code className="font-mono text-neutral-400">src/pages/page.tsx</code> to start building.
      </footer>
    </main>
  )
}
