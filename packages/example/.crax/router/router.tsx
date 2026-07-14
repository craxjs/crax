import { lazy, Suspense, Fragment, type ReactNode, type ComponentType } from "react"
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  type RouteObject,
  type LoaderFunction,
} from "react-router-dom"
import { ErrorBoundary } from "./error-boundary"
import { routeImportMap } from "../utils/enhance-router"
import { wrapWithOgMeta } from "./og-meta"
import { wrapWithPwaMeta } from "./pwa-meta"
import {
  PAGE_GLOB,
  PAGES_DIR,
  stripExt,
  isComponentFile,
  isSpecialFile,
  isLayoutFile,
  filePathToRoutePath,
  getParentDir,
} from "./manifest"

/**
 * Default Suspense fallback used when a route (or the project) has no
 * `src/pages/loading.tsx`. Kept intentionally tiny — no external deps,
 * no layout assumptions — and respects prefers-reduced-motion via a
 * scoped `<style>` so the pulse animation drops out for users who opt out.
 */
function DefaultLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}
    >
      <span className="crax-loading-pulse" />
      <style>{`
        .crax-loading-pulse {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.35;
          animation: crax-loading-pulse 1s ease-in-out infinite;
        }
        @keyframes crax-loading-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.6; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .crax-loading-pulse { animation: none; }
        }
      `}</style>
    </div>
  )
}

type PageImporter = () => Promise<Record<string, unknown>>

const PAGES = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => !isSpecialFile(key) && !isLayoutFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const path = filePathToRoutePath(key)
      const importFn = fn as PageImporter
      routeImportMap.set(path, importFn)
      return [path, importFn]
    })
)

const LAYOUTS = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => isLayoutFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const dir = stripExt(key.replace(PAGES_DIR, "")).replace(/\/layout$/, "")
      return [dir, fn as () => Promise<{ default: ComponentType<{ children?: ReactNode }> }>]
    })
)

const SPECIALS = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => isSpecialFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const name = stripExt(key.replace(PAGES_DIR, ""))
      return [name, fn as () => Promise<{ default: ComponentType }>]
    })
)

const NotFoundImporter: (() => Promise<{ default: ComponentType }>) | undefined = SPECIALS["not-found"]
// React.lazy (not route.lazy) on purpose: this needs to be a plain, reusable
// ComponentType we can hand to both the custom render-time <ErrorBoundary>
// below and React Router's own per-route `ErrorBoundary` field, which
// catches loader/action errors that never reach a React error boundary.
const ErrorSpecial = SPECIALS["error"] ? lazy(SPECIALS["error"]) : null
const LoadingSpecial = SPECIALS["loading"] ? lazy(SPECIALS["loading"]) : null

// A user-provided src/pages/loading.tsx always wins over the built-in fallback.
// This is now specifically the *initial-load* fallback (`hydrateFallbackElement`
// below) — with route.lazy, client-side navigations keep the current page
// mounted until the next route's module + loader resolve, so this only
// renders on first paint of a location the router hasn't matched before.
const loadingFallback: ReactNode = LoadingSpecial ? (
  <Suspense fallback={<DefaultLoadingFallback />}>
    <LoadingSpecial />
  </Suspense>
) : (
  <DefaultLoadingFallback />
)

/** Builds the `route.lazy` loader for a page: resolves the module, applies OG/PWA wrapping, and attaches `loader` only when the page actually exports one */
function createPageLazy({
  path,
  importFn,
}: {
  path: string
  importFn: PageImporter
}): () => Promise<{ Component: ComponentType; loader?: LoaderFunction }> {
  return async () => {
    const mod = await importFn()
    const base = mod.default as ComponentType
    const pwaWrapped = wrapWithPwaMeta({ Component: base })
    const Component = wrapWithOgMeta({ mod, Component: pwaWrapped, routePath: path })
    const loader = typeof mod.loader === "function" ? (mod.loader as LoaderFunction) : undefined
    return loader ? { Component, loader } : { Component }
  }
}

function buildRoutes(): RouteObject[] {
  const grouped = new Map<string | null, Array<{ path: string; importFn: PageImporter }>>()

  for (const [path, importFn] of Object.entries(PAGES)) {
    const dir = getParentDir(path)
    const singleSegment = path.replace(/^\//, "")
    const layoutKey = dir && LAYOUTS[dir] ? dir : !dir && LAYOUTS[singleSegment] ? singleSegment : null
    if (!grouped.has(layoutKey)) grouped.set(layoutKey, [])
    grouped.get(layoutKey)!.push({ path, importFn })
  }

  const routes: RouteObject[] = []

  for (const [dir, pages] of grouped) {
    if (dir === null) {
      for (const page of pages) {
        routes.push({
          path: page.path,
          lazy: createPageLazy(page),
          hydrateFallbackElement: loadingFallback,
          ErrorBoundary: ErrorSpecial ?? undefined,
        })
      }
      continue
    }

    const layoutImportFn = LAYOUTS[dir]
    const children: RouteObject[] = pages.map((page) => {
      const isIndex = page.path === `/${dir}`
      const childPath = isIndex ? undefined : page.path.replace(`/${dir}/`, "")
      const base = {
        lazy: createPageLazy(page),
        hydrateFallbackElement: loadingFallback,
        ErrorBoundary: ErrorSpecial ?? undefined,
      }
      return isIndex ? { index: true, ...base } : { path: childPath, ...base }
    })

    routes.push({
      path: `/${dir}`,
      lazy: async () => {
        const mod = await layoutImportFn()
        const Layout = mod.default
        return {
          Component: () => (
            <Layout>
              <Outlet />
            </Layout>
          ),
        }
      },
      hydrateFallbackElement: loadingFallback,
      ErrorBoundary: ErrorSpecial ?? undefined,
      children,
    })
  }

  routes.push({
    path: "*",
    lazy: async () => {
      if (!NotFoundImporter) return { Component: Fragment }
      const mod = await NotFoundImporter()
      return { Component: mod.default }
    },
    hydrateFallbackElement: loadingFallback,
    ErrorBoundary: ErrorSpecial ?? undefined,
  })

  return routes
}

// Created once at module scope, not per-render: `createBrowserRouter` owns
// browser history — recreating it on every CraxRouter render (e.g. inside a
// hook) would reset navigation state and attach duplicate history listeners.
const router = createBrowserRouter(buildRoutes())

export function CraxRouter() {
  return (
    <ErrorBoundary fallback={ErrorSpecial ?? Fragment}>
      {/* Last-resort boundary — catches render errors outside the data
          router's own reach (e.g. while a HydrateFallback itself renders).
          The route-level `ErrorBoundary` field above normally handles
          loader/render errors first since it's the nearer boundary. */}
      <Suspense fallback={loadingFallback}>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  )
}
