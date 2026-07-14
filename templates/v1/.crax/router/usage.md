# @crax/router

File-based routing for Vite + React, inspired by Next.js. Wraps `react-router-dom` — users never import from it directly.

## Install

Built into this project under `crax/router`. No install needed.

## Quick Start

```tsx
import { CraxRouter } from "@crax/router"
import { AuthProvider } from "@/contexts"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <CraxRouter />
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  )
}
```

## Exports

```tsx
import {
  CraxRouter,
  Link,
  Navigate,
  Outlet,
  useRouter,
  prefetch,
  useLoaderData,
  useNavigation,
  getRoutes,
} from "@crax/router"
```

| Export | Purpose |
|--------|---------|
| `<CraxRouter>` | App wrapper — discovers pages, builds a data router, renders |
| `<Link>` | Client-side navigation |
| `<Navigate>` | Declarative redirect (e.g. auth guards) |
| `<Outlet>` | Layout child rendering |
| `useRouter()` | Programmatic nav + location + params |
| `prefetch({ path })` | Manually warm a route's chunk ahead of `router.push()` |
| `useLoaderData()` | Read the data returned by a page's `loader` export |
| `useNavigation()` | Read in-flight navigation state (e.g. to build a progress indicator) |
| `getRoutes()` | Enumerate every discovered route at call time — for SSG/prerender tooling |

## File Conventions

Pages go in `src/pages/`. Each file maps to a URL:

```
src/pages/
├── page.tsx               → /
├── login.tsx              → /login
├── dashboard/
│   ├── layout.tsx         → (wraps all /dashboard/*)
│   ├── page.tsx           → /dashboard
│   └── settings.tsx       → /dashboard/settings
├── products/
│   ├── page.tsx           → /products
│   ├── [id].tsx           → /products/:id
│   └── components/        → (ignored by router)
│       └── product-card.tsx
├── not-found.tsx          → * (404 catch-all)
├── error.tsx              → (global error boundary fallback)
└── loading.tsx            → (suspense fallback, applied per-route)
```

### Co-located Components

Any directory named `components` inside `src/pages/` is **excluded from route discovery**. This allows co-locating page-specific helper components alongside their pages without them becoming routes:

```
src/pages/products/
├── page.tsx               → /products (route)
├── [id].tsx               → /products/:id (route)
└── components/            → NOT routes
    ├── product-card.tsx
    └── product-filters.tsx
```

Import them with relative paths or aliases:

```tsx
// From src/pages/products/page.tsx
import { ProductCard } from "./components/product-card"
```

### Dynamic Routes

Use `[param]` in file names:

- `products/[id].tsx` → `/products/:id`
- Access via `useRouter().params.id`

### Catch-All Routes

Use `[...slug]`:

- `docs/[...slug].tsx` → `/docs/*`

### Layouts

Create a `layout.tsx` in any directory. It wraps all sibling pages via `<Outlet />`:

```tsx
import { Outlet } from "@crax/router"

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main><Outlet /></main>
    </div>
  )
}
```

### Loading & Suspense

`CraxRouter` builds a React Router **data router** (`createBrowserRouter` + `<RouterProvider>`), and every page/layout is code-split via `route.lazy`. This changes what `loading.tsx` means:

- **Client-side navigation** (clicking a `<Link>`, calling `router.push()`) keeps the **current page mounted and visible** until the next route's module (and `loader`, if it has one) resolves. There is no fallback flash — this is intentional, and matches how most production apps want navigation to feel. Build a progress indicator with `useNavigation()` if you want feedback during the wait.
- **Initial load** (the first time the router matches a location — a hard refresh, a deep link, or the first paint of the app) shows `loading.tsx` while the matched route's module/loader resolves, since there's no previous page to keep showing yet.

Drop a `src/pages/loading.tsx` to use your own fallback for that initial-load case; without one, Crax renders a small built-in pulse indicator (no external deps, respects `prefers-reduced-motion`). There's also a top-level `Suspense` around the whole router as a last-resort catch for render errors outside the data router's own reach.

### Special Files

| File | Purpose |
|------|---------|
| `not-found.tsx` | 404 page (catch-all route) |
| `error.tsx` | Error boundary fallback |
| `loading.tsx` | Suspense loading fallback (per-route, see below) |

## useRouter()

Unified hook for navigation, location, and route params:

```tsx
import { useRouter } from "@crax/router"

function MyPage() {
  const router = useRouter()

  // Navigation
  router.push("/dashboard")
  router.replace("/login")
  router.back()

  // Location
  console.log(router.pathname)       // "/dashboard/settings"
  console.log(router.searchParams)   // URLSearchParams

  // Dynamic params
  console.log(router.params)         // { id: "123" }
}
```

Programmatic navigation via `router.push()` doesn't prefetch on its own. Warm the route first with `prefetch()` when you know where the user is headed (e.g. right before a form submit that redirects):

```tsx
import { useRouter, prefetch } from "@crax/router"

async function onSubmit() {
  prefetch({ path: "/dashboard" })
  await saveForm()
  router.push("/dashboard")
}
```

## Route Loaders

Export an async `loader` alongside a page's default export to fetch data before the route renders:

```tsx
// src/pages/users/[id].tsx
import { useLoaderData } from "@crax/router"

export async function loader({ params }: { params: { id: string } }) {
  const user = await fetch(`/api/users/${params.id}`).then((r) => r.json())
  return { user }
}

export default function UserPage() {
  const { user } = useLoaderData() as { user: { name: string } }
  return <h1>{user.name}</h1>
}
```

- `loader` is optional — pages without one work exactly as before.
- `loader` receives `{ params, request }` (React Router's `LoaderFunctionArgs`); the example above only needs `params`.
- Read the result with `useLoaderData()` (re-exported from `@crax/router`, not `react-router-dom` — keep imports scoped to `@crax/router` everywhere in your pages).
- See [Loading & Suspense](#loading--suspense) above for how `loader` interacts with navigation: the previous page stays visible while a `loader` runs, so there's no need to hand-roll an `isLoading` flag for route-level data the way you would with `useQuery`.
- Loaders and React Query serve different purposes: use React Query for data shared across components, cached between navigations, or polled; use a `loader` for data required before a specific route renders.

## Link

`<Link>` wraps react-router-dom's `Link`. Uses `to` prop:

```tsx
import { Link } from "@crax/router"

<Link to="/dashboard">Dashboard</Link>

// Replace history entry
<Link to="/login" replace>Sign In</Link>
```

### Hover prefetch

Every `<Link>` (both `smart` and `foresight` strategies) also warms its route's chunk on `onPointerEnter`, `onFocus`, and `onPointerDown` — hovering, tabbing to, or pressing down on a link fires the prefetch immediately, well before the click/navigation completes. `smart` additionally keeps its IntersectionObserver (100px viewport margin) as a baseline for links that are never hovered. All triggers share one dedupe set keyed by path, so a link that's hovered, focused, and scrolled into view still only fetches its chunk once.

Prefetching goes through the same `prefetch({ path })` helper exported from `@crax/router`, so you can call it manually for programmatic navigation (see `useRouter()` above) — it dedupes against the same set the `<Link>` triggers use.

### `viewTransition`

`<Link viewTransition>` is automatically disabled when the user's OS has `prefers-reduced-motion: reduce` set, regardless of the prop value passed.

## getRoutes()

Enumerates every discovered page route — for SSG/prerender tooling that needs to walk the full route list (crawl every route to pre-render HTML, generate a sitemap, etc.):

```tsx
import { getRoutes } from "@crax/router"

const routes = getRoutes()
// [{ path: "/", filePath: "/src/pages/page.tsx", isDynamic: false },
//  { path: "/products/:id", filePath: "/src/pages/products/[id].tsx", isDynamic: true },
//  ...]
```

It's a function, not a constant — call it fresh whenever you need the route list rather than caching its result at module scope. Layouts and special files (`layout.tsx`, `not-found.tsx`, `error.tsx`, `loading.tsx`) are excluded; only actual page routes are returned. `isDynamic` is `true` for routes with a `:param` or `*` catch-all segment — useful for deciding which routes need per-instance handling (e.g. fetching a list of IDs to prerender) versus which can be prerendered as-is.

## Auth Example

Auth logic lives in the layout, not the router:

```tsx
import { Navigate, Outlet } from "@crax/router"
import { useAuth } from "@/contexts"

export default function DashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  )
}
```

## Page Structure Example

```
src/pages/
├── page.tsx                  → / (landing page, no layout)
├── login.tsx                 → /login (no layout)
├── dashboard/
│   ├── layout.tsx            → sidebar + auth gate
│   ├── page.tsx              → /dashboard
│   └── settings.tsx          → /dashboard/settings
├── products/
│   ├── page.tsx              → /products
│   └── components/           → (ignored, not routes)
│       └── product-card.tsx
├── not-found.tsx             → 404
├── error.tsx                 → error fallback
└── loading.tsx               → loading spinner
```

Only pages under `dashboard/` get the sidebar layout. All other pages render directly.
Directories named `components/` are excluded from route discovery.

## OG Image Auto-Injection

Pages can export `ogImage` metadata to automatically inject Open Graph `<meta>` tags:

```tsx
// src/pages/about.tsx
export const ogImage = {
  title: "About Us",
  description: "Learn more about our team and mission.",
}

export default function AboutPage() {
  return <h1>About</h1>
}
```

The router detects this export and wraps the page with a `<Head>` that injects:

```html
<meta property="og:image" content="https://example.com/og/about.png" />
<meta property="og:title" content="About Us" />
<meta property="og:description" content="Learn more about our team and mission." />
```

### How It Works

- **Detection**: At build time, the router checks each page module for an `ogImage` export
- **URL construction**: `{siteUrl}/og/{route}.png` (uses `siteUrl` from `crax.config.mjs`)
- **Index routes**: `/` maps to `/og.png`, `/about` maps to `/og/about.png`
- **Deduplication**: If the page also renders its own `<Head>`, unhead deduplicates by property name — no conflicts
- **Graceful skip**: Pages without `ogImage` render normally with zero overhead

### Image Generation

OG images are generated to `dist/og/` during build. Configure in `crax.config.mjs`:

```js
export default {
  siteUrl: "https://yoursite.com",
  og: {
    enabled: true,
    template: "default",
    width: 1200,
    height: 630,
    font: "Inter",
    outputDir: "dist/og",
  },
}
```
