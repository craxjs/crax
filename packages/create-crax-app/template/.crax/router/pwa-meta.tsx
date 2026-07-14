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
 * Wraps an already-resolved page Component with PWA meta tags when
 * `pwa.enabled` is true in crax.config.
 *
 * Unlike OG (per-page), PWA tags are global — same manifest + theme-color on
 * every page. Route objects under React Router's data router resolve
 * `Component` via `route.lazy`, which awaits the page module up front — so
 * unlike the old React.lazy-based version of this helper, this runs
 * synchronously on the resolved Component, no async wrapper needed.
 */
export function wrapWithPwaMeta({ Component }: { Component: ComponentType }): ComponentType {
  const pwaEnabled = config.pwa?.enabled === true
  if (!pwaEnabled) return Component

  const pwaConfig = config.pwa ?? {}
  return createPwaWrapper({ pwaConfig, Component })
}
