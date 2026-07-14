# OG Image Generation

Open Graph image generation using Satori (JSX → SVG) and @resvg/resvg-js (SVG → PNG). Each page that exports `ogImage` metadata gets a matching `{route}.png` image at build time, with automatic `<meta>` tag injection at render time.

## Quick Start

Add an `ogImage` export to any page and generate:

```tsx
// src/pages/about.tsx
export const ogImage = {
  title: "About Us",
  description: "Learn more about our team and mission.",
}

export default function AboutPage() {
  return <h1>About</h1>
}
```

```sh
npx @craxjs/crax og
```

Or add to your `package.json` scripts:

```json
{
  "scripts": {
    "gen:og": "npx @craxjs/crax og"
  }
}
```

Then run:

```sh
pnpm gen:og
```

Output: `dist/og/about.png` (1200x630)

---

## Configuration

Configure in `crax.config.mjs` under the `og` key:

```js
export default {
  siteUrl: "https://example.com",
  og: {
    enabled: true,
    template: "default",
    width: 1200,
    height: 630,
    font: "Inter",
    outputDir: "dist/og",
  },
}
```

### Options

| Option      | Type    | Default      | Description                           |
|-------------|---------|--------------|---------------------------------------|
| `enabled`   | boolean | `true`       | Disables generation entirely when false |
| `template`  | string  | `"default"`  | Template name from `.crax/og/templates/` |
| `width`     | number  | `1200`       | Image width in pixels                 |
| `height`    | number  | `630`        | Image height in pixels                |
| `font`      | string  | `"Inter"`    | Font name from `@fontsource/{font}`   |
| `outputDir` | string  | `"dist/og"`  | Output directory relative to project root |

---

## Page-Level Export

Pages can override any global config field with a per-page `ogImage` export:

```tsx
// src/pages/blog/[slug].tsx
export const ogImage = {
  title: "My Blog Post",
  description: "A deep dive into..." ,
  template: "blog",   // override global template
  width: 1200,
  height: 630,
}
```

### Fields

| Field         | Type   | Required | Description                           |
|---------------|--------|----------|---------------------------------------|
| `title`       | string | yes      | Page title displayed in the image     |
| `description` | string | no       | Page description displayed below title |
| `template`    | string | no       | Override global template per page     |
| `width`       | number | no       | Override global width per page        |
| `height`      | number | no       | Override global height per page       |

The generator merges page-level values on top of the global config. Undefined page fields fall through to the global values.

---

## CLI Commands

| Command              | Description                                                       |
|----------------------|-------------------------------------------------------------------|
| `crax og`            | Generate OG images for all pages with an `ogImage` export         |

Add convenience scripts to `package.json`:

```json
{
  "scripts": {
    "gen:og": "crax og",
    "build:with-og": "crax og && vite build"
  }
}
```

### Behavior

- Scans all files in the configured `pagesDir` matching `pageExtensions`
- Imports each module and checks for a named `ogImage` export
- Skips pages without `ogImage` (no output, no error)
- Exits non-zero on failure (missing config, template errors, font loading failures)

---

## Auto-Injection

The router wraps every lazy-loaded page component through `createOgAwareLazy`, which detects the `ogImage` export and injects Open Graph `<meta>` tags.

### Injection Logic

1. **Detection**: `createOgAwareLazy` checks the resolved page module for an `ogImage` export
2. **URL construction**: `{siteUrl}/og/{route}.png` — uses `siteUrl` from `crax.config.mjs`
3. **Index routes**: `/` maps to `/og.png`, `/about` maps to `/og/about.png`
4. **No conflict**: If the page also renders its own `<Head>`, unhead deduplicates by property name
5. **Zero overhead**: Pages without `ogImage` render normally — no wrapper, no extra renders

```html
<meta property="og:image" content="https://example.com/og/about.png" />
<meta property="og:title" content="About Us" />
<meta property="og:description" content="Learn more about our team and mission." />
```

### Page Without ogImage

```tsx
// src/pages/privacy.tsx — no ogImage export
export default function PrivacyPage() {
  return <h1>Privacy</h1>
}
```

Renders normally. No meta tags injected. No OG image generated. Zero bundle overhead.

---

## Custom Templates

Add templates as TSX files in `.crax/og/templates/`. Each template is a function component that receives `{ title, description }` and returns Satori-compatible JSX.

### Template Requirements

- All styles must be **inline** — no CSS classes, no external stylesheets, no `@import`
- Only [supported Satori CSS properties](https://github.com/vercel/satori#css)
- Images must use absolute URLs or base64 data URIs
- Fonts must be pre-loaded (handled by the generator for configured font)

### Example

Create `.crax/og/templates/blog.tsx`:

```tsx
import type { OGImageConfig } from "../types"

type Props = Pick<OGImageConfig, "title" | "description">

export function BlogTemplate({ title, description }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "#fff",
        color: "#1a1a1a",
        fontFamily: "Inter",
      }}
    >
      <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 28, fontWeight: 400, color: "#666" }}>
          {description}
        </div>
      )}
    </div>
  )
}
```

### Registration

Register the template in `.crax/og/generate.ts`:

```ts
import { BlogTemplate } from "./templates/blog"

const TEMPLATES: Record<string, TemplateComponent> = {
  default: DefaultTemplate,
  blog: BlogTemplate,    // ← new entry
}
```

### Usage

Reference by name in config or per-page export:

```ts
// crax.config.mjs
og: { template: "blog" }

// or per-page override
export const ogImage = { title: "...", template: "blog" }
```

### Default Template

The built-in default template renders a dark gradient background with:

- **Crax brand label** (teal, top-left, 28px)
- **Title** (white, 64px, bold)
- **Description** (gray, 32px, normal weight, hidden if not provided)

```tsx
// .crax/og/templates/default.tsx
<div style={{
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
  color: "#f8fafc",
  fontFamily: "Inter",
  padding: "80px",
}}>
  <div style={{ color: "#61B5C2", fontSize: 28, fontWeight: 600 }}>crax</div>
  <div style={{ fontSize: 64, fontWeight: 700 }}>{title}</div>
  {description && <div style={{ fontSize: 32, color: "#94a3b8" }}>{description}</div>}
</div>
```

---

## Custom Fonts

The generator loads fonts from `@fontsource/{fontName}` packages. Both 400 (normal) and 700 (bold) weights are loaded automatically.

### Using a Fontsource Font

1. Install the package:

```sh
pnpm add @fontsource/inter
```

2. Set the font name in `crax.config.mjs`:

```js
og: { font: "Inter" }
```

The font name must match the `@fontsource/{name}` package name (case-insensitive).

### Adding Local Fonts

Place custom font files in `.crax/og/fonts/` (create the directory if it doesn't exist). The generator's `loadFonts` function in `generate.ts` can be extended to read from this directory:

```ts
import fs from "node:fs/promises"
import path from "node:path"

async function loadFonts(fontName: string): Promise<FontDef[]> {
  // Built-in: tries @fontsource/{fontName} first
  try {
    return await loadFontsourceFont(fontName)
  } catch {
    // Falls through to local font loading
  }

  // Custom: reads from .crax/og/fonts/
  const fontsDir = path.resolve(".crax/og/fonts", fontName)
  const [normalData, boldData] = await Promise.all([
    fs.readFile(path.join(fontsDir, "normal.woff")),
    fs.readFile(path.join(fontsDir, "bold.woff")),
  ])

  return [
    { name: fontName, data: normalData, weight: 400, style: "normal" },
    { name: fontName, data: boldData, weight: 700, style: "normal" },
  ]
}
```

---

## Output

Generated PNG files are written to the configured `outputDir`:

```
dist/og/
├── index.png            → /
├── about.png            → /about
├── blog-slug.png        → /blog/[slug]
├── dashboard.png        → /dashboard
└── dashboard-            → /dashboard/settings
    settings.png
```

### File Naming

Route segments are flattened with hyphens:

| Route              | Source File              | Output File              |
|--------------------|--------------------------|--------------------------|
| `/`                | `src/pages/page.tsx`     | `dist/og/index.png`      |
| `/about`           | `src/pages/about.tsx`    | `dist/og/about.png`      |
| `/blog/:slug`      | `src/pages/blog/[slug].tsx` | `dist/og/blog-slug.png` |
| `/dashboard/settings` | `src/pages/dashboard/settings.tsx` | `dist/og/dashboard-settings.png` |

Square brackets (`[`, `]`) are stripped; slashes become hyphens.

---

## Complete Example

**`crax.config.mjs`**:

```js
/** @type {import('./.crax/types/config.types.ts').CraxConfig} */
export default {
  siteUrl: "https://myapp.com",
  pagesDir: "src/pages",
  pageExtensions: ["tsx"],

  og: {
    enabled: true,
    template: "default",
    width: 1200,
    height: 630,
    font: "Inter",
    outputDir: "dist/og",
  },
}
```

**`src/pages/about.tsx`**:

```tsx
export const ogImage = {
  title: "About Us",
  description: "Learn more about our team and mission.",
}

export default function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>We build things.</p>
    </div>
  )
}
```

**`package.json`** (scripts section):

```json
{
  "scripts": {
    "gen:og": "crax og",
    "build:with-og": "crax og && vite build"
  }
}
```

Generate:

```sh
pnpm gen:og
# ✓ Generated 1 OG images → dist/og/
```

The router injects at render time:

```html
<meta property="og:image" content="https://myapp.com/og/about.png" />
<meta property="og:title" content="About Us" />
<meta property="og:description" content="Learn more about our team and mission." />
```

---

## Architecture

```
crax.config.mjs          → global og config
src/pages/*.tsx          → page modules with optional ogImage export
.crax/og/generate.ts     → Satori + resvg-js pipeline
.crax/og/templates/      → TSX template components
.crax/router/og-meta.tsx → runtime meta tag injection
dist/og/*.png            → generated output
```

### Pipeline

1. **Build time** (`crax og`): Generator scans pages, imports each module, checks for `ogImage`, runs Satori (JSX → SVG) → resvg-js (SVG → PNG), writes to `outputDir`
2. **Render time** (browser): Router lazy-loads page, detects `ogImage` export, wraps component with `<Head>` containing `og:image`, `og:title`, `og:description`
