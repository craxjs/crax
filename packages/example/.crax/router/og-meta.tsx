import { type ComponentType } from 'react'
import { Head } from '../seo'
import config from '../config.mjs'

/** Shape of the `ogImage` export a page can provide */
type OgImageData = {
  title: string
  description: string
  template?: string
}

/** Build absolute OG image URL from route path, matching generator's naming convention */
function buildOgImageUrl({ routePath }: { routePath: string }): string {
  const siteUrl = config.siteUrl ?? 'https://example.com'
  // Route path to filename: / → page, /pokemon → pokemon-page, /blog/post → blog-post-page
  const segments = routePath.split('/').filter(Boolean)
  const fileName = segments.length === 0 ? 'page' : [...segments, 'page'].join('-')
  return `${siteUrl}/og/${fileName}.png`
}

/** Factory: wraps a Component with Head injecting OG meta tags */
function createOgMetaWrapper({
  ogImage,
  routePath,
  Component,
}: {
  ogImage: OgImageData
  routePath: string
  Component: ComponentType
}): ComponentType {
  const ogImageUrl = buildOgImageUrl({ routePath })

  return function OgMetaWrapper() {
    return (
      <>
        <Head>
          <meta property="og:image" content={ogImageUrl} />
          <meta property="og:title" content={ogImage.title} />
          <meta property="og:description" content={ogImage.description} />
        </Head>
        <Component />
      </>
    )
  }
}

/**
 * Detects an `ogImage` export on an already-resolved page module and wraps
 * the given Component with automatic OG meta injection.
 *
 * Route objects under React Router's data router resolve `Component` via
 * `route.lazy`, which awaits the page module up front (needed so `loader`
 * can be attached alongside it) — so unlike the old React.lazy-based
 * version of this helper, there's no async boundary left to hide behind.
 * The caller has already resolved `mod` and picks what to pass as
 * `Component` (e.g. a PWA-wrapped component), so OG detection still works
 * regardless of what other wrapping happened first.
 *
 * If the page module exports `ogImage = { title, description, template? }`,
 * the rendered page gets a `<Head>` with og:image, og:title, og:description.
 * User's own `<Head>` calls still work — unhead deduplicates by property name.
 */
export function wrapWithOgMeta({
  mod,
  Component,
  routePath,
}: {
  mod: Record<string, unknown>
  Component: ComponentType
  routePath: string
}): ComponentType {
  if (mod.ogImage && typeof mod.ogImage === 'object') {
    const ogImage = mod.ogImage as OgImageData
    if (ogImage.title && ogImage.description) {
      return createOgMetaWrapper({ ogImage, routePath, Component })
    }
  }

  return Component
}
