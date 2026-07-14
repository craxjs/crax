import { createHead } from '@unhead/react/client'

/**
 * WHY internal: `@unhead/react`'s `<Head>`/`useHead` need a `head` instance
 * provided via `UnheadProvider` somewhere above them in the tree. That's
 * framework plumbing, not something a project should hand-wire in
 * `main.tsx` — one more setup step users can forget or get wrong. Crax
 * creates the instance once here and `router/router.tsx` wraps
 * `<RouterProvider>` with it, so `<Head>`/`useHead` only work when rendered
 * under `CraxRouter` (i.e. inside a page or layout) — never above it.
 */
export const head = createHead()
