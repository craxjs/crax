import { Image as UnpicImage } from "@unpic/react"
import type { CraxImageProps, UnpicImageProps } from "./types"

/**
 * Responsive image component wrapping @unpic/react.
 *
 * - Auto-detects image CDNs and generates srcset
 * - Supports placeholder blur-up via `background="auto"`
 * - Works with both CDN URLs and vite-imagetools optimized imports
 *
 * @example
 * ```tsx
 * // CDN image
 * <Image src="https://cdn.example.com/photo.jpg" width={800} height={600} alt="Photo" />
 *
 * // Local image with vite-imagetools
 * import logoUrl from "@/assets/logo.png?w=200&format=webp"
 * <Image src={logoUrl} width={200} height={50} alt="Logo" />
 * ```
 */
export function Image({ background = "auto", ...props }: CraxImageProps) {
  // Unpic's types don't include "fullWidth" in the discriminated union,
  // but it works at runtime. We cast to keep type safety at the call site.
  return <UnpicImage background={background} {...(props as UnpicImageProps)} />
}
