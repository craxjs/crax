import type { CraxConfig } from './types/config.types.ts'

/**
 * Ambient type declaration for `.crax/config.mjs`. That file stays plain JS
 * (mergeDeep + structuredClone over `crax.config.mjs`) — no build step, so
 * users can read/edit it like the rest of `.crax/`. TypeScript can't infer
 * types across a `.mjs` module boundary on its own, so consumers importing it
 * from `.ts`/`.tsx` (og-meta, pwa-meta, vite.config.ts) got an implicit `any`
 * (TS7016). Co-locating this `.d.mts` file next to `config.mjs` gives
 * TypeScript the real `CraxConfig` shape without changing how config loads.
 */
declare const config: CraxConfig
export default config
