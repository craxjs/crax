import { useSyncExternalStore, useState } from 'react';
import { getHtml, subscribe } from './highlight';

/** Props for the reusable Shiki-powered code block. */
export type CodeBlockProps = {
  /** Raw source code to highlight and display. */
  code: string;
  /** Shiki language id (e.g. "tsx", "bash"). Unknown langs fall back to plain text. */
  lang?: string;
  /** Optional label shown in the window chrome (defaults to `lang`). */
  filename?: string;
};

/**
 * Reads highlighted HTML from the Shiki store without `useEffect`.
 * `getSnapshot` returns cached HTML or `undefined`; the store triggers the
 * async highlight on first read and notifies React when it lands.
 */
function useShikiHtml(code: string, lang: string): string | undefined {
  const key = `${lang}::${code}`;
  return useSyncExternalStore(
    (cb) => subscribe(key, cb),
    () => getHtml(code, lang),
    () => getHtml(code, lang),
  );
}

/** Copy-to-clipboard control with a transient "copied" state. */
const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="code-window__copy"
      onClick={handleCopy}
      type="button"
      aria-label={copied ? 'Copied' : 'Copy code'}
      data-copied={copied}>
      {copied ? '✓' : '⧉'}
    </button>
  );
};

/**
 * Reusable, syntax-highlighted code block for the docs homepage.
 * Renders a "code window" with sky-blue chrome, a language label, a copy
 * button, and Shiki-highlighted HTML (with a plain fallback before highlight
 * resolves). Highlighting uses Shiki's `codeToHtml` HTML-string output.
 */
export const CodeBlock = ({ code, lang = 'text', filename }: CodeBlockProps) => {
  const html = useShikiHtml(code, lang);
  const label = filename ?? lang;

  return (
    <div className="code-window">
      <div className="code-window__bar">
        <span className="code-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-window__name">{label}</span>
        <CopyButton code={code} />
      </div>
      <div className="code-window__body">
        {html ? (
          <div className="shiki-host" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="code-window__fallback">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
};
