# PWA Support

Progressive Web App manifest and icon generation using `sharp` for image resizing — no browser or Puppeteer needed. Each configured icon size is generated from a single source image at build time, with automatic `<link>` and `<meta>` tag injection at render time.

## Quick Start

Enable PWA in config, place a source icon, and generate:

```sh
npx @craxjs/crax pwa
```

Or add to your `package.json` scripts:

```json
{
  "scripts": {
    "gen:pwa": "npx @craxjs/crax pwa"
  }
}
```

Then run:

```sh
pnpm gen:pwa
```

Output:

```
public/pwa/
├── icon-192.png
├── icon-512.png
└── manifest.webmanifest
```

---

## Configuration

Configure in `crax.config.mjs` under the `pwa` key:

```js
export default {
  pwa: {
    enabled: true,
    name: "My Dashboard",
    shortName: "Dash",
    startUrl: "/",
    display: "standalone",
    backgroundColor: "#ffffff",
    themeColor: "#000000",
    iconPath: "logo.png",
  },
}
```

### Options

| Option          | Type                                                              | Default       | Description                                 |
|-----------------|-------------------------------------------------------------------|---------------|---------------------------------------------|
| `enabled`       | boolean                                                           | `false`       | Enables PWA generation and tag injection    |
| `name`          | string                                                            | `"Crax App"`  | Human-readable app name for the manifest    |
| `shortName`     | string                                                            | `"Crax"`      | Short name for the home screen launcher     |
| `startUrl`      | string                                                            | `"/"`         | Start URL when launched from home screen    |
| `display`       | `"standalone"` \| `"fullscreen"` \| `"minimal-ui"` \| `"browser"` | `"standalone"`| Display mode for the installed app          |
| `backgroundColor` | string                                                          | `"#ffffff"`   | Background color for the splash screen      |
| `themeColor`    | string                                                            | `"#000000"`   | Theme color for the browser UI and meta tag |
| `iconPath`      | string                                                            | —             | Source image path relative to `public/`     |

`iconPath` is required when `enabled` is `true`. The generator exits with an error if it is missing.

---

## CLI Commands

| Command                   | Description                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| `npx @craxjs/crax pwa` | Generate PWA icons and manifest from the configured source image            |

Add convenience scripts to `package.json`:

```json
{
  "scripts": {
    "gen:pwa": "npx @craxjs/crax pwa",
    "build:with-pwa": "npx @craxjs/crax pwa && vite build"
  }
}
```

### Behavior

- Reads `crax.config.mjs` and validates `pwa` section
- Resolves `iconPath` relative to the `public/` directory
- Resizes source image to default sizes `[192, 512]` using `sharp`
- Writes `manifest.webmanifest` conforming to the [Web App Manifest](https://www.w3.org/TR/appmanifest/) spec
- Skips generation when `pwa.enabled` is `false`
- Exits non-zero on failure (missing config, missing `iconPath`, invalid source image)

---

## Auto-Injection

The router wraps every lazy-loaded page component through `createPwaAwareLazy`, which injects manifest and theme meta tags when `pwa.enabled` is `true`.

### Injection Logic

1. **Detection**: `createPwaAwareLazy` checks the global config for `pwa.enabled`
2. **Disabled**: When `false` or absent, the original `React.lazy` loader passes through unchanged — no wrapper, no overhead
3. **Enabled**: Every page is wrapped with `<Head>` containing:
   - `<link rel="manifest">` — points to `/pwa/manifest.webmanifest`
   - `<meta name="theme-color">` — uses `pwa.themeColor` from config (defaults to `#000000`)
   - `<link rel="apple-touch-icon">` — points to `/pwa/icon-192.png`
4. **Global scope**: Unlike OG images (per-page), PWA tags are identical on every route

```html
<link rel="manifest" href="/pwa/manifest.webmanifest" />
<meta name="theme-color" content="#000000" />
<link rel="apple-touch-icon" href="/pwa/icon-192.png" />
```

### Zero Overhead When Disabled

```js
// crax.config.mjs — PWA disabled
pwa: { enabled: false }
```

No wrapper, no extra renders, no meta tag injection. The original lazy loader is used as-is.

---

## Source Image

Place a high-resolution PNG or JPEG in `public/`:

```
public/
├── logo.png          ← referenced in config as "logo.png"
├── favicon.ico
└── ...
```

### Requirements

| Property         | Recommendation                         |
|------------------|----------------------------------------|
| Minimum size     | 512x512 pixels                         |
| Format           | PNG (preferred) or JPEG                |
| Transparency     | Supported — `sharp` preserves alpha    |
| Background       | Transparent preferred for maskable     |
| Location         | `public/` directory                    |

The generator uses `sharp` with `fit: 'contain'` and transparent background padding so the full icon is visible at every size — required for maskable purpose icons.

---

## Service Worker

This module generates the manifest and icons only. Service worker registration is not included.

For service worker support, use `vite-plugin-pwa` separately:

```sh
pnpm add -D vite-plugin-pwa
```

Then configure in `vite.config.ts`:

```ts
import { VitePWA } from "vite-plugin-pwa"

export default {
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa/*.png"],
      manifest: false, // handled by crax PWA generator
    }),
  ],
}
```

---

## Push Notifications

Add push notifications to your PWA using the Web Push API. This requires a service worker (from above) plus VAPID keys for authentication.

### Overview

```
User grants permission → Browser creates subscription
→ Server stores subscription → Server sends push via push service
→ Push service delivers to browser → Service worker shows notification
```

### Step 1: Generate VAPID Keys

```sh
pnpm add -D web-push
npx web-push generate-vapid-keys
```

Save the output to `.env`:

```env
VITE_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:you@example.com
```

### Step 2: Create Service Worker

Create `public/sw.js`:

```js
// Handle incoming push events
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}

  event.waitUntil(
    self.registration.showNotification(data.title ?? "New Message", {
      body: data.body ?? "You have a new notification",
      icon: "/pwa/icon-192.png",
      badge: "/pwa/icon-192.png",
      data: { url: data.url ?? "/" },
    })
  )
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
```

### Step 3: Client-Side Subscription

```tsx
// src/lib/push.ts
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  })

  // Send subscription to your server
  await fetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: { "Content-Type": "application/json" },
  })
}

export async function requestPermission() {
  const permission = await Notification.requestPermission()
  if (permission === "granted") {
    await subscribeToPush()
  }
}
```

### Step 4: Server-Side Sending

```sh
pnpm add web-push
```

```ts
// src/app/api/push/route.ts
import webpush from "web-push"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Store subscriptions in your database (simplified example)
const subscriptions = new Map()

export async function POST(req: Request) {
  const subscription = await req.json()
  subscriptions.set(subscription.endpoint, subscription)
  return Response.json({ ok: true })
}

// Send notification endpoint
export async function sendNotification(payload: { title: string; body: string }) {
  for (const subscription of subscriptions.values()) {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  }
}
```

### Step 5: Register Service Worker

Add to your app entry point:

```tsx
// src/main.tsx or App component
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
}
```

### Browser Support

- Chrome 42+
- Firefox 44+
- Edge 17+
- Safari 16+ (macOS Ventura+)

### Resources

- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm](https://www.npmjs.com/package/web-push)
- [Push Notification Guidelines](https://web.dev/push-notifications-overview/)

---

## Output

Generated files are written to `public/pwa/`:

```
public/pwa/
├── icon-192.png          → 192x192 icon
├── icon-512.png          → 512x512 icon
└── manifest.webmanifest  → Web App Manifest
```

### Icon Sizes

| Size | File              | Purpose              |
|------|-------------------|----------------------|
| 192  | `icon-192.png`    | `any maskable`       |
| 512  | `icon-512.png`    | `any maskable`       |

Sizes are defined in `.crax/pwa/generate.ts` (`DEFAULT_SIZES = [192, 512]`). Modify the array to add or remove sizes.

### Manifest

The generated `manifest.webmanifest` follows the [Web App Manifest](https://www.w3.org/TR/appmanifest/) specification:

```json
{
  "name": "My Dashboard",
  "short_name": "Dash",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## Complete Example

**`crax.config.mjs`**:

```js
/** @type {import('./.crax/types/config.types.ts').CraxConfig} */
export default {
  siteUrl: "https://myapp.com",
  pagesDir: "src/pages",
  pageExtensions: ["tsx"],

  pwa: {
    enabled: true,
    name: "My Dashboard",
    shortName: "Dash",
    startUrl: "/",
    display: "standalone",
    backgroundColor: "#ffffff",
    themeColor: "#6366f1",
    iconPath: "logo.png",
  },
}
```

**`public/logo.png`**: 512x512+ source image.

**`package.json`** (scripts section):

```json
{
  "scripts": {
    "gen:pwa": "npx @craxjs/crax pwa",
    "build:with-pwa": "npx @craxjs/crax pwa && vite build"
  }
}
```

Generate:

```sh
pnpm gen:pwa
# ✓ Generated 2 PWA icons → public/pwa/
# ✓ PWA generation complete. 2 icons + manifest generated.
```

Output:

```
public/pwa/
├── icon-192.png
├── icon-512.png
└── manifest.webmanifest
```

The router injects at render time:

```html
<link rel="manifest" href="/pwa/manifest.webmanifest" />
<meta name="theme-color" content="#6366f1" />
<link rel="apple-touch-icon" href="/pwa/icon-192.png" />
```

---

## Architecture

```
crax.config.mjs              → global pwa config
public/logo.png               → source image (512x512+)
.crax/pwa/generate.ts         → sharp-based icon + manifest pipeline
.crax/pwa/types.ts            → PWAIconConfig type
.crax/router/pwa-meta.tsx     → runtime manifest + theme-color + apple-touch-icon injection
public/pwa/icon-{size}.png      → generated icons
public/pwa/manifest.webmanifest → generated manifest
```

### Pipeline

1. **Build time** (`npx @craxjs/crax pwa`): Generator reads config, validates `iconPath`, resizes source image to each configured size with `sharp`, writes icons alongside `manifest.webmanifest` to `public/pwa/`
2. **Render time** (browser): Router wraps lazy-loaded pages with `<Head>` containing manifest link, theme-color meta, and apple-touch-icon link when `pwa.enabled` is `true`
