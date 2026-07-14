# CLI Commands

Crax projects use standard Vite scripts. All commands run through your package manager.

## Development

```bash
pnpm dev
```

Starts the Vite dev server at `http://localhost:5173` with HMR.

## Build

```bash
pnpm build
```

Builds for production. Output goes to `dist/`. Type-checks before bundling.

## Preview

```bash
pnpm preview
```

Serves the production build locally for testing.

## Type Check

```bash
pnpm typecheck
```

Runs `tsc --noEmit` to check types without emitting files.

## PWA Icons

Generate PWA icons from your logo:

```bash
npx @craxjs/crax pwa
```

Requires `pwa.enabled: true` in `crax.config.mjs` and a `logo.png` in `public/`.

## Scaffolding (`@craxjs/crax`)

Create a new project:

```bash
# npm
npx @craxjs/crax create my-app

# pnpm
pnpm dlx @craxjs/crax create my-app

# yarn
yarn dlx @craxjs/crax create my-app
```

Scaffolds the full starter project and prints next steps.
