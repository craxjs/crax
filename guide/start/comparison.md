# Framework Comparison

This page is an honest positioning guide. Crax is not the best framework for everything. It's built for a specific niche: client-side applications that need a clean foundation, fast development, and readable framework source. This guide helps you decide whether that niche is the right fit.

## Crax vs Next.js

| | Crax | Next.js |
|---|---|---|
| **Philosophy** | Frontend-only, simple, cheap to run | Full-stack, feature-rich, server rendering |
| **Rendering** | CSR, fast, predictable, offline-ready | SSR, SSG, ISR, CSR |
| **Dev startup** | ~300ms | 2-10s |
| **Disk footprint** | MBs | 2 GB+ node\_modules |
| **Routing** | File-based (client) | File-based (server + client) |
| **Data fetching** | React Query + Route loaders | Server Components + fetch |
| **SEO** | Declarative `<Head>` component | Built-in via server rendering |
| **Deploy target** | Any static host, Caddy, CDN | Node server / Vercel |
| **Framework source** | Editable `.crax/` in project | Black box npm package |

**Choose Crax when:**

* Frontend-only is the right architectural choice for your application
* You prefer owning the framework source code instead of depending on a black box
* You want minimal dev server startup and fast builds
* Your deployment infrastructure is already static hosting or a reverse proxy (Nginx, Caddy, CloudFlare, etc.)
* Your team knows React and is comfortable reaching for dedicated backend services

**Choose Next.js when:**

* You need server-side rendering on first load as a hard requirement
* You prefer a single team and single language stack for both backend and frontend
* Your application requires incremental static generation or edge functions
* You want the framework to handle both API routes and page rendering

## Crax vs plain Vite + React

Vite and React are powerful tools. You can absolutely build applications with just them. Crax is Vite + React underneath, but it adds conventions and features you'd otherwise wire yourself:

* **File-based routing with loaders.** Crax's routing is file-based (like Next.js), but runs on the client. [Route loaders](/crax/guide/features/routing.md) let you fetch and preload data before render, similar to React Router's data loaders.
* **Link prefetching strategies.** The `<Link>` component includes three prefetch strategies: `smart` (hover, focus, pointerdown, plus viewport observation), `foresight` (cursor prediction), and `none`. Building this yourself requires understanding multiple APIs.
* **Image optimization.** The `<Image>` and `<Picture>` components handle responsive sizing, CDN-aware srcsets, and lazy loading. See [image optimization](/crax/guide/features/image-optimization.md) for details.
* **SEO declaratively.** The `<Head>` component lets you set `<title>`, `<meta>`, and `<link>` tags without wiring up a head-management library yourself. Works with MDX pages out of the box.
* **Global state management.** `createStore` is a lightweight, subscription-based state management tool with no external dependencies. It works with React's strict mode and includes history and locking utilities. See [state management](/crax/guide/features/state-management.md).
* **PWA and OG generation.** Crax scaffolds PWA manifest generation, icon resizing, and Open Graph image templates. See [PWA capabilities](/crax/guide/features/pwa.md).
* **Editable framework source.** The entire `.crax/` directory is in your project. You can inspect, debug, and modify any part of the framework without waiting for a release.

If you're happy building these utilities yourself or using separate packages for each, Vite + React is the right choice. If you'd prefer them pre-wired and owned locally, Crax saves time and reduces dependency sprawl.

## Crax vs Astro

Astro is a compelling choice for content-first sites. It excels at server-rendering static HTML on first load and works beautifully with islands of interactivity. Crax takes the opposite approach: it's a client-side application framework.

**Astro wins when:**

* Your site is content-first (blog, marketing, documentation, portfolio). Astro's zero-JavaScript-by-default is ideal.
* You need server-rendered HTML on first load as a hard requirement for SEO, social sharing, or perceived performance.
* You want to mix static and dynamic content with minimal complexity.

**Crax wins when:**

* Your application is app-like: interactive, with stateful UI, real-time updates, or persistent user sessions.
* You need a single client-side bundle that works offline-first or in low-connectivity scenarios.
* Your content lives behind authentication or depends on user state.

If you're building a blog or marketing site, start with Astro. If you're building an app, start with Crax.

## What Crax is Not

* **Not a full-stack framework.** Crax has no API routes and no server actions. Pair it with a dedicated backend (Express, Fastify, Supabase, Firebase, GraphQL server, etc.).
* **Not an SSR or SSG tool.** If server-rendered HTML on first load is a hard requirement, Next.js or Astro are better fits.
* **Not a component library.** Tailwind CSS v4 is included. shadcn/ui is an optional add-on. You're not locked into any UI kit.

Crax is for client-rendered applications that need a clean foundation, fast tooling, and readable framework source. It's the simplicity that Create React App offered, reborn for the modern React ecosystem.
