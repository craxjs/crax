# Crax Documentation Site

The official documentation site for [Crax](https://crax.js.org), built with [Rspress](https://rspress.dev).

Live at [crax.js.org](https://crax.js.org)

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

The site will be available at `http://localhost:5173`.

## Building

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Documentation Structure

```
docs/
  index.tsx                     # Home page (custom React component)
  home.css                      # Home page styles
  _nav.json                     # Top navigation
  guide/
    _meta.json
    start/
      getting-started.md
      introduction.md
    features/
      routing.md
      image-optimization.md
      state-management.md
      configuration.md
      cli-commands.md
      data-fetching.md
      deploy.md
      pwa.md
      seo.md
      ssg.md
      view-transitions.md
      index.md
    examples/
      pokedex.md
```

## Deployment

```bash
pnpm deploy
```

Deploys to GitHub Pages via `gh-pages` package. Requires the `gh-pages` branch on the `craxjs/crax` repo.

## Custom Domain

The site uses a CNAME file in `docs/public/` pointing to `crax.js.org`.
