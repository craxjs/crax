# Crax Skill

A comprehensive reference for AI coding agents working with Crax projects. Use this as a quick reference or copy it into your agent's skill configuration.

## Principles

1. **Don't remove modules just because you can.** Only remove `.crax/` modules if they cause build errors or you genuinely don't use them. The framework is minimal — keeping modules means upgrades stay simple.
2. **Always use import aliases.** The tsconfig has `@/*` → `src/*` configured. Use `@/components/Foo` not relative `../../components/Foo`.
3. **Configure via `crax.config.mjs`.** Don't hack the framework source for config changes. Image sizes, OG settings, PWA options — all go in `crax.config.mjs`.
4. **Centralize stores.** Use `src/stores/index.ts` (single file) for small projects or `src/stores/cart.ts`, `src/stores/auth.ts` etc. for larger ones. Import and use in components, don't scatter `createStore` calls across page files.

## Project Structure

```
my-app/
├── .crax/              # Framework source (owned, editable)
│   ├── router/         # File-based routing
│   ├── store/          # Global state management
│   ├── image/          # Image and Picture components
│   ├── seo/            # Head component for document metadata
│   ├── hooks/          # useViewTransition, useForesight
│   ├── pwa/            # PWA icon/manifest generation
│   ├── scripts/        # Build-time scripts
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Internal utilities
├── src/
│   ├── pages/          # File-based routes
│   │   ├── page.tsx    # Home -> /
│   │   ├── about.tsx   # /about
│   │   ├── blog/
│   │   │   ├── page.tsx        # /blog
│   │   │   └── [id].tsx        # /blog/:id
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Shared layout
│   │   │   └── settings.tsx    # /dashboard/settings
│   │   ├── [...all].tsx        # Catch-all /shop/*
│   │   ├── not-found.tsx       # 404 page
│   │   ├── error.tsx           # Error boundary
│   │   └── loading.tsx         # Loading state
│   ├── stores/         # Centralized state (see State Management)
│   │   ├── index.ts    # Re-exports all stores (small projects)
│   │   ├── auth.ts     # Auth store
│   │   └── cart.ts     # Cart store
│   ├── components/     # Shared UI components
│   ├── App.tsx         # Root component (QueryClient + CraxRouter)
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles (Tailwind)
├── crax.config.mjs     # Framework configuration
└── vite.config.ts      # Vite config (do not modify)
```

## Imports

Always use the `@/` import alias (configured in tsconfig). Never use relative paths like `../../`.

```tsx
// Framework modules — use alias
import { Link, useRouter, Outlet } from '@crax/router'
import { createStore, useStore, useStoreEffect } from '@crax/store'
import { Image, Picture } from '@crax/image'
import { Head } from '@crax/seo'
import { useViewTransition } from '@crax/hooks/use-view-transition'

// Your code — use @/ alias
import { authStore } from '@/stores/auth'
import { Button } from '@/components/Button'
import { formatDate } from '@/utils/format'
```

## Routing

File-based via React Router. Drop a file in `src/pages/` and it becomes a route.

| File | Route |
|------|-------|
| `src/pages/page.tsx` | `/` |
| `src/pages/about.tsx` | `/about` |
| `src/pages/blog/page.tsx` | `/blog` |
| `src/pages/blog/[id].tsx` | `/blog/:id` |
| `src/pages/shop/[...all].tsx` | `/shop/*` |

**Special files:**

| File | Purpose |
|------|---------|
| `layout.tsx` | Wraps all sibling/nested routes in directory |
| `loading.tsx` | Shown while route loads |
| `error.tsx` | Error boundary for route |
| `not-found.tsx` | 404 page |

## State Management

Global state built on `useSyncExternalStore`. No providers, no boilerplate, no re-render pitfalls.

### Store Organization

**Small projects** — one file `src/stores/index.ts`:

```tsx
import { createStore } from '@crax/store'

export const themeStore = createStore<'light' | 'dark'>('light')
export const authStore = createStore({ user: null, isLoggedIn: false })
export const cartStore = createStore<{ id: number; qty: number }[]>([])
```

**Larger projects** — separate files `src/stores/`:

```
src/stores/
├── index.ts      # Re-exports
├── auth.ts       # Auth-related state
├── cart.ts       # Cart state
└── theme.ts      # UI preferences
```

```tsx
// src/stores/auth.ts
import { createStore } from '@crax/store'

export const authStore = createStore({
  user: null as { id: string; name: string } | null,
  isLoggedIn: false,
})

export function login(name: string) {
  authStore.value = { user: { id: '1', name }, isLoggedIn: true }
}

export function logout() {
  authStore.value = { user: null, isLoggedIn: false }
}
```

Then import and use in components:

```tsx
import { useStore } from '@crax/store'
import { authStore, login } from '@/stores/auth'

function LoginButton() {
  const [auth, setAuth] = useStore(authStore)
  return auth.isLoggedIn ? (
    <button onClick={() => login('User')}>Login</button>
  ) : (
    <span>Welcome, {auth.user?.name}</span>
  )
}
```

## Image Optimization

CDN-aware responsive images with automatic srcset generation.

```tsx
import { Image, Picture } from '@crax/image'

// Basic usage
<Image src="/hero.jpg" alt="Hero image" width={1200} height={600} />

// With custom sizes
<Image
  src="/photo.jpg"
  alt="Photo"
  width={800}
  height={400}
  sizes="(max-width: 640px) 100vw, 50vw"
/>

// Art-directed: different crops per breakpoint
<Picture>
  <source media="(max-width: 640px)" srcSet="/hero-mobile.jpg" />
  <source media="(min-width: 641px)" srcSet="/hero-desktop.jpg" />
  <Image src="/hero.jpg" alt="Hero" width={1200} height={600} />
</Picture>
```

## SEO (Head Component)

Declarative document head management.

```tsx
import { Head } from '@crax/seo'

function AboutPage() {
  return (
    <>
      <Head>
        <title>About - My App</title>
        <meta name="description" content="Learn about us" />
        <meta property="og:title" content="About - My App" />
        <meta property="og:description" content="Learn about us" />
        <meta property="og:image" content="/og/about.png" />
        <link rel="canonical" href="https://example.com/about" />
      </Head>
      <h1>About</h1>
    </>
  )
}
```

## View Transitions

Native browser page transitions via the View Transitions API.

```tsx
import { useViewTransition } from '@crax/hooks/use-view-transition'
import { Link } from '@crax/router'

function Nav() {
  const { startViewTransition } = useViewTransition()

  return (
    <>
      <Link to="/about" viewTransition>About</Link>
      <button onClick={() => startViewTransition(() => setState(next))}>
        Animate
      </button>
    </>
  )
}
```

## Configuration

`crax.config.mjs` at project root:

```js
export default {
  siteUrl: 'https://example.com',
  pagesDir: 'src/pages',
  pageExtensions: ['tsx'],

  images: {
    deviceSizes: [320, 640, 960, 1280],
    formats: ['webp', 'avif'],
    defaultProps: {
      sizes: '(max-width: 640px) 100vw, 640px',
      loading: 'lazy',
      decoding: 'async',
    },
  },

  og: {
    enabled: true,
    template: 'default',
    width: 1200,
    height: 630,
    font: 'Inter',
    outputDir: 'dist/og',
  },
}
```

## Data Fetching

React Query is pre-configured. Use it for all server state:

```tsx
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  if (isLoading) return <div>Loading...</div>
  return <div>{data.name}</div>
}
```

## Deployment

```bash
pnpm build
```

Output goes to `dist/`. Deploy to any static host. Dockerfile and Caddy config included.

```bash
# Docker
docker build -t my-app .
docker run -p 3000:80 my-app

# Static hosting (Vercel, Netlify, Cloudflare Pages)
# Just point to dist/ directory
```
