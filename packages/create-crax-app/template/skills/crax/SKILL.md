---
name: crax
description: "Crax framework skill. Use when working with a Crax project: writing pages, components, routing, state management, image optimization, SEO, deployment, or modifying framework source in .crax/. Triggers on file-based routing, createStore, useStore, Link prefetching, Head component, Image/Picture, useRouter, view transitions, crax.config.mjs, or any .crax/ source modification."
user-invocable: false
---

# Crax

A lightweight React framework built on Vite. Frontend-only, no SSR. Framework source ships into your project under `.crax/` — read it, modify it, delete what you don't use.

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
| `loading.tsx` | Shown while route loads (per-route Suspense; layout stays mounted) |
| `error.tsx` | Error boundary for route |
| `not-found.tsx` | 404 page |

Every page and layout renders inside its own `Suspense` boundary, so a cache-miss navigation only suspends that route's slot, not the whole app or its parent layout. No `loading.tsx`? Crax falls back to a tiny built-in pulse indicator.

**Layout example:**

```tsx
// src/pages/dashboard/layout.tsx
import { Outlet } from '@crax/router'

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

## Link Component

Extends React Router's `Link` with prefetching and view transitions.

```tsx
import { Link } from '@crax/router'

// Smart (default): prefetch on hover/focus/pointerdown, or when link enters viewport
<Link to="/dashboard">Dashboard</Link>

// Foresight: hover + cursor trajectory prediction (+ pointerdown fallback)
<Link to="/pricing" prefetch="foresight">Pricing</Link>

// None: plain react-router link, no prefetch
<Link to="/terms" prefetch="none">Terms</Link>

// With view transition (auto-disabled if the OS prefers reduced motion)
<Link to="/about" viewTransition>About</Link>
```

**Prefetch strategies:**

| Strategy | Behavior |
|----------|----------|
| `smart` | Prefetch on hover, focus, or pointerdown; also when link enters viewport (100px margin) as a baseline |
| `foresight` | Predict intent from cursor trajectory; hover and pointerdown also prefetch directly |
| `none` | No prefetching, plain react-router link |

All triggers share one dedupe set keyed by route path — a link that's hovered, focused, and scrolled into view only fetches its chunk once. Call the exported `prefetch({ path })` to warm a route manually (e.g. before `router.push()`); it dedupes against the same set.

**Additional props:** `hitSlop`, `unregisterOnCallback`, `name` (for foresight tracking).

## useRouter Hook

Unified router hook wrapping `useNavigate`, `useLocation`, and `useParams`.

```tsx
import { useRouter } from '@crax/router'

function Navigation() {
  const router = useRouter()

  return (
    <div>
      <p>Current path: {router.pathname}</p>
      <p>Query: {router.searchParams.get('q')}</p>
      <p>User ID: {router.params.id}</p>
      <button onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
      <button onClick={() => router.replace('/login')}>Replace with Login</button>
      <button onClick={() => router.back()}>Go Back</button>
    </div>
  )
}
```

**API:**

| Method | Description |
|--------|-------------|
| `router.push(path)` | Navigate to path |
| `router.replace(path)` | Replace current history entry |
| `router.back()` | Go back one step |
| `router.pathname` | Current path string |
| `router.searchParams` | `URLSearchParams` for current query |
| `router.params` | Route params (`Record<string, string \| undefined>`) |

## State Management

Global state built on `useSyncExternalStore`. No providers, no boilerplate, no re-render pitfalls.

### Store Organization

**Small projects** — one file `src/stores/index.ts`:

```tsx
// src/stores/index.ts
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

### createStore

```tsx
import { createStore } from '@crax/store'

// Primitive store
const themeStore = createStore<'light' | 'dark'>('light')

// Object store
const userStore = createStore({
  name: '',
  email: '',
  isLoggedIn: false,
})

// With config (history tracking)
const counterStore = createStore(0, { maxHistorySize: 20 })
```

### useStore

Returns `[state, setState]` tuple, same API as `useState`.

```tsx
import { useStore } from '@crax/store'

function ThemeToggle() {
  const [theme, setTheme] = useStore(themeStore)
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  )
}
```

**Updater supports functional updates:**

```tsx
const [count, setCount] = useStore(counterStore)
setCount(prev => prev + 1)
```

### useStoreEffect

Run side effects when stores change.

```tsx
import { useStoreEffect } from '@crax/store'

function Logger() {
  useStoreEffect(() => {
    console.log('Theme changed to:', themeStore.value)
  }, [themeStore])

  return null
}
```

### Store API

```tsx
const store = createStore(0)

store.value          // get current value
store.value = 5      // set value
store.update(prev => prev + 1)  // functional update
store.history        // previous states array
store.lock()         // returns symbol, prevents modifications
store.unlock(id)     // unlock with the symbol
store.subscribe(cb)  // subscribe to changes, returns unsubscribe fn
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
  <source
    media="(max-width: 640px)"
    srcSet="/hero-mobile.jpg"
  />
  <source
    media="(min-width: 641px)"
    srcSet="/hero-desktop.jpg"
  />
  <Image src="/hero.jpg" alt="Hero" width={1200} height={600} />
</Picture>
```

**Props (Image):** `src`, `alt`, `width`, `height`, `sizes`, `loading`, `decoding`, `className`, `priority` (eager load + high fetch priority + React 19 preload hint). `width`+`height` (or `aspectRatio`) are **required by the type system** unless `layout="fullWidth"` — this is a compile-time CLS guard, don't work around it with `as any`.

**Props (Picture):** `src` (vite-imagetools `?as=picture` import, or a plain string), `alt`, `width`, `height`, `className`, `loading`, `decoding`, `style`, `priority`, `placeholder`, plus any other native `<img>` attribute via passthrough. When `src` is a string, `width`+`height` are required (same CLS guard); when `src` is the vite-imagetools object, they're inferred from the import.

**Blur-up placeholder for local images:** `background="auto"` (Image) only works for CDN-recognized URLs. For local images, build a tiny inlined placeholder with vite-imagetools and pass it directly — the raw data-URI import is auto-wrapped in `url(...)`:

```tsx
import heroUrl from '@/assets/hero.jpg?w=1200&format=webp'
import heroBlur from '@/assets/hero.jpg?w=24&blur=3&format=webp&inline'

<Image src={heroUrl} width={1200} height={600} alt="Hero" background={heroBlur} />
<Picture src={heroImg} width={1200} height={600} alt="Hero banner" placeholder={heroBlur} />
```

See `.crax/image/usage.md` "Blur placeholder for local images" for the full directive breakdown.

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

**Supports:** `<title>`, `<meta>`, `<link>`, `<script>`, Open Graph, Twitter Cards, canonical URLs, language alternates, JSON-LD structured data.

## View Transitions

Native browser page transitions via the View Transitions API.

```tsx
import { useViewTransition } from '@crax/hooks/use-view-transition'
import { Link } from '@crax/router'

function Nav() {
  const { startViewTransition } = useViewTransition()

  const handleClick = () => {
    startViewTransition(() => {
      // state update that triggers the transition
    })
  }

  return (
    <>
      {/* Via Link prop */}
      <Link to="/about" viewTransition>About</Link>

      {/* Via hook */}
      <button onClick={handleClick}>Animate</button>
    </>
  )
}
```

**CSS for transitions:**

```css
/* src/index.css */
::view-transition-old(root) {
  animation: fade-out 0.2s ease-out;
}
::view-transition-new(root) {
  animation: fade-in 0.2s ease-in;
}
```

Falls back to a plain callback on unsupported browsers.

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

**Key fields:**

| Field | Default | Description |
|-------|---------|-------------|
| `siteUrl` | `https://example.com` | Base URL for SEO canonical URLs |
| `pagesDir` | `src/pages` | Directory for page files |
| `pageExtensions` | `['tsx']` | File extensions that become routes |
| `images.deviceSizes` | `[320, 640, 960, 1280]` | Declared, not yet wired anywhere — reserved for a future pass |
| `images.formats` | `['webp', 'avif']` | Only `formats[0]` is wired: `vite.config.ts` sets it as the default `format` directive for directive-less local image imports. Request multiple formats explicitly per-import with `?format=webp;avif&as=picture` |

## App Structure

Root component sets up providers:

```tsx
// src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CraxRouter } from '@crax/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CraxRouter />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Do not modify** `vite.config.ts` or `.crax/config.mjs` unless you know what you're doing.

## Data Fetching

React Query is pre-configured. Use it for all server state:

```tsx
import { useQuery, useMutation } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  })

  if (isLoading) return <div>Loading...</div>

  return <div>{data.name}</div>
}
```

Route-level data loading via React Router loaders is also supported.

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

## Common Patterns

### Multiple stores for related state

```tsx
const themeStore = createStore<'light' | 'dark'>('light')
const sidebarStore = createStore(true)
const notificationsStore = createStore<string[]>([])
```

### Store with complex updates

```tsx
const todosStore = createStore<{ id: number; text: string; done: boolean }[]>([])

function addTodo(text: string) {
  todosStore.update(prev => [
    ...prev,
    { id: Date.now(), text, done: false },
  ])
}

function toggleTodo(id: number) {
  todosStore.update(prev =>
    prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  )
}
```

### Conditional prefetching

```tsx
// Only prefetch critical routes
<Link to="/dashboard" prefetch="smart">Dashboard</Link>
<Link to="/settings" prefetch="none">Settings</Link>
```
