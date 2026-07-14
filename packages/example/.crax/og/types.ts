/**
 * Per-page OG image metadata, exported from page files as `export const ogImage`.
 * Overrides apply on top of the global `og` config in `crax.config.mjs`.
 */
export interface OGImageConfig {
  title: string;
  description?: string;
  template?: string;
  width?: number;
  height?: number;
}