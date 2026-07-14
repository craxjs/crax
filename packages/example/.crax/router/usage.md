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
import { CraxRouter, Link, Navigate, Outlet, useRouter } from "@crax/router"
```

| Export | Purpose |
|--------|---------|
| `<CraxRouter>` | App wrapper — discovers pages, builds routes, renders |
| `<Link>` | Client-side navigation |
| `<Navigate>` | Declarative redirect (e.g. auth guards) |
| `<Outlet>` | Layout child rendering |
| `useRouter()` | Programmatic nav + location + params |

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
└── loading.tsx            → (global suspense fallback)
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

### Special Files

| File | Purpose |
|------|---------|
| `not-found.tsx` | 404 page (catch-all route) |
| `error.tsx` | Error boundary fallback |
| `loading.tsx` | Suspense loading fallback |

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

## Link

`<Link>` wraps react-router-dom's `Link`. Uses `to` prop:

```tsx
import { Link } from "@crax/router"

<Link to="/dashboard">Dashboard</Link>

// Replace history entry
<Link to="/login" replace>Sign In</Link>
```

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
