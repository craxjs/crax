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
| `background` | `string` | `"auto"` | Placeholder blur-up. Set `"auto"` for automatic, or a CSS color/gradient |

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
  width={1920}
  height={1280}
  layout="fullWidth"
  priority
  alt="Hero banner"
  className="absolute inset-0 size-full object-cover"
/>
```

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

## Layout modes

The `layout` prop is passed through to `@unpic/react`. Our wrapper explicitly includes `"fullWidth"` in its TypeScript types so it can be used without type errors.

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

## Config

### vite.config.ts

```ts
import { imagetools } from "vite-imagetools"

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: new URLSearchParams({
        format: "webp",
      }),
    }),
  ],
})
```

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
