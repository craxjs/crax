import { preload } from "react-dom"
import { resolveBackground } from "./resolve-background"
import type { CraxPictureProps } from "./types"

/**
 * Renders a <picture> element from a vite-imagetools `?as=picture` import.
 *
 * Supports multiple formats (avif, webp) with automatic fallback.
 *
 * @example
 * ```tsx
 * import heroImg from "@/assets/hero.jpg?w=1200&format=webp;avif&as=picture"
 * <Picture src={heroImg} width={1200} height={600} alt="Hero banner" priority />
 *
 * // With a blur-up placeholder (see usage.md "Blur placeholder")
 * import heroBlur from "@/assets/hero.jpg?w=24&blur=3&format=webp&inline"
 * <Picture src={heroImg} width={1200} height={600} alt="Hero banner" placeholder={heroBlur} />
 * ```
 */
export function Picture({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  decoding = "async",
  style,
  priority = false,
  placeholder,
  ...rest
}: CraxPictureProps) {
  const resolvedLoading = priority ? "eager" : loading
  const resolvedSrc = typeof src === "string" ? src : src.img?.src
  // Placeholder sits behind the <img> as a CSS background — the loaded image
  // (opaque, same box) covers it, so there's no load-event tracking to do.
  const resolvedStyle = placeholder
    ? { backgroundImage: resolveBackground(placeholder), backgroundSize: "cover", ...style }
    : style

  if (priority && typeof resolvedSrc === "string") {
    preload(resolvedSrc, { as: "image", fetchPriority: "high" })
  }

  if (typeof src === "string") {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={resolvedLoading}
        decoding={decoding}
        style={resolvedStyle}
        fetchPriority={priority ? "high" : undefined}
        {...rest}
      />
    )
  }

  return (
    <picture>
      {src.sources?.map((source, index) => (
        <source key={index} srcSet={source.srcset} type={source.type} />
      ))}
      <img
        src={src.img?.src}
        alt={alt}
        width={width ?? src.img?.w}
        height={height ?? src.img?.h}
        className={className}
        loading={resolvedLoading}
        decoding={decoding}
        style={resolvedStyle}
        fetchPriority={priority ? "high" : undefined}
        {...rest}
      />
    </picture>
  )
}
