import sharp from 'sharp'
import { safeTry, type Result } from 'slang-ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { CraxConfig } from '../types/config.types.ts'

type GenerateIconsParams = {
  srcPath: string
  sizes: number[]
  outputDir: string
}

type GeneratedIcon = {
  src: string
  size: number
}

type GenerateManifestParams = {
  config: CraxConfig
  icons: GeneratedIcon[]
}

const DEFAULT_SIZES = [192, 512]
const DEFAULT_OUTPUT_DIR = 'public/pwa'

/**
 * Factory that creates the PWA generator with `generateIcons` and `generateManifest` methods.
 * Uses `sharp` for image resizing — no browser or Puppeteer needed.
 */
export function createPWAGenerator() {
  /**
   * Generates PWA icons by resizing the source image to multiple sizes.
   * Uses `fit: 'contain'` with transparent background so the full icon is
   * visible — required for maskable purpose icons.
   * Returns `Result` with the list of generated icon descriptors on success.
   */
  async function generateIcons({
    srcPath,
    sizes,
    outputDir,
  }: GenerateIconsParams): Promise<Result<GeneratedIcon[], string>> {
    return safeTry(async () => {
      await fs.mkdir(outputDir, { recursive: true })

      const icons = await Promise.all(
        sizes.map(async (size) => {
          const outputPath = path.join(outputDir, `icon-${size}.png`)
          await sharp(srcPath)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png()
            .toFile(outputPath)
          return { src: `icon-${size}.png`, size }
        }),
      )

      return icons
    })
  }

  /**
   * Generates a `manifest.webmanifest` file from the PWA config and generated icons.
   * Returns `Result` with the output path on success.
   * Throws if `config.pwa` is missing — that's a configuration error, not a runtime error.
   */
  async function generateManifest({
    config,
    icons,
  }: GenerateManifestParams): Promise<Result<string, string>> {
    if (!config.pwa) {
      throw new Error(
        'PWA config not found in crax.config.mjs. Add a "pwa" section to enable PWA generation.',
      )
    }

    return safeTry(async () => {
      const pwa = config.pwa

      const manifest = {
        name: pwa.name || 'Crax App',
        short_name: pwa.shortName || 'Crax',
        start_url: pwa.startUrl || '/',
        display: pwa.display || 'standalone',
        background_color: pwa.backgroundColor || '#ffffff',
        theme_color: pwa.themeColor || '#000000',
        icons: icons.map((icon) => ({
          src: icon.src,
          sizes: `${icon.size}x${icon.size}`,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      }

      const outputDir = path.resolve(DEFAULT_OUTPUT_DIR)
      await fs.mkdir(outputDir, { recursive: true })
      const manifestPath = path.join(outputDir, 'manifest.webmanifest')
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))

      return manifestPath
    })
  }

  return { generateIcons, generateManifest }
}

// Script entry point — runs when executed directly with tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  const configPath = path.resolve(process.cwd(), 'crax.config.mjs')
  const configModule = await import(pathToFileURL(configPath).href)
  const config = configModule.default as CraxConfig

  if (!config.pwa) {
    console.error('Error: no "pwa" config found in crax.config.mjs')
    process.exit(1)
  }

  if (!config.pwa.enabled) {
    console.log('PWA is disabled. Skipping.')
    process.exit(0)
  }

  if (!config.pwa.iconPath) {
    console.error('Error: pwa.iconPath not set in crax.config.mjs')
    process.exit(1)
  }

  const srcPath = path.resolve(process.cwd(), 'public', config.pwa.iconPath)
  const outputDir = path.resolve(process.cwd(), DEFAULT_OUTPUT_DIR)

  const { generateIcons, generateManifest } = createPWAGenerator()

  const iconsResult = await generateIcons({ srcPath, sizes: DEFAULT_SIZES, outputDir })

  if (!iconsResult.isOk) {
    console.error(`\n  \u2717 PWA icon generation failed: ${iconsResult.error ?? 'unknown error'}\n`)
    process.exit(1)
  }

  console.log(`\u2713 Generated ${iconsResult.value.length} PWA icons \u2192 ${DEFAULT_OUTPUT_DIR}/`)

  const manifestResult = await generateManifest({ config, icons: iconsResult.value })

  if (!manifestResult.isOk) {
    console.error(`\n  \u2717 PWA manifest generation failed: ${manifestResult.error ?? 'unknown error'}\n`)
    process.exit(1)
  }

  console.log(`\n  \u2713 PWA generation complete. ${iconsResult.value.length} icons + manifest generated.\n`)
}