import './home.css';
import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';
import { FiFolder, FiZap, FiCrosshair, FiCpu, FiImage, FiPackage, FiLayers, FiGlobe, FiBox } from 'react-icons/fi';
import { CodeBlock } from '../components';

const BASE_PATH = '';
const withBase = (path: string) => `${BASE_PATH}${path}`;

export const frontmatter = {
  pageType: 'custom',
};

const INSTALL_CODE = 'npx @craxjs/crax create my-app';

const ROUTING_CODE = `// src/pages/about.tsx → /about
// src/pages/blog/[id].tsx → /blog/:id
// src/pages/dashboard/layout.tsx → shared layout

export default function AboutPage() {
  return <h1>About</h1>
}`;

const STORE_CODE = `import { createStore, useStore } from '@crax/store'

const themeStore = createStore<'light' | 'dark'>('light')

function ThemeToggle() {
  const [theme, setTheme] = useStore(themeStore)
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      {theme}
    </button>
  )
}`;

const LINK_CODE = `import { Link } from '@crax/router'

// Smart (default): prefetch when link enters viewport
<Link to="/dashboard">Dashboard</Link>

// Foresight: hover + cursor trajectory prediction
<Link to="/pricing" prefetch="foresight">Pricing</Link>

// None: plain react-router link
<Link to="/terms" prefetch="none">Terms</Link>`;

type Feature = {
  Icon: typeof FiFolder;
  title: string;
  body: string;
  span?: 'large' | 'tall';
};

const FEATURES: Feature[] = [
  {
    Icon: FiFolder,
    title: 'File-Based Routing',
    body: 'Drop a file in src/pages/ and it becomes a route. Dynamic segments, nested layouts, and catch-all routes follow your directory structure.',
    span: 'large',
  },
  {
    Icon: FiZap,
    title: 'Instant Startup',
    body: 'Fast dev server startup. Instant HMR. Optimized production builds. Minimal install footprint.',
  },
  {
    Icon: FiCrosshair,
    title: 'Predictive Navigation',
    body: 'Links prefetch when they enter the viewport. Foresight mode predicts user intent from cursor movement. Or disable prefetching entirely.',
    span: 'tall',
  },
  {
    Icon: FiCpu,
    title: 'Global State, Zero Setup',
    body: 'Create a store, subscribe to it, done. Works like useState with no external dependencies and no boilerplate.',
  },
  {
    Icon: FiImage,
    title: 'Responsive Images',
    body: 'CDN-aware images with automatic srcset generation. Lazy loading and blur-up placeholders included by default.',
  },
  {
    Icon: FiLayers,
    title: 'View Transitions',
    body: 'Native browser transitions between pages with a single hook. Falls back gracefully on unsupported browsers.',
  },
  {
    Icon: FiGlobe,
    title: 'SEO',
    body: 'Declarative document head management with JSX. Open Graph, Twitter Cards, structured data, all expressed as standard HTML elements.',
  },
  {
    Icon: FiBox,
    title: 'Deployment Ready',
    body: 'Dockerfile and Caddy config included. Build to dist/, deploy to any static host or CDN.',
  },
  {
    Icon: FiPackage,
    title: 'Own Your Framework',
    body: 'The entire framework source lives in your project under .crax/. Read it, modify it, delete what you do not use. Not a black box.',
    span: 'large',
  },
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export default function Home() {
  const reduce = useReducedMotion();
  const enter = reduce ? { initial: false as const } : { initial: 'hidden' as const, animate: 'show' as const };
  const inView = reduce
    ? { initial: false as const }
    : { initial: 'hidden' as const, whileInView: 'show' as const, viewport: { once: true, margin: '-80px' } };
  const hoverLift = reduce ? undefined : { y: -4 };

  return (
    <div className="crax-home">
      <div className="spotlight-bg" />

      <section className="hero">
        <motion.div className="hero-content" variants={stagger} {...enter}>
          <motion.img
            alt="Crax logo"
            className="hero-logo"
            src={withBase('/crax-logo.png')}
            variants={fadeUp}
          />
          <motion.h1 className="hero-title" variants={fadeUp}>
            <span className="highlight">Crax</span>
          </motion.h1>
          <motion.p className="hero-tagline" variants={fadeUp}>
            A lightweight React framework built on Vite. A Next.js alternative that brings back the simplicity of Create React App. Frontend should just be frontend.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <motion.a
              className="btn btn-primary"
              href={withBase('/guide/start/getting-started')}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}>
              Get Started
            </motion.a>
            <motion.a
              className="btn btn-secondary"
              href="https://github.com/craxjs/crax"
              rel="noopener noreferrer"
              target="_blank"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}>
              View on GitHub
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      <motion.section className="installation" variants={fadeUp} {...inView}>
        <h2>Quick Start</h2>
        <CodeBlock code={INSTALL_CODE} lang="bash" filename="terminal" />
        <p className="install-alt">Works with npm, pnpm, and yarn</p>
      </motion.section>

      <motion.section className="features why-care" variants={stagger} {...inView}>
        <h2 className="features-title">Why Crax?</h2>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <motion.article
              key={feature.title}
              className={`feature ${feature.span ?? ''}`}
              variants={fadeUp}
              whileHover={hoverLift}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}>
              <div className="feature-icon">
                <feature.Icon size={22} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section className="quick-start" variants={stagger} {...inView}>
        <h2>See It In Action</h2>

        <motion.div className="demo-section" variants={fadeUp}>
          <h3>File-Based Routing</h3>
          <CodeBlock code={ROUTING_CODE} lang="tsx" filename="about.tsx" />
        </motion.div>

        <motion.div className="demo-section" variants={fadeUp}>
          <h3>State Management</h3>
          <CodeBlock code={STORE_CODE} lang="tsx" filename="theme-store.ts" />
        </motion.div>

        <motion.div className="demo-section" variants={fadeUp}>
          <h3>Smart Link Prefetching</h3>
          <CodeBlock code={LINK_CODE} lang="tsx" filename="nav.tsx" />
        </motion.div>
      </motion.section>

      <motion.section className="example-cta" variants={fadeUp} {...inView}>
        <p className="example-cta-text">
          See a full app built with Crax:{' '}
          <a href={withBase('/guide/examples/pokedex')}>Pokedex Example</a>
        </p>
      </motion.section>

      <footer className="home-footer">
        <p>
          Built by{' '}
          <a href="https://github.com/craxjs" rel="noopener noreferrer" target="_blank">
            Crax Team
          </a>
        </p>
      </footer>
    </div>
  );
}
