#!/usr/bin/env node
import { cp, readFile, writeFile, access, mkdir, rm } from 'node:fs/promises'
import { resolve, join, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const REPO_RAW = 'https://raw.githubusercontent.com/craxjs/crax/main'
const LATEST_VERSION = 1

async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((res) =>
    rl.question(question, (ans) => {
      rl.close()
      res(ans.trim())
    })
  )
}

async function dirExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

type SafeResult<T> = { ok: true; value: T } | { ok: false; error: string }

/**
 * Minimal safeTry wrapper — slang-ts isn't a CLI dependency, so we inline
 * the Result pattern to keep error handling consistent with project conventions.
 */
async function safeTryAsync<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const value = await fn()
    return { ok: true, value }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

function detectPackageManager(): string {
  const ua = process.env.npm_config_user_agent ?? ''
  if (ua.startsWith('yarn')) return 'yarn'
  if (ua.startsWith('pnpm')) return 'pnpm'
  return 'npm'
}

async function fetchTemplate(version: number, targetDir: string): Promise<void> {
  const url = `${REPO_RAW}/templates/v${version}`
  const tmpDir = join(targetDir, `.crax-fetch-${version}`)

  // Download the template tarball from GitHub
  const tarballUrl = `${REPO_RAW}/../archive/refs/heads/main.tar.gz`
  console.log(`  Fetching template v${version} from GitHub...`)

  await mkdir(tmpDir, { recursive: true })
  const res = await fetch(tarballUrl)
  if (!res.ok) throw new Error(`Failed to fetch template: ${res.statusText}`)

  // Write tarball and extract
  const { createWriteStream } = await import('node:fs')
  const { pipeline } = await import('node:stream/promises')
  const { createGunzip } = await import('node:zlib')
  const { extract } = await import('node:tar')

  const tarPath = join(tmpDir, 'template.tar.gz')
  await pipeline(res.body!, createGunzip(), createWriteStream(tarPath))

  // Extract only the templates/v{N}/ directory
  const { createReadStream } = await import('node:fs')
  await extract({
    file: tarPath,
    cwd: tmpDir,
    filter: (path: string) => path.includes(`templates/v${version}/`),
  })

  // Move extracted files to target
  const extractedDir = join(tmpDir, `crax-main-templates-v${version}`)
  await cp(extractedDir, targetDir, { recursive: true })
  await rm(tmpDir, { recursive: true, force: true })
}

async function scaffold(projectName: string, templateVersion?: number): Promise<void> {
  const version = templateVersion ?? LATEST_VERSION
  const targetDir = resolve(process.cwd(), projectName)

  if (await dirExists(targetDir)) {
    console.error(`Error: directory "${projectName}" already exists`)
    process.exit(1)
  }

  const pm = detectPackageManager()
  console.log(`\n  Scaffolding ${projectName}...\n`)

  if (version === LATEST_VERSION) {
    // Use bundled template
    const templateDir = join(__dirname, '..', 'template')
    await cp(templateDir, targetDir, { recursive: true })
  } else {
    // Fetch older template from GitHub
    await fetchTemplate(version, targetDir)
  }

  // Set project name and remove private flag
  const pkgPath = join(targetDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8')) as Record<string, unknown>
  pkg.name = basename(targetDir)
  delete pkg.private
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

  const installCmd = pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : 'pnpm install'
  const devCmd = `${pm} run dev`

  console.log(`  ${projectName} is ready.\n`)
  console.log(`    cd ${projectName}`)
  console.log(`    ${installCmd}`)
  console.log(`    ${devCmd}\n`)
  console.log(`  Build something great.\n`)
}

async function upgrade(): Promise<void> {
  const configPath = resolve(process.cwd(), 'crax.config.mjs')

  if (!(await dirExists(configPath))) {
    console.error('Error: no crax.config.mjs found. Are you in a crax project?')
    process.exit(1)
  }

  // Read current version from config
  const configContent = await readFile(configPath, 'utf-8')
  const versionMatch = configContent.match(/templateVersion:\s*(\d+)/)
  if (!versionMatch) {
    console.error('Error: templateVersion not found in crax.config.mjs')
    process.exit(1)
  }

  const currentVersion = parseInt(versionMatch[1], 10)

  if (currentVersion >= LATEST_VERSION) {
    console.log(`\n  You're already on the latest.\n`)
    return
  }

  console.log(`\n Upgrading ${basename(process.cwd())}...\n`)

  const targetDir = resolve(process.cwd(), '.crax')
  const tmpDir = resolve(process.cwd(), `.crax-upgrade`)

  if (versionMatch) {
    // Fetch latest template from GitHub
    await fetchTemplate(LATEST_VERSION, tmpDir)

    // Replace .crax/ with new version
    await rm(targetDir, { recursive: true, force: true })
    await cp(join(tmpDir, '.crax'), targetDir, { recursive: true })

    // Also update any root config files if they changed
    const rootFiles = ['config.mjs', 'default.config.mjs']
    for (const file of rootFiles) {
      const src = join(tmpDir, file)
      const dest = resolve(process.cwd(), file)
      if (await dirExists(src)) {
        await cp(src, dest)
      }
    }

    await rm(tmpDir, { recursive: true, force: true })
  }

  // Update version in config
  const updatedConfig = configContent.replace(
    /templateVersion:\s*\d+/,
    `templateVersion: ${LATEST_VERSION}`
  )
  await writeFile(configPath, updatedConfig)

  console.log(`  Done. You're up to date.\n`)
}

/**
 * Generates OG images for all pages that export `ogImage`.
 * Spawns tsx to run the generator from .crax/og/generate.ts.
 * Exits non-zero on failure.
 */
async function og(): Promise<void> {
  const cwd = process.cwd()
  const configPath = resolve(cwd, 'crax.config.mjs')

  if (!(await dirExists(configPath))) {
    console.error('Error: no crax.config.mjs found. Are you in a crax project?')
    process.exit(1)
  }

  const generatePath = resolve(cwd, '.crax', 'og', 'generate.ts')
  if (!(await dirExists(generatePath))) {
    console.error('Error: .crax/og/generate.ts not found. Run "crax upgrade" to get the latest .crax/ modules.')
    process.exit(1)
  }

  const { spawn } = await import('node:child_process')
  
  const tsxBin = resolve(cwd, 'node_modules', '.bin', 'tsx')
  const child = spawn(tsxBin, [generatePath], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env },
  })

  child.on('error', (err) => {
    console.error(`Error running tsx: ${err.message}`)
    console.error('Make sure tsx is installed: pnpm add -D tsx')
    process.exit(1)
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

/**
 * Generates PWA icons and manifest from the project's crax.config.mjs.
 * Spawns tsx to run the generator from .crax/pwa/generate.ts.
 * Exits non-zero on failure.
 */
async function pwa(): Promise<void> {
  const cwd = process.cwd()
  const configPath = resolve(cwd, 'crax.config.mjs')

  if (!(await dirExists(configPath))) {
    console.error('Error: no crax.config.mjs found. Are you in a crax project?')
    process.exit(1)
  }

  const generatePath = resolve(cwd, '.crax', 'pwa', 'generate.ts')
  if (!(await dirExists(generatePath))) {
    console.error('Error: .crax/pwa/generate.ts not found. Run "crax upgrade" to get the latest .crax/ modules.')
    process.exit(1)
  }

  const { spawn } = await import('node:child_process')

  const tsxBin = resolve(cwd, 'node_modules', '.bin', 'tsx')
  const child = spawn(tsxBin, [generatePath], {
    cwd,
    stdio: 'inherit',
    env: { ...process.env },
  })

  child.on('error', (err) => {
    console.error(`Error running tsx: ${err.message}`)
    console.error('Make sure tsx is installed: pnpm add -D tsx')
    process.exit(1)
  })

  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}

function parseArgs(argv: string[]): { command: string; args: string[]; flags: Record<string, string> } {
  const raw = argv.slice(2)
  const command = raw[0] ?? ''
  const args: string[] = []
  const flags: Record<string, string> = {}

  for (let i = 1; i < raw.length; i++) {
    const arg = raw[i]
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=')
      flags[key] = value ?? raw[i + 1] ?? ''
      if (!value) i++
    } else {
      args.push(arg)
    }
  }

  return { command, args, flags }
}

function getTemplateVersion(flags: Record<string, string>): number | undefined {
  return flags.template ? parseInt(flags.template.replace('v', ''), 10) : undefined
}

async function main(): Promise<void> {
  const { command, args, flags } = parseArgs(process.argv)

  if (command === 'upgrade') {
    await upgrade()
    return
  }

  if (command === 'og') {
    await og()
    return
  }

  if (command === 'pwa') {
    await pwa()
    return
  }

  // Scaffold: `crax create <project>` or bare `crax <project>`
  const projectName = command === 'create' ? (args[0] ?? '') : command
  if (!projectName) {
    const name = await prompt('Project name: ')
    if (!name) {
      console.error('Error: project name is required')
      process.exit(1)
    }
    await scaffold(name, getTemplateVersion(flags))
    return
  }

  await scaffold(projectName, getTemplateVersion(flags))
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
