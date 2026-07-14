import { lazy, type ComponentType } from 'react'
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
 * Drop-in replacement for React.lazy that detects `ogImage` page exports
 * and wraps the component with automatic OG meta injection.
 *
 * If the page module exports `ogImage = { title, description, template? }`,
 * the rendered page gets a `<Head>` with og:image, og:title, og:description.
 * User's own `<Head>` calls still work — unhead deduplicates by property name.
 */
export function createOgAwareLazy(
  fn: () => Promise<Record<string, unknown>>,
  routePath: string,
) {
  return lazy(async () => {
    const mod = await fn()
    const Component = mod.default as ComponentType

    if (mod.ogImage && typeof mod.ogImage === 'object') {
      const ogImage = mod.ogImage as OgImageData
      if (ogImage.title && ogImage.description) {
        const Wrapped = createOgMetaWrapper({ ogImage, routePath, Component })
        return { default: Wrapped }
      }
    }

    return { default: Component }
  })
}
