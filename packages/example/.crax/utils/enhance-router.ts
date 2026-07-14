/**
 * Registry of route path -> lazy import(), populated by the router as it
 * discovers pages. Shared with router/prefetch.ts so Link hover/focus/
 * pointerdown/intersection triggers (and the public `prefetch()` export)
 * can warm a route's chunk without duplicating the page discovery logic.
 */
export const routeImportMap = new Map<string, () => Promise<Record<string, unknown>>>();
