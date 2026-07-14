import { Image as UnpicImage } from "@unpic/react"
import { preload } from "react-dom"
import { resolveBackground } from "./resolve-background"
import type { CraxImageProps } from "./types"

/**
 * Responsive image component wrapping @unpic/react.
 *
 * - Auto-detects image CDNs and generates srcset
 * - Supports placeholder blur-up via `background="auto"` (CDN images) or a
 *   vite-imagetools blur-import data URI for local images — see `usage.md`
 * - Works with both CDN URLs and vite-imagetools optimized imports
 * - `width`+`height` (or `aspectRatio`) are required unless `layout="fullWidth"` —
 *   enforced at compile time via `CraxImageProps` so images can't cause layout shift
 * - `priority` issues a `<link rel="preload">` hint (React 19) for LCP images
 *
 * @example
 * ```tsx
 * // CDN image
 * <Image src="https://cdn.example.com/photo.jpg" width={800} height={600} alt="Photo" />
 *
 * // Local image with vite-imagetools
 * import logoUrl from "@/assets/logo.png?w=200&format=webp"
 * <Image src={logoUrl} width={200} height={50} alt="Logo" />
 *
 * // Local image with a blur-up placeholder (see usage.md "Blur placeholder")
 * import heroBlur from "@/assets/hero.jpg?w=24&blur=3&format=webp&inline"
 * <Image src={heroUrl} width={1200} height={600} background={heroBlur} alt="Hero" />
 *
 * // Above-the-fold hero, preloaded for LCP
 * <Image src="/hero.jpg" width={1920} height={1080} layout="fullWidth" priority alt="Hero" />
 * ```
 */
export function Image({ background = "auto", ...props }: CraxImageProps) {
  if (props.priority && typeof props.src === "string") {
    preload(props.src, { as: "image", fetchPriority: "high" })
  }

  return <UnpicImage background={resolveBackground(background)} {...props} />
}
