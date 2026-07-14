import { createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';

/**
 * Singleton Shiki highlighter + tiny external store so React can consume
 * async-highlighted HTML without `useEffect` (via `useSyncExternalStore`).
 *
 * We use the "code html way" of Shiki: `highlighter.codeToHtml()` returns a
 * finished HTML string we inject with `dangerouslySetInnerHTML`. This is the
 * only highlighting path that reliably works inside a Rspress custom page.
 */

const THEME = 'material-theme-ocean' as const;

const SUPPORTED_LANGS: readonly BundledLanguage[] = [
  'tsx',
  'typescript',
  'jsx',
  'javascript',
  'bash',
  'json',
  'css',
  'html',
];

const cache = new Map<string, string>();
const pending = new Set<string>();
const subscribers = new Map<string, Set<() => void>>();

let highlighterPromise: Promise<Highlighter> | null = null;

/** Lazily create (and reuse) one highlighter loaded with only what we need. */
function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...SUPPORTED_LANGS],
    });
  }
  return highlighterPromise;
}

function keyOf(code: string, lang: string): string {
  return `${lang}::${code}`;
}

function notify(key: string): void {
  subscribers.get(key)?.forEach((cb) => cb());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Returns cached highlighted HTML for `code`/`lang`, or `undefined` while the
 * highlighter is still loading. The first call kicks off the async highlight
 * (idempotent per key) and notifies subscribers when ready.
 */
export function getHtml(code: string, lang: string): string | undefined {
  const key = keyOf(code, lang);
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  if (!pending.has(key)) {
    pending.add(key);
    void getHighlighter()
      .then((highlighter) => {
        const resolved = (SUPPORTED_LANGS as readonly string[]).includes(lang)
          ? lang
          : 'text';
        const html = highlighter.codeToHtml(code, { lang: resolved, theme: THEME });
        cache.set(key, html);
      })
      .catch(() => {
        // Graceful fallback: plain escaped code so the UI never breaks.
        cache.set(key, `<pre class="shiki shiki--fallback"><code>${escapeHtml(code)}</code></pre>`);
      })
      .finally(() => {
        pending.delete(key);
        notify(key);
      });
  }

  return undefined;
}

/** Subscribe to highlight completion for a given code/lang key. */
export function subscribe(key: string, cb: () => void): () => void {
  let set = subscribers.get(key);
  if (!set) {
    set = new Set();
    subscribers.set(key, set);
  }
  set.add(cb);
  return () => {
    set?.delete(cb);
  };
}
