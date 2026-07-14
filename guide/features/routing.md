# Routing

Pages live in `src/pages/`. Each file maps directly to a URL:

| File | Route |
|------|-------|
| `src/pages/page.tsx` | `/` |
| `src/pages/about.tsx` | `/about` |
| `src/pages/blog/page.tsx` | `/blog` |
| `src/pages/users/[id].tsx` | `/users/:id` |
| `src/pages/shop/[...all].tsx` | `/shop/*` |

Export a default React component from any of these files and it becomes a route. Layouts, loading states, and error boundaries follow the same convention.

## Special Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared layout for a directory |
| `not-found.tsx` | 404 page |
| `error.tsx` | Error boundary fallback |
| `loading.tsx` | Suspense fallback |

## Layouts

Create a `layout.tsx` file in any directory to wrap all sibling and nested routes.

```
src/pages/
  ├── dashboard/
  │   ├── layout.tsx      # Wraps all /dashboard/* routes
  │   ├── page.tsx        # Renders at /dashboard
  │   └── settings.tsx    # Renders at /dashboard/settings
  └── page.tsx            # Renders at /
```

The layout component must render `<Outlet />` to show the active child route:

```tsx
// src/pages/dashboard/layout.tsx
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  return (
    <div className="flex">
      <nav className="w-64 bg-gray-800 text-white p-4">
        {/* sidebar */}
      </nav>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

## Navigation

Use the `Link` component from `@crax/router` for client-side navigation with prefetching:

```tsx
import { Link } from '@crax/router'

// Smart prefetch (default), triggers when link enters viewport
<Link to="/dashboard">Dashboard</Link>

// Foresight, predicts user intent from cursor movement
<Link to="/pricing" prefetch="foresight">Pricing</Link>

// None, plain client-side navigation
<Link to="/terms" prefetch="none">Terms</Link>
```

## useRouter

Access router state and navigate programmatically:

```tsx
import { useRouter } from '@crax/router'

function MyComponent() {
  const router = useRouter()

  return (
    <button onClick={() => router.push('/dashboard')}>
      Go to Dashboard
    </button>
  )
}
```
