import type { CraxPictureProps } from "./types"

/**
 * Renders a <picture> element from a vite-imagetools `?as=picture` import.
 *
 * Supports multiple formats (avif, webp) with automatic fallback.
 *
 * @example
 * ```tsx
 * import heroImg from "@/assets/hero.jpg?w=1200&format=webp;avif&as=picture"
 * <Picture src={heroImg} width={1200} height={600} alt="Hero banner" />
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
}: CraxPictureProps) {
  if (typeof src === "string") {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        decoding={decoding}
        style={style}
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
        loading={loading}
        decoding={decoding}
        style={style}
      />
    </picture>
  )
}
