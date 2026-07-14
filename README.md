<div align="center">
  <a href="https://crax.js.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/craxjs/crax/main/assets/Icon-192-dark-bg-circle.png">
      <img alt="CRAX logo" src="https://raw.githubusercontent.com/craxjs/crax/main/assets/Icon-192-white-bg-circle.png" height="128">
    </picture>
  </a>

  <h1>CRAX - Create React App Xtended</h1>

  <a href="https://github.com/craxjs/crax"><img alt="GitHub stars" src="https://img.shields.io/github/stars/craxjs/crax?style=for-the-badge&labelColor=000000&logo=github"></a>
  <a href="https://www.npmjs.com/package/@craxjs/crax"><img alt="NPM version" src="https://img.shields.io/npm/v/@craxjs/crax.svg?style=for-the-badge&labelColor=000000&logo=npm"></a>
  <a href="https://github.com/craxjs/crax/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@craxjs/crax.svg?style=for-the-badge&labelColor=000000"></a>
  <a href="https://github.com/craxjs/crax/discussions"><img alt="Join the Community" src="https://img.shields.io/badge/Join%20the%20Community-blueviolet.svg?style=for-the-badge&logo=React&labelColor=000000&logoWidth=20"></a>
</div>

Crax is a React framework built on Vite. It builds anything React can build, from dashboards and internal tools to marketing sites and full web applications. The entire framework source ships into the project under `.crax/`, so every line is owned, readable, and modifiable.

Crax is client-side only. No SSR, ISR, or server rendering. If a project needs server rendering, Next.js or Astro are better fits. For everything else, Crax keeps the foundation clean and the deployment simple.

```bash
npx @craxjs/crax create my-app
```

> Open source and community driven.

## Framework source included

Most frameworks ship as a black box. Applications depend on them, update them, and debug around them when they break. The source that runs the app lives in `node_modules`, unreadable in practice.

Crax copies the entire framework into the project under `.crax/`. It is not a dependency, it is project code. Every line is readable, modifiable, and removable. This is the same approach shadcn introduced for components, applied to the whole framework layer.

One package is published to npm: `@craxjs/crax`. Everything else ships as source.

## No new primitives to learn

Crax does not invent its own data fetching layer, router, or animation system. It wires together what the React ecosystem has already built, with conventions on top.

- Routing is React Router (enhanced), which most React developers already know.
- Data fetching is React Query, which most teams already use.
- State management is a thin layer over `useSyncExternalStore`, with no external dependencies.

The learning surface is small because the tools are already familiar.

## Fast and light by default

Frameworks with server-side rendering carry significant overhead: large dependency trees, slow dev server startup, and complex caching layers. Most applications do not need that complexity.

Crax is built on Vite. There is no server runtime, no RSC compilation, and no caching layer to understand. Build output goes to `dist/`, deploys to any static host or CDN, and works. No vendor lock-in.

## File Based Routing

Pages live in `src/pages/`. Each file maps directly to a URL:

```
src/pages/page.tsx          →  /
src/pages/home.tsx          →  /home
src/pages/users/page.tsx    →  /users
src/pages/users/[id].tsx    →  /users/:id
```

Export a default React component and it becomes a route. Layouts, loading states, and error boundaries follow the same convention via `layout.tsx`, `loading.tsx`, and `error.tsx` co-located in the same folder.

The `.crax/` source is always available to inspect, tweak, extend, or replace any part of the framework.

## Main Features

- File-based routing with layouts, dynamic segments, and MDX pages
- Image optimization with CDN-aware `<Image>` and `<Picture>` components
- Built-in state management via `createStore`
- Smart link prefetching with `smart`, `foresight`, and `none` strategies
- View transitions via `useViewTransition` hook
- React Query pre-configured with DevTools
- SEO via declarative `<Head>` component
- PWA support with icon generation and manifest creation
- Dockerfile and Caddy config included for deployment

## Main Stack

- Vite 7
- React 19
- Tailwind CSS v4 (shadcn/ui optional)
- TypeScript 5

## Crax vs Next.js

| | Crax | Next.js |
|---|---|---|
| **Target** | Any client-side React application | Full-stack applications with server rendering |
| **Rendering** | CSR, fast, predictable, offline-ready | SSR, SSG, ISR, CSR |
| **Dev startup** | ~300ms | 2-10s |
| **Disk footprint** | MBs | 2 GB+ node_modules |
| **Routing** | File-based (client) | File-based (server + client) |
| **Data fetching** | React Query + RR loaders | Server Components + fetch |
| **SEO** | Declarative `<Head>` component | Built-in via server rendering |
| **Deploy target** | Any static host, Caddy, CDN | Node server / Vercel |
| **Framework source** | Editable `.crax/` in project | Black box npm package |

Choose Crax when client-side rendering is sufficient and owning the framework source matters. Choose Next.js when server rendering is a hard requirement, or when a single stack for both backend and frontend is preferred.

## What Crax is Not

- Not a full-stack framework. No API routes, no server actions. Pair it with any backend.
- Not an SSR or SSG tool. If server-rendered HTML on first load is a hard requirement, Next.js or Astro are better fits.
- Not a component library. Tailwind v4 is included. shadcn/ui is an optional add-on.

## Roadmap

*Beta. All core features shipped.*

- [x] File-based Routing
- [x] Image Optimization (`<Image>`, `<Picture>`)
- [x] State Management (`createStore`)
- [x] PWA Capabilities (icon generation, manifest)
- [x] CLI Tooling (`@craxjs/crax` scaffolding)
- [x] Enhanced Link with prefetch strategies (`smart`, `foresight`, `none`)
- [x] Testing via Vitest
- [x] MDX support (`.mdx` pages route like `.tsx`)
- [x] LLM friendliness (`llms.md`, compact API reference)
- [x] Dockerfile for deployment (Caddy + SPA fallback)
- [x] View Transitions (`useViewTransition` hook + `viewTransition` prop on Link)
- [x] Beta Release

## Documentation

- [Getting Started](./packages/docs-site/docs/guide/start/getting-started.mdx)
- [File-Based Routing](./packages/docs-site/docs/guide/features/routing.mdx)
- [Image Optimization](./packages/docs-site/docs/guide/features/image-optimization.mdx)
- [State Management](./packages/docs-site/docs/guide/features/state-management.mdx)
- [Configuration](./packages/docs-site/docs/guide/features/configuration.mdx)
- [PWA Capabilities](./packages/docs-site/docs/guide/features/pwa.mdx)

## Development

1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`

The app will be available at `http://localhost:5173`.

## Contributing

Open an issue, drop feedback, or submit a pull request. Keep it simple.

## Credits

Crax is built on these projects:

- **[Vite](https://vitejs.dev/)**, build tool and dev server.
- **[React](https://react.dev/)**, UI library.
- **[React Router](https://reactrouter.com/)**, routing foundation.
- **[Foresight JS](https://github.com/ianstorm/foresight-js)**, link prefetching algorithm for the `foresight` strategy.
- **[TanStack Query](https://tanstack.com/query)**, data fetching and cache management.
- **[Tailwind CSS](https://tailwindcss.com/)**, utility-first CSS framework.
- **[MDX](https://mdxjs.com/)**, markdown for JSX.
- **[@unhead/react](https://github.com/unjs/unhead)**, document head management.
- **[Vitest](https://vitest.dev/)**, unit and integration testing.
- **[shadcn](https://ui.shadcn.com/)**, inspiration for the pull-source framework delivery model.

## License

[MIT](./LICENSE)
