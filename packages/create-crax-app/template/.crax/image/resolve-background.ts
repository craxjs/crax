const DATA_URI_OR_URL = /^(?:data:|https?:|\/)/

/**
 * `<Image background>` and `<Picture placeholder>` are raw CSS
 * `background`/`background-image` values — `"auto"` and plain CSS
 * (colors, gradients) must pass through untouched. A vite-imagetools blur
 * placeholder import (`?w=24&blur=3&format=webp&inline`, see usage.md)
 * resolves to a bare data-URI string with no `url(...)` wrapper; used as-is
 * it would break the CSS declaration. Wrap data-URI/absolute/root-relative
 * URL-shaped strings automatically so callers can pass the import straight
 * through.
 */
export function resolveBackground(background: string): string {
  return DATA_URI_OR_URL.test(background) ? `url(${background})` : background
}
