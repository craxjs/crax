export interface ImageConfig {
  deviceSizes: number[];
  formats: string[];
  defaultProps: {
    sizes: string;
    loading: 'lazy' | 'eager';
    decoding: 'async' | 'sync' | 'auto';
  };
}

export interface PWAConfig {
  enabled: boolean;
  themeColor: string;
  backgroundColor: string;
  iconPath: string;
  name: string;
  shortName: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
}

export interface OGConfig {
  enabled: boolean;
  template: string;
  width: number;
  height: number;
  font: string;
  outputDir: string;
}

export interface CraxConfig {
  siteUrl?: string; // used for canonical URLs, SEO
  pagesDir: string;
  pageExtensions: string[];
  images: ImageConfig;
  pwa?: PWAConfig;
  og?: OGConfig;
}
