import type { ComponentPropsWithoutRef } from "react"
import type { Image } from "@unpic/react"

export type UnpicImageProps = ComponentPropsWithoutRef<typeof Image>

export type CraxImageProps = Omit<UnpicImageProps, 'layout'> & {
  /** Image layout mode. "fullWidth" stretches to container width. */
  layout?: "constrained" | "fixed" | "fullWidth"
  /** Lazy load with placeholder blur-up. Defaults to "auto". */
  background?: string
}

export type PictureSource = {
  sources: Array<{ srcset: string; type: string }>
  img: { src: string; w: number; h: number }
}

export type CraxPictureProps = {
  /** Picture source from vite-imagetools `?as=picture` import */
  src: PictureSource | string
  alt: string
  width?: number | string
  height?: number | string
  className?: string
  loading?: "lazy" | "eager"
  decoding?: "async" | "sync" | "auto"
  style?: React.CSSProperties
}
