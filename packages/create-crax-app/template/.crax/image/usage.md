# @crax/image

Responsive image components for Vite + React.

## Install

No install needed — it's built into this project under `crax/image`.

## Components

### `<Image>`

Wraps `@unpic/react` with sensible defaults. Auto-detects image CDNs, generates responsive `srcset`, supports placeholder blur-up.

#### Props

All props from `@unpic/react` `Image` plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `"constrained" \| "fixed" \| "fullWidth"` | `"constrained"` | Image sizing mode. `"fullWidth"` stretches to fill its container width. |
| `background` | `string` | `"auto"` | Placeholder blur-up. `"auto"` for CDN images, a CSS color/gradient, or a vite-imagetools blur import for local images (see "Blur placeholder for local images" below) |
| `priority` | `boolean` | `false` | LCP hint — eager loading + high fetch priority + (React 19) a preload link. Native `@unpic/react` prop, passed straight through. |

## Width/height are required

`width`+`height` (or `aspectRatio`) are enforced at **compile time** on every
layout except `"fullWidth"` — this is a CLS (layout shift) guard, not a
suggestion:

```tsx
<Image src="/hero.jpg" alt="Hero" />
// ❌ Type error: width/height (or aspectRatio) missing

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} />
// ✅ compiles — fixed intrinsic size, "constrained" layout (default)

<Image src="/hero.jpg" alt="Hero" layout="fullWidth" />
// ✅ compiles — the escape hatch. Stretches to fill the container; height is
// optional here since the container determines the rendered size.
```

`<Picture>`'s string-`src` branch has the same requirement (see below);
its vite-imagetools object-`src` branch is exempt because real dimensions are
read from the import at build time.

#### CDN image (auto-detected)

```tsx
import { Image } from "@crax/image"

<Image
  src="https://cdn.shopify.com/static/sample-images/bath.jpeg"
  width={800}
  height={600}
  alt="A lovely bath"
/>
```

#### Local image from `/public`

```tsx
import { Image } from "@crax/image"

<Image src="/logo.png" width={200} height={50} alt="Logo" />
```

> `/public` assets and other plain string URLs outside a recognized CDN are
> **not** processed by unpic: no generated `srcset`, no format conversion, and
> no automatic `loading="lazy"`/`decoding="async"` (unpic passes these props
> through unchanged, so set them yourself if you want them). For real
> optimization of local files, import them through vite-imagetools instead —
> see below.

#### Fixed-size icon

```tsx
import { Image } from "@crax/image"

<Image src="/NP.svg" width={40} height={40} alt="Logo" layout="fixed" />
```

#### Full-width hero image

```tsx
import { Image } from "@crax/image"

<Image
  src="/hero.jpg"
  height={600}
  layout="fullWidth"
  priority
  alt="Hero banner"
  className="absolute inset-0 size-full object-cover"
/>
```

`layout="fullWidth"` doesn't take `width` (it's set by the container, so unpic's
types disallow it — type error, not a suggestion). `height` is optional but
recommended: without it there's no intrinsic aspect ratio to reserve space
with, which reintroduces the CLS this whole guard exists to prevent.

#### Local image with vite-imagetools optimization

```tsx
import { Image } from "@crax/image"
import heroUrl from "@/assets/hero.jpg?w=1200&format=webp"

<Image src={heroUrl} width={1200} height={600} alt="Hero" />
```

### `<Picture>`

Renders a `<picture>` element from a vite-imagetools `?as=picture` import. Supports multiple formats (avif, webp) with automatic fallback.

#### Multi-format with vite-imagetools

```tsx
import { Picture } from "@crax/image"
import heroImg from "@/assets/hero.jpg?w=1200&format=webp;avif&as=picture"

<Picture src={heroImg} width={1200} height={600} alt="Hero banner" />
```

#### String fallback (renders plain `<img>`)

```tsx
import { Picture } from "@crax/image"

<Picture src="/photo.jpg" width={800} height={600} alt="Photo" />
```

`width`/`height` are **required** here (type error otherwise) — a string
`src` has no known intrinsic size for Crax to infer. The vite-imagetools
object `src` above doesn't need them; they're inferred from `src.img.w/h`.

#### Priority (LCP) images

```tsx
import { Picture } from "@crax/image"
import heroImg from "@/assets/hero.jpg?w=1200&format=webp;avif&as=picture"

<Picture src={heroImg} width={1200} height={600} alt="Hero banner" priority />
```

`priority` sets `loading="eager"` + `fetchPriority="high"` on the rendered
`<img>` (default is lazy), and — on React 19 — calls `preload()` from
`react-dom` so the browser starts fetching the image before React commits.
Reserve it for the single above-the-fold image most likely to be the page's
Largest Contentful Paint. Any other native `<img>` attribute (e.g.
`crossOrigin`, `referrerPolicy`) passes through via `...rest`.

## Layout modes

The `layout` prop is passed through to `@unpic/react`. `CraxImageProps` is derived directly from `@unpic/react`'s own component props (not a hand-copied subset), so its full discriminated union — including `"fullWidth"` and the width/height/aspectRatio requirements per layout — is enforced at compile time without any manual type patching.

| Mode | Behavior |
|------|----------|
| `"constrained"` | Scales down to fit container, maintains aspect ratio (default) |
| `"fullWidth"` | Stretches to full container width |
| `"fixed"` | Exact pixel dimensions |

## Placeholder blur-up

Set `background="auto"` (the default) to get a blurred low-res placeholder while the real image loads. Works with CDN images.

```tsx
<Image src="https://cdn.example.com/photo.jpg" width={800} height={600} alt="Photo" />
// background="auto" is the default
```

To disable:

```tsx
<Image src="/logo.png" width={200} height={50} alt="Logo" background={undefined} />
```

### Blur placeholder for local images

`background="auto"` only works for CDN-recognized URLs — unpic has no way to
generate a placeholder for a local file. For local images, build a tiny
inlined blur placeholder at compile time with vite-imagetools and pass it
straight to `background` (or `<Picture placeholder>`):

```tsx
import heroUrl from "@/assets/hero.jpg?w=1200&format=webp"
import heroBlur from "@/assets/hero.jpg?w=24&blur=3&format=webp&inline"

<Image src={heroUrl} width={1200} height={600} alt="Hero" background={heroBlur} />
```

The query recipe, directive by directive:

| Directive | Why |
|-----------|-----|
| `w=24` | Tiny output — a 24px-wide blur placeholder is a few hundred bytes, cheap to inline |
| `blur=3` | Sharp Gaussian blur sigma, applied at build time (not CSS `filter: blur()` at runtime) |
| `format=webp` | Small, broadly supported; matches the `format` directive already used elsewhere |
| `inline` | Tells vite-imagetools to base64-encode the transformed image into the module instead of emitting a file, so the import resolves to a `data:image/webp;base64,...` string with no extra network request |

With a single `w` value and a single `format` value (no `;`-separated list)
and no `as=` directive, vite-imagetools' default `url` output format resolves
to exactly one string — confirmed by reading `imagetools-core`'s `urlFormat`
(`dist/index.js`) and the plugin's `inline` handling in `vite-imagetools`
(`dist/index.js`), which sets `metadata.src` to the base64 data URI before
`urlFormat` ever runs. That string has no `url(...)` wrapper, so `<Image
background>` and `<Picture placeholder>` auto-wrap it (`resolve-background.ts`)
— pass the import directly, no manual `url(...)` needed. Plain CSS values
(`"auto"`, colors, gradients) still pass through unchanged.

`<Picture>` renders the blur import as a `background-image` on the `<img>`
itself (`backgroundSize: "cover"`) — the loaded photo is opaque and same-box,
so it covers the placeholder with no load-event tracking required:

```tsx
import heroImg from "@/assets/hero.jpg?w=1200&format=webp;avif&as=picture"
import heroBlur from "@/assets/hero.jpg?w=24&blur=3&format=webp&inline"

<Picture src={heroImg} width={1200} height={600} alt="Hero banner" placeholder={heroBlur} />
```

## Config

### Automatic format via `crax.config.mjs`

```js
export default {
  images: {
    formats: ["webp", "avif"], // first entry is the automatic default
  },
}
```

`vite.config.ts` reads `images.formats[0]` and passes it to
`imagetools({ defaultDirectives })`:

```ts
import { imagetools } from "vite-imagetools"
import craxConfig from "./.crax/config.mjs"

const defaultImageFormat = craxConfig.images.formats[0] ?? "webp"

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: new URLSearchParams({ format: defaultImageFormat }),
    }),
  ],
})
```

This means a directive-less local import — `import x from "./photo.jpg"`,
no `?w=…` query at all — is automatically converted to `formats[0]`
(`"webp"` by default). Only the **first** format is wired this way:
vite-imagetools resolves a plain import to a single URL string, so a
multi-value `format` default (`"webp;avif"`) would silently turn every
directive-less import into an array and break every caller expecting
`src: string`. To get multiple formats + `<picture>` fallback, request them
explicitly per-import with `?as=picture`, as shown above — an explicit query
directive always overrides the default.

`images.deviceSizes` and `images.defaultProps` are declared in
`crax.config.mjs`/`config.types.ts` but **not** wired into anything yet —
they're reserved for a future responsive-breakpoints/defaults pass. Don't
rely on them.

### tsconfig.json

Already configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@crax/*": ["./crax/*"]
    }
  }
}
```
