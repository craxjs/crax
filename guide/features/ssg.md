# Static Site Generation (SSG)

Crax is a client-side framework. It builds single-page applications that render in the browser. This is the right choice for most applications: dashboards, internal tools, web apps, and anything that doesn't need search engine indexing or fast initial page loads.

Some applications benefit from pre-rendering pages to HTML at build time. This improves SEO, reduces time-to-first-byte, and works better for content-heavy sites like blogs, documentation, and marketing pages.

Crax does not include SSG out of the box. If your application needs pre-rendering, you have options.

## When to use SSG

Consider SSG if your application:

* Needs search engine indexing (blogs, documentation, marketing sites)
* Has mostly static content that changes infrequently
* Requires fast initial page loads for users on slow connections
* Is deployed to a CDN where pre-rendered HTML can be cached globally

Stick with Crax's default SPA mode if your application:

* Is a dashboard, admin panel, or internal tool
* Requires authentication before showing content
* Has highly dynamic, user-specific content
* Doesn't need search engine visibility

## Adding SSG with vite-ssg

[vite-ssg](https://github.com/antfu/vite-ssg) is a Vite plugin that pre-renders your application at build time. It works with Crax's existing setup.

### Installation

```bash
pnpm add -D vite-ssg
```

### Configuration

Update `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteSSG } from 'vite-ssg'

export default defineConfig({
  plugins: [react()],
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      reduceInlineStyles: false,
    },
  },
})
```

Update `src/main.tsx`:

```tsx
import { ViteSSG } from 'vite-ssg'
import App from './App'
import { routes } from '@crax/router'

export const createApp = ViteSSG(App, { routes })
```

### Build

```bash
pnpm build
```

The build output in `dist/` now contains pre-rendered HTML for each route, alongside the JavaScript bundles.

### Tradeoffs

* Build time increases as you add more routes
* Dynamic content still requires client-side rendering
* Some features (like `useSyncExternalStore` hydration) need careful handling
* You're adding a dependency that Crax doesn't officially support

## Alternative: Astro

If your site is mostly static content with islands of interactivity, [Astro](https://astro.build/) might be a better fit than Crax + vite-ssg. Astro is designed for content-heavy sites and handles SSG natively.

You can embed React components in Astro pages, so existing Crax components can be reused.

## Alternative: Next.js

If you need server-side rendering, incremental static regeneration, or API routes, [Next.js](https://nextjs.org/) is the standard choice. It's a full-stack framework with more complexity than Crax, but it handles rendering patterns that Crax intentionally avoids.

## The Crax position

Crax stays focused on client-side applications. SSG is available through plugins, but it's not a first-class feature. This keeps the framework simple and the mental model clear: Crax builds SPAs.

If your application needs pre-rendering, evaluate whether Crax is the right foundation, or whether a framework designed for SSG (Astro, Next.js, Gatsby) would serve you better.
