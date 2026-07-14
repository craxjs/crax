/**
 * Shared page-discovery primitives for the file-based router.
 *
 * `router.tsx` (the route tree `CraxRouter` renders) and `get-routes.ts`
 * (the `getRoutes()` introspection API for SSG/prerender tooling) both need
 * to turn the same `src/pages/**` glob into route paths. Extracted here so
 * there is exactly one definition of "what counts as a page" — if the two
 * consumers derived routes independently, they could drift and silently
 * break prerendering (a route the router serves but `getRoutes()` never
 * reports, or vice versa).
 */

export const PAGE_GLOB = import.meta.glob("/src/pages/**/*.{tsx,mdx}")

export const PAGES_DIR = "/src/pages/"

const EXT_RE = /\.(tsx|mdx)$/

export function stripExt(path: string): string {
  return path.replace(EXT_RE, "")
}

export function isComponentFile(filePath: string): boolean {
  return filePath.replace(PAGES_DIR, "").split("/").some((s) => s === "components")
}

export function isSpecialFile(filePath: string): boolean {
  const name = stripExt(filePath.replace(PAGES_DIR, ""))
  return name === "not-found" || name === "error" || name === "loading"
}

export function isLayoutFile(filePath: string): boolean {
  const last = filePath.replace(PAGES_DIR, "").split("/").at(-1) ?? ""
  return last === "layout.tsx" || last === "layout.mdx"
}

export function filePathToRoutePath(filePath: string): string {
  const path = stripExt(filePath.replace(PAGES_DIR, ""))
    .replace(/\/page$/, "")
    .replace(/\[\.{3}.+\]/, "*")
    .replace(/\[(.+)\]/, ":$1")
  if (path === "page") return "/"
  return `/${path}`
}

export function getParentDir(routePath: string): string | null {
  const segments = routePath.replace(/^\//, "").split("/")
  if (segments.length <= 1 || segments[0] === "") return null
  return segments[0]
}
