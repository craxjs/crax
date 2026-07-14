# Data Fetching

Crax pre-configures React Query in every new project. No setup required.

## React Query

A `QueryClient` is configured in `src/App.tsx` with sensible defaults:

* `staleTime`: 60 seconds, cached data stays fresh for a minute before refetching
* `retry`: 1, failed requests retry once before erroring

React Query DevTools are included and open with the toggle in the bottom corner during development.

```tsx
// src/App.tsx, already set up for you
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60, retry: 1 },
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

## Fetching data in a page

```tsx
import { useQuery } from '@tanstack/react-query'

export default function UsersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  })

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error loading users.</p>

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

## Mutations

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function CreateUserForm() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (name: string) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return (
    <button onClick={() => mutation.mutate('New User')}>
      {mutation.isPending ? 'Creating...' : 'Create User'}
    </button>
  )
}
```

## Route-level data loading

For data that should load before a page renders, use Crax's `loader` pattern (built on React Router's data router). Add a `loader` export alongside your default page component and read it with `useLoaderData` — both from `@crax/router`, not `react-router-dom`:

```tsx
// src/pages/users/[id].tsx
import { useLoaderData } from '@crax/router'

export async function loader({ params }: { params: { id: string } }) {
  const user = await fetch(`/api/users/${params.id}`).then(r => r.json())
  return { user }
}

export default function UserPage() {
  const { user } = useLoaderData() as { user: { name: string } }
  return <h1>{user.name}</h1>
}
```

`loader` is optional — pages without one work exactly as before. When present, it runs before the page mounts. Client-side navigation (`<Link>`, `router.push()`) keeps the *previous* page visible while the loader runs — there's no flash to a loading state, so unlike `useQuery` there's no `isLoading` to manage. Use `useNavigation()` from `@crax/router` if you want to show in-flight navigation feedback (e.g. a top progress bar). On the initial load of a location (a hard refresh or deep link, where there's no previous page to keep showing), Crax shows `src/pages/loading.tsx` (or its built-in fallback) while the loader resolves — see [Routing](/crax/guide/features/routing.md) for details.

If the loader throws, the nearest `error.tsx` handles it the same way it handles render errors.

React Query and loaders serve different purposes. Use React Query for data shared across components, cached between navigations, or polled. Use loaders for data required before a specific route renders.

### Paginated routes

A loader reads `request.url` (a standard `Request`), so a page can page itself off the query string instead of a dynamic segment:

```tsx
// src/pages/users/index.tsx
import { useLoaderData, Link } from '@crax/router'

export async function loader({ request }: { request: Request }) {
  const page = new URL(request.url).searchParams.get('page') ?? '1'
  const users = await fetch(`/api/users?page=${page}`).then(r => r.json())
  return { users, page: Number(page) }
}

export default function UsersPage() {
  const { users, page } = useLoaderData() as { users: { id: string; name: string }[]; page: number }

  return (
    <>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <Link to={`/users?page=${page + 1}`}>Next page</Link>
    </>
  )
}
```

Navigating to `?page=2` re-runs the loader (the query string is part of the location) while the current page stays mounted until the new data resolves.
