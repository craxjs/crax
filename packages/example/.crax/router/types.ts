import type { ComponentType } from "react"

/** A discovered page route */
export type PageRoute = {
  /** URL path (e.g., "/dashboard/settings") */
  path: string
  /** Lazy-loaded component factory */
  component: () => Promise<{ default: ComponentType }>
}

/** A discovered layout (wraps sibling routes) */
export type LayoutRoute = {
  /** Directory this layout belongs to (e.g., "dashboard") */
  dir: string
  /** Eagerly loaded layout component */
  component: ComponentType<{ children: React.ReactNode }>
}

/** Special files eagerly loaded for the whole app */
export type SpecialFiles = {
  layout: ComponentType<{ children: React.ReactNode }> | null
  notFound: ComponentType | null
  error: ComponentType | null
  loading: ComponentType | null
}

/** return type of useRouter() */
export type CraxRouter = {
  /** Navigate to a path (pushes to history) */
  push: (path: string) => void
  /** Navigate to a path (replaces history entry) */
  replace: (path: string) => void
  /** Go back in history */
  back: () => void
  /** Current pathname */
  pathname: string
  /** Current URL search params */
  searchParams: URLSearchParams
  /** Dynamic route params (e.g., { id: "123" }) */
  params: Record<string, string | undefined>
}

export type { CraxLinkProps } from './link'
