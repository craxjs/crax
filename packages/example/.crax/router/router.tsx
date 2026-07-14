import { lazy, Suspense, useMemo, Fragment, type ReactNode, type ComponentType } from "react"
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom"
import { ErrorBoundary } from "./error-boundary"
import { routeImportMap } from "../utils/enhance-router"
import { createOgAwareLazy } from "./og-meta"
import { createPwaAwareLazy } from "./pwa-meta"

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

    for (const [dir, pages] of grouped) {
      if (dir === null) {
        for (const page of pages) {
          const Comp = page.component
          elements.push(<Route key={page.path} path={page.path} element={<Comp />} />)
        }
      } else {
        const Layout = LAYOUTS[dir]
        const children = pages.map((page) => {
          const Comp = page.component
          const isIndex = page.path === `/${dir}`
          const childPath = isIndex ? undefined : page.path.replace(`/${dir}/`, "")
          return isIndex ? (
            <Route key={page.path} index element={<Comp />} />
          ) : (
            <Route key={page.path} path={childPath} element={<Comp />} />
          )
        })
        elements.push(
          <Route key={dir} path={`/${dir}`} element={<Layout><Outlet /></Layout>}>
            {children}
          </Route>
        )
      }
    }

    return elements
  }, [])

  const NotFound = SPECIALS["not-found"] ?? Fragment
  const ErrorFallback = SPECIALS["error"] ?? Fragment
  const Loading = SPECIALS["loading"]

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Suspense fallback={Loading ? <Loading /> : <div />}>
        <BrowserRouter>
          <Routes>
            {routeElements}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
  )
}
