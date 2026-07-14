/** @type {import('./.crax/types/config.types.ts').CraxConfig} */
export default {
  siteUrl: 'https://example.com',
  pagesDir: 'src/pages',
  pageExtensions: ['tsx'],

  images: {
    deviceSizes: [320, 640, 960, 1280],
    formats: ['webp', 'avif'],
    defaultProps: {
      sizes: '(max-width: 640px) 100vw, 640px',
      loading: 'lazy',
      decoding: 'async',
    },
  },

  og: {
    enabled: true,
    template: 'default',
    width: 1200,
    height: 630,
    font: 'Inter',
    outputDir: 'dist/og',
  },
}
