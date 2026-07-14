import {
  PAGE_GLOB,
  filePathToRoutePath,
  isComponentFile,
  isLayoutFile,
  isSpecialFile,
} from "./manifest"
import type { RouteDescriptor } from "./types"

function isDynamicRoutePath(path: string): boolean {
  return path.includes(":") || path.includes("*")
}

/**
 * Enumerates every discovered page route.
 *
 * A FUNCTION, not a module-scope constant — SSG/prerender tooling (crawl
 * every route to generate static HTML, build a sitemap, etc.) needs the
 * full route list resolved at call time, not a value computed once when
 * the router module first loaded and then silently reused. Recomputing
 * from the glob is cheap: it's a handful of string ops over an
 * already-resolved `import.meta.glob()` map, not a filesystem walk.
 *
 * Excludes layouts, special files (`not-found`/`error`/`loading`), and
 * anything under a co-located `components/` directory — none of those
 * are routes.
 */
export function getRoutes(): RouteDescriptor[] {
  return Object.keys(PAGE_GLOB)
    .filter((filePath) => !isSpecialFile(filePath) && !isLayoutFile(filePath) && !isComponentFile(filePath))
    .map((filePath) => {
      const path = filePathToRoutePath(filePath)
      return { path, filePath, isDynamic: isDynamicRoutePath(path) }
    })
}
