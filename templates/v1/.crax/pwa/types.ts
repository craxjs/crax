/**
 * Describes a PWA icon set — a source image rendered at multiple sizes
 * with an optional purpose. Used to configure icon generation and manifest entries.
 */
export interface PWAIconConfig {
  src: string
  sizes: number[]
  purpose?: 'any' | 'maskable' | 'any maskable'
}