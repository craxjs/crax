import type { ComponentPropsWithoutRef } from "react"
import type { Image } from "@unpic/react"

export type UnpicImageProps = ComponentPropsWithoutRef<typeof Image>

/**
 * Crax's <Image> props: unpic's own component props intersected with our
 * `background` extension.
 *
 * WHY not `Omit<UnpicImageProps, 'layout'> & { layout?: ... }` (the previous
 * shape): `UnpicImageProps` is a discriminated union of fixed/constrained/
 * fullWidth layouts that requires `width`+`height` (or `aspectRatio`) on every
 * layout except `"fullWidth"`. `Omit` over a union is non-distributive — it
 * flattens the union into one shape and makes every dimension optional,
 * silently destroying the compile-time CLS (layout shift) guard. Intersecting
 * with `{ background }` instead keeps each union member intact, so
 * `<Image src="x.jpg" alt="x" />` with no width/height/aspectRatio/fullWidth
 * still fails to compile. Verified with a tsc probe against @unpic/react@1.0.2.
 */
export type CraxImageProps = UnpicImageProps & {
  /**
   * Lazy load with placeholder blur-up. Defaults to "auto" (unpic's
   * CDN-based placeholder — CDN images only). For local images, pass a
   * vite-imagetools blur import (`?w=24&blur=3&format=webp&inline`, see
   * `usage.md` "Blur placeholder") — the raw data-URI string is auto-wrapped
   * in `url(...)`. Plain CSS colors/gradients also work as-is.
   */
  background?: string
}

export type PictureSource = {
  sources: Array<{ srcset: string; type: string }>
  img: { src: string; w: number; h: number }
}

type PictureSharedProps = {
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  decoding?: "async" | "sync" | "auto"
  style?: React.CSSProperties
  /**
   * Marks this image as LCP-critical: forces `loading="eager"` +
   * `fetchPriority="high"` on the rendered `<img>`, and (React 19) issues a
   * `<link rel="preload">` hint when `src` is a resolvable string URL.
   */
  priority?: boolean
  /**
   * Blur-up placeholder shown as a CSS `background-image` behind the `<img>`
   * until the real image loads (the loaded `<img>` visually covers it — no
   * load-event tracking needed). Pass a vite-imagetools blur import
   * (`?w=24&blur=3&format=webp&inline`, see `usage.md` "Blur placeholder");
   * the raw data-URI string is auto-wrapped in `url(...)`, same as `<Image
   * background>`.
   */
  placeholder?: string
}

type PictureKnownProps = keyof PictureSharedProps | "src" | "width" | "height"

/**
 * `src` as a plain string carries no known intrinsic dimensions, so `width`
 * and `height` must be supplied by the caller — the same CLS guard `<Image>`
 * enforces. The vite-imagetools `?as=picture` object branch infers real
 * dimensions from `src.img.w`/`src.img.h` at runtime, so they stay optional
 * there.
 */
export type CraxPictureProps = PictureSharedProps &
  Omit<ComponentPropsWithoutRef<"img">, PictureKnownProps> &
  (
    | { src: string; width: number | string; height: number | string }
    | { src: PictureSource; width?: number | string; height?: number | string }
  )
