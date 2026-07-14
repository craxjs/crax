import { routeImportMap } from '../utils/enhance-router'

/**
 * Paths whose lazy route chunk has already been warmed.
 * Module-level so every Link instance (and any manual `prefetch()` call)
 * shares one dedupe set — repeated hovers, focus events, or intersection
 * re-entries on the same path never re-trigger the dynamic import.
 */
const prefetchedPaths = new Set<string>()

/** Extracts a route path string from react-router-dom's `to` prop, which is either a string or a partial Path object */
export function getPathFromTo(to: string | { pathname?: string }): string {
  return typeof to === 'string' ? to : (to?.pathname ?? '')
}

/**
 * Warms a route's lazy chunk ahead of navigation by calling its dynamic import().
 * Shared by SmartLink (viewport/hover/focus/pointerdown) and ForesightLink
 * (trajectory prediction/pointerdown) so all triggers dedupe through the same
 * `prefetchedPaths` set, and exported publicly so callers navigating via
 * `router.push()` can warm the target route first.
 *
 * Failures are swallowed (fire-and-forget): a flaky prefetch shouldn't crash
 * the app, and the path is un-marked so a later attempt (or the real
 * navigation's own lazy() import) can retry.
 */
export async function prefetchRoute({ path }: { path: string }): Promise<void> {
  if (!path || prefetchedPaths.has(path)) return
  const importer = routeImportMap.get(path)
  if (!importer) return

  prefetchedPaths.add(path)
  try {
    await importer()
  } catch (error) {
    prefetchedPaths.delete(path)
    console.warn(`[crax] prefetch failed for "${path}":`, error)
  }
}
