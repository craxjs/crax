import { lazy, Suspense, useMemo, Fragment, type ReactNode, type ComponentType } from "react"
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import { ErrorBoundary } from "./error-boundary"
import { routeImportMap } from "../utils/enhance-router"
import { createOgAwareLazy } from "./og-meta"
import { createPwaAwareLazy } from "./pwa-meta"

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

const PAGE_GLOB = import.meta.glob("/src/pages/**/*.{tsx,mdx}")

const PAGES_DIR = "/src/pages/"
const EXT_RE = /\.(tsx|mdx)$/

function stripExt(path: string): string {
  return path.replace(EXT_RE, "")
}

function isComponentFile(filePath: string): boolean {
  return filePath.replace(PAGES_DIR, "").split("/").some((s) => s === "components")
}

function isSpecialFile(filePath: string): boolean {
  const name = stripExt(filePath.replace(PAGES_DIR, ""))
  return name === "not-found" || name === "error" || name === "loading"
}

function isLayoutFile(filePath: string): boolean {
  const last = filePath.replace(PAGES_DIR, "").split("/").at(-1) ?? ""
  return last === "layout.tsx" || last === "layout.mdx"
}

function filePathToRoutePath(filePath: string): string {
  const path = stripExt(filePath.replace(PAGES_DIR, ""))
    .replace(/\/page$/, "")
    .replace(/\[\.{3}.+\]/, "*")
    .replace(/\[(.+)\]/, ":$1")
  if (path === "page") return "/"
  return `/${path}`
}

function getParentDir(routePath: string): string | null {
  const segments = routePath.replace(/^\//, "").split("/")
  if (segments.length <= 1 || segments[0] === "") return null
  return segments[0]
}

const PAGES = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => !isSpecialFile(key) && !isLayoutFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const path = filePathToRoutePath(key)
      const importFn = fn as () => Promise<Record<string, unknown>>
      routeImportMap.set(path, importFn)
      return [path, createOgAwareLazy(createPwaAwareLazy(importFn), path)]
    })
)

const LAYOUTS = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => isLayoutFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const dir = stripExt(key.replace(PAGES_DIR, "")).replace(/\/layout$/, "")
      return [dir, lazy(fn as () => Promise<{ default: ComponentType<{ children?: ReactNode }> }>)]
    })
)

const SPECIALS = Object.fromEntries(
  Object.entries(PAGE_GLOB)
    .filter(([key]) => isSpecialFile(key) && !isComponentFile(key))
    .map(([key, fn]) => {
      const name = stripExt(key.replace(PAGES_DIR, ""))
      return [name, lazy(fn as () => Promise<{ default: ComponentType }>)]
    })
)

export function CraxRouter() {
  const NotFound = SPECIALS["not-found"] ?? Fragment
  const ErrorFallback = SPECIALS["error"] ?? Fragment
  const Loading = SPECIALS["loading"]
  // A user-provided src/pages/loading.tsx always wins over the built-in fallback
  const loadingFallback = Loading ? <Loading /> : <DefaultLoadingFallback />

  const routeElements = useMemo(() => {
    const grouped = new Map<string | null, Array<{ path: string; component: ComponentType }>>()

    for (const [path, component] of Object.entries(PAGES)) {
      const dir = getParentDir(path)
      const singleSegment = path.replace(/^\//, "")
      const layoutKey =
        dir && LAYOUTS[dir] ? dir : !dir && LAYOUTS[singleSegment] ? singleSegment : null
      if (!grouped.has(layoutKey)) grouped.set(layoutKey, [])
      grouped.get(layoutKey)!.push({ path, component })
    }

    const elements: ReactNode[] = []

    // Each leaf page gets its own Suspense boundary so a cache-miss navigation
    // only ever suspends that page's slot — never the whole app, never a
    // parent layout (which lives outside this boundary, see below).
    for (const [dir, pages] of grouped) {
      if (dir === null) {
        for (const page of pages) {
          const Comp = page.component
          elements.push(
            <Route
              key={page.path}
              path={page.path}
              element={<Suspense fallback={loadingFallback}><Comp /></Suspense>}
            />
          )
        }
      } else {
        const Layout = LAYOUTS[dir]
        const children = pages.map((page) => {
          const Comp = page.component
          const isIndex = page.path === `/${dir}`
          const childPath = isIndex ? undefined : page.path.replace(`/${dir}/`, "")
          const element = <Suspense fallback={loadingFallback}><Comp /></Suspense>
          return isIndex ? (
            <Route key={page.path} index element={element} />
          ) : (
            <Route key={page.path} path={childPath} element={element} />
          )
        })
        elements.push(
          // Suspense here only guards the Layout's own lazy load (first mount).
          // Child pages suspend inside their own boundary above, rendered via
          // <Outlet />, so switching pages never unmounts the layout.
          <Route
            key={dir}
            path={`/${dir}`}
            element={
              <Suspense fallback={loadingFallback}>
                <Layout>
                  <Outlet />
                </Layout>
              </Suspense>
            }
          >
            {children}
          </Route>
        )
      }
    }

    return elements
  }, [loadingFallback])

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      {/* Last-resort boundary for the initial load — per-route Suspense above
          normally catches suspensions first since it's the nearer boundary. */}
      <Suspense fallback={loadingFallback}>
        <BrowserRouter>
          <Routes>
            {routeElements}
            <Route path="*" element={<Suspense fallback={loadingFallback}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  )
}
