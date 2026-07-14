<div align="center">
  <a href="https://crax.js.org">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/craxjs/crax/main/assets/Icon-192-dark-bg-circle.png">
      <img alt="CRAX logo" src="https://raw.githubusercontent.com/craxjs/crax/main/assets/Icon-192-white-bg-circle.png" height="128">
    </picture>
  </a>

  <h1>CRAX - Create React App Xtended</h1>

  <a href="https://github.com/craxjs/crax"><img alt="GitHub stars" src="https://img.shields.io/github/stars/craxjs/crax?style=for-the-badge&labelColor=000000&logo=github"></a>
  <a href="https://www.npmjs.com/package/@craxjs/crax"><img alt="NPM version" src="https://img.shields.io/npm/v/crax.svg?style=for-the-badge&labelColor=000000&logo=npm"></a>
  <a href="https://github.com/craxjs/crax/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/crax.svg?style=for-the-badge&labelColor=000000"></a>
  <a href="https://github.com/craxjs/crax/discussions"><img alt="Join the Community" src="https://img.shields.io/badge/Join%20the%20Community-blueviolet.svg?style=for-the-badge&logo=React&labelColor=000000&logoWidth=20"></a>
</div>

Crax is a React framework for dashboards, web apps, and internal tools. Built on Vite. Lightweight install, fast startup, and gives you framework source code you actually own. It can also be used to ship websites sure, or anything vite can ship, including static sites, but no SSR, ISR or complex rendering patterns support and we don't plan to add it, we believe frontend should just be frontend with no servers involved.

If you need a server, a traditional node server is less than 50 lines of code. Or you can look into frameworks like Next js which have more in store, crax is just the frontend, meant be simple and boring.

Also I have built a couple of frontend frameworks from scratch before, and other attempts, this is the last one I will ever build.

```bash
npx @craxjs/crax create my-app
```

> 👾 **Purely Open Source & Community Driven. No Big Influence!**

## You own the framework source

Most frameworks ship as a black box. You depend on them, update them, and debug around them when they break.

Crax works differently. When you run `npx @craxjs/crax`, the entire framework is copied into your project under `.crax/`. It is not a dependency, it is your code. Read it, modify it, delete what you do not use. This is the same idea shadcn introduced for components, applied to the whole framework layer.

One package is published to npm: `@craxjs/crax`. Everything else ships as source.

You can add in features you want, or tell your agent to add them for you, and if nice feel to contribute back to the framework if they align with what it stands for.

## No new primitives to learn

Crax does not invent its own data fetching layer, its own router, or its own animation system. It takes what the React ecosystem has already built and wires it together with conventions.

- Routing is React Router (enhanced), which most React developers already know.
- Data fetching is React Query, which most teams already use.
- State management is a thin layer over `useSyncExternalStore`, with no external dependencies.

The learning surface is small because you are mostly using tools you already know.

## Fast and light by default

Frameworks with server-side rendering carry significant overhead: large dependency trees, slow dev server startup, and complex caching layers. Most dashboards and internal tools do not need that complexity.

Crax is built on Vite. There is no server runtime, no RSC compilation, and no caching layer to understand. You build to `dist/`, deploy to any static host or CDN, and it works, open source and no vendor lock-in.

## File Based Routing

Pages live in `src/pages/`. Each file maps directly to a URL:

```
src/pages/page.tsx          →  /
src/pages/home.tsx          →  /home
src/pages/users/page.tsx    →  /users
src/pages/users/[id].tsx    →  /users/:id
```

Export a default React component from any of these files and it becomes a route. Layouts, loading states, and error boundaries follow the same convention via `layout.tsx`, `loading.tsx`, and `error.tsx` co-located in the same folder.

If you not sure about anything, just check .crax source code its all there, so you can tweak, extend, or replace any part of the framework if you have to.

## Main Features

- File-based Routing
- Image Optimization
- Built-in State Management
- Smart Link Prefetching
- MDX Page Support
- View Transitions
- React Query, pre-configured with DevTools
- SEO via `react-helmet-async`
- SPA and PWA Capabilities
- Dockerfile and Caddy configs included (optional)

## Main Stack

- Vite 7
- React 19
- Tailwind CSS v4 (shadcn/ui optional)
- TypeScript 5

## Crax vs Next.js

| | Crax | Next.js |
|---|---|---|
| **Target** | Dashboards, apps, internal tools | Public sites, e-commerce, marketing |
| **Rendering** | CSR, fast, predictable, offline-ready | SSR, SSG, ISR, CSR |
| **Dev startup** | ~300ms | 2–10s |
| **Disk footprint** | MBs | 2 GB+ node_modules |
| **Routing** | File-based (client) | File-based (server + client) |
| **Data fetching** | React Query + RR loaders | Server Components + fetch |
| **SEO** | `react-helmet-async` | Built-in via server rendering |
| **Deploy target** | Any static host, Caddy, CDN | Node server / Vercel |
| **Framework source** | Editable `.crax/` in project | Black box npm package |

Choose Crax for dashboards, SPAs, admin panels, and internal tools. Choose Next.js when server rendering is a hard requirement, or when a single stack for both backend and frontend is preferred.

## What Crax is Not

- Not a full-stack framework. No API routes, no server actions. Pair it with any backend.
- Not an SSR or SSG tool. If server-rendered HTML on first load is a hard requirement, Next.js or Astro are better fits.
- Not a component library. Tailwind v4 is included. shadcn/ui is an optional add-on.

## Roadmap

*Beta — all core features shipped.*

- [x] File-based Routing
- [x] Image Optimization (`<Image>`, `<Picture>`)
- [x] State Management (`createStore`)
- [x] PWA Capabilities (icon generation, manifest)
- [x] CLI Tooling (`@craxjs/crax` scaffolding)
- [x] Enhanced Link with prefetch strategies (`smart`, `foresight`, `none`)
- [x] Testing via Vitest
- [x] MDX support (`.mdx` pages route like `.tsx`)
- [x] LLM friendliness (`llms.md` — compact API reference)
- [x] Dockerfile for deployment (Caddy + SPA fallback)
- [x] View Transitions (`useViewTransition` hook + `viewTransition` prop on Link)
- [x] Beta Release

## Documentation

- [Getting Started](./docs/getting-started.md)
- [File-Based Routing](./docs/features/routing.md)
- [Image Optimization](./docs/features/image-optimization.md)
- [State Management](./docs/features/state-management.md)
- [Configuration](./docs/features/configuration.md)
- [PWA Capabilities](./docs/features/pwa.md)

## Development

1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`

The app will be available at `http://localhost:5173`.

## Contributing

Feel free to hit the **issues** tab, drop feedback, or open a **PR**.
No strict rules — just don't ruin the simplicity. ❤️

## Credits

Crax is built on the shoulders of these projects and more:

- **[Vite](https://vitejs.dev/)**, the blazing fast build tool and dev server that makes crax possible.
- **[React](https://react.dev/)**, the UI library that powers the frontend.
- **[React Router](https://reactrouter.com/)**, routing foundation for our file-based routing.
- **[Foresight JS](https://github.com/ianstorm/foresight-js)**, intelligent link prefetching algorithm used in our `foresight` link strategy.
- **[TanStack Query](https://tanstack.com/query)**, data fetching and cache management.
- **[Tailwind CSS](https://tailwindcss.com/)**, utility-first CSS framework for styling.
- **[MDX](https://mdxjs.com/)**, markdown for JSX-powered documentation pages.
- **[react-helmet-async](https://github.com/staylor/react-helmet-async)**, SEO and document head management.
- **[Vitest](https://vitest.dev/)**, fast unit and integration testing.

## License

[MIT](./LICENSE)
