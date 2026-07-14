import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { safeTry, Ok, type Result } from 'slang-ts'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import type { ReactNode } from 'react'
import { DefaultTemplate } from './templates/default.tsx'
import type { OGImageConfig } from './types.ts'
import type { CraxConfig } from '../types/config.types.ts'

type TemplateProps = {
  title: string
  description?: string
}

type TemplateComponent = (props: TemplateProps) => ReactNode

type GenerateParams = {
  pagePath: string
  pagesDir: string
  config: CraxConfig
  ogConfig: OGImageConfig
}

type GenerateAllParams = {
  pagesDir: string
  config: CraxConfig
}

type FontDef = {
  name: string
  data: Buffer
  weight: 400 | 700
  style: 'normal'
}

/** Object lookup for available templates — extensible by adding entries here. */
const TEMPLATES: Record<string, TemplateComponent> = {
  default: DefaultTemplate,
}

const require = createRequire(import.meta.url)

/**
 * Renders an SVG string to a PNG buffer at the given width.
 * Wraps the Resvg class behind a function so our code stays functional.
 */
function renderSvgToPng(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  })
  return resvg.render().asPng()
}

/** Converts a page file path to a flat OG image filename (e.g. `blog/[slug].tsx` → `blog-slug.png`). */
function pageToFileName(pagePath: string, pagesDir: string): string {
  const relative = path.relative(pagesDir, pagePath)
  return relative
    .replace(/\.(tsx|ts)$/, '')
    .replace(/\[|\]/g, '')
    .replace(/\//g, '-')
}

/** Loads 400 and 700 weight font data from the corresponding @fontsource package. */
async function loadFonts(fontName: string): Promise<FontDef[]> {
  const pkgName = `@fontsource/${fontName.toLowerCase()}`
  const pkgPath = path.dirname(require.resolve(`${pkgName}/package.json`))
  const filesDir = path.join(pkgPath, 'files')
  const baseName = fontName.toLowerCase()

  const [normalData, boldData] = await Promise.all([
    fs.readFile(path.join(filesDir, `${baseName}-latin-400-normal.woff`)),
    fs.readFile(path.join(filesDir, `${baseName}-latin-700-normal.woff`)),
  ])

  return [
    { name: fontName, data: normalData, weight: 400, style: 'normal' as const },
    { name: fontName, data: boldData, weight: 700, style: 'normal' as const },
  ]
}

/** Recursively scans a directory for files matching the given extensions. */
async function scanPages(pagesDir: string, extensions: string[]): Promise<string[]> {
  const entries = await fs.readdir(pagesDir, { recursive: true })
  return entries
    .filter((entry) => extensions.includes(path.extname(entry).slice(1)))
    .map((entry) => path.join(pagesDir, entry))
}

/**
 * Extracts ogImage config from a page file using static analysis.
 * Reads the file as text and parses the `export const ogImage = { ... }` block.
 * Returns undefined if no ogImage export is found.
 */
function extractOgImageFromSource(source: string): OGImageConfig | undefined {
  const match = source.match(/export\s+const\s+ogImage\s*=\s*\{([\s\S]*?)\}/)
  if (!match) return undefined

  const body = match[1]
  const titleMatch = body.match(/title\s*:\s*['"`]([^'"`]+)['"`]/)
  const descMatch = body.match(/description\s*:\s*['"`]([^'"`]+)['"`]/)
  const templateMatch = body.match(/template\s*:\s*['"`]([^'"`]+)['"`]/)
  const widthMatch = body.match(/width\s*:\s*(\d+)/)
  const heightMatch = body.match(/height\s*:\s*(\d+)/)

  if (!titleMatch) return undefined

  const config: OGImageConfig = { title: titleMatch[1] }
  if (descMatch) config.description = descMatch[1]
  if (templateMatch) config.template = templateMatch[1]
  if (widthMatch) config.width = parseInt(widthMatch[1], 10)
  if (heightMatch) config.height = parseInt(heightMatch[1], 10)

  return config
}

/**
 * Factory that creates the OG image generator with `generate` and `generateAll` methods.
 * Uses Satori (JSX → SVG) and @resvg/resvg-js (SVG → PNG) under the hood.
 */
export function createOGGenerator() {
  /**
   * Generates a single OG image for a page.
   * Returns `Result` with the output path on success, or an error message on failure.
   * Throws if `config.og` is missing — that's a configuration error, not a runtime error.
   */
  async function generate({ pagePath, pagesDir, config, ogConfig }: GenerateParams): Promise<Result<string, string>> {
    if (!config.og) {
      throw new Error('OG config not found in crax.config.mjs. Add an "og" section to enable OG image generation.')
    }

    const og = config.og

    return safeTry(async () => {
      const fonts = await loadFonts(og.font)
      const templateName = ogConfig.template ?? og.template
      const templateFn = TEMPLATES[templateName] ?? DefaultTemplate
      const element = templateFn({ title: ogConfig.title, description: ogConfig.description })
      const width = ogConfig.width ?? og.width
      const height = ogConfig.height ?? og.height

      const svg = await satori(element, { width, height, fonts })
      const pngBuffer = renderSvgToPng(svg, width)

      const outputDir = path.resolve(og.outputDir)
      await fs.mkdir(outputDir, { recursive: true })
      const fileName = pageToFileName(pagePath, pagesDir)
      const outputPath = path.join(outputDir, `${fileName}.png`)
      await fs.writeFile(outputPath, pngBuffer)

      return outputPath
    })
  }

  /**
   * Scans the pages directory, extracts `ogImage` exports from each page via static analysis,
   * and generates OG images for all pages that have one.
   * Returns `Result` with the list of output paths on success.
   */
  async function generateAll({ pagesDir, config }: GenerateAllParams): Promise<Result<string[], string>> {
    if (!config.og) {
      throw new Error('OG config not found in crax.config.mjs.')
    }

    if (!config.og.enabled) {
      console.log('OG image generation is disabled. Skipping.')
      return Ok([])
    }

    return safeTry(async () => {
      const pages = await scanPages(pagesDir, config.pageExtensions)

      const pagesWithOg: { page: string; ogConfig: OGImageConfig }[] = []
      for (const page of pages) {
        const source = await fs.readFile(page, 'utf-8')
        const ogConfig = extractOgImageFromSource(source)
        if (ogConfig) {
          pagesWithOg.push({ page, ogConfig })
        }
      }

      if (pagesWithOg.length === 0) {
        console.log('No pages with ogImage export found. Skipping OG generation.')
        return Ok([])
      }

      const outputPaths: string[] = []
      for (const { page, ogConfig } of pagesWithOg) {
        const result = await generate({ pagePath: page, pagesDir, config, ogConfig })
        if (result.isOk) {
          outputPaths.push(result.value)
        } else {
          console.error(`Failed to generate OG image for ${page}: ${result.error}`)
        }
      }

      console.log(`\u2713 Generated ${outputPaths.length} OG images \u2192 ${config.og.outputDir}/`)
      return Ok(outputPaths)
    })
  }

  return { generate, generateAll }
}

// Script entry point — runs when executed directly with tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  const { pathToFileURL } = await import('node:url')
  const configPath = path.resolve(process.cwd(), 'crax.config.mjs')
  const configModule = await import(pathToFileURL(configPath).href)
  const config = configModule.default as CraxConfig
  
  if (!config.og) {
    console.error('Error: no "og" config found in crax.config.mjs')
    process.exit(1)
  }

  const { generateAll } = createOGGenerator()
  const result = await generateAll({ pagesDir: path.resolve(process.cwd(), config.pagesDir), config })

  if (result.isOk) {
    const count = (result.value ?? []).length
    console.log(`\n  ✓ OG image generation complete. ${count} images generated.\n`)
  } else {
    console.error(`\n  ✗ OG image generation failed: ${result.error ?? 'unknown error'}\n`)
    process.exit(1)
  }
}
