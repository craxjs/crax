import { type ComponentType } from 'react'
import { Head } from '../seo'
import config from '../config.mjs'

/** Defaults for optional PWA fields — keeps injection resilient to partial config */
const PWA_DEFAULTS = {
  themeColor: '#000000',
} as const

/** Factory: wraps a Component with Head injecting PWA meta tags (manifest, theme-color, apple-touch-icon) */
function createPwaWrapper({
  pwaConfig,
  Component,
}: {
  pwaConfig: { themeColor?: string }
  Component: ComponentType
}): ComponentType {
  const themeColor = pwaConfig.themeColor ?? PWA_DEFAULTS.themeColor

  return function PwaWrapper() {
    return (
      <>
        <Head>
          <link rel="manifest" href="/pwa/manifest.webmanifest" />
          <meta name="theme-color" content={themeColor} />
          <link rel="apple-touch-icon" href="/pwa/icon-192.png" />
        </Head>
        <Component />
      </>
    )
  }
}

/**
 * Drop-in replacement for React.lazy that wraps every page with PWA meta tags
 * when `pwa.enabled` is true in crax.config.
 *
 * Unlike OG (per-page), PWA tags are global — same manifest + theme-color on every page.
 * Applied once at router level, not per page export.
 */
export function createPwaAwareLazy(
  fn: () => Promise<Record<string, unknown>>,
): () => Promise<{ default: ComponentType }> {
  const pwaEnabled = config.pwa?.enabled === true
  if (!pwaEnabled) {
    return fn as () => Promise<{ default: ComponentType }>
  }

  const pwaConfig = config.pwa ?? {}

  return async () => {
    const mod = await fn()
    const Component = mod.default as ComponentType
    const Wrapped = createPwaWrapper({ pwaConfig, Component })
    return { default: Wrapped }
  }
}
