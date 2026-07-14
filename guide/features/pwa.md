# Progressive Web App (PWA)

Crax supports PWA configuration with automatic icon generation and manifest creation.

## Enable PWA

Add `pwa` config to `crax.config.mjs`:

```js
// crax.config.mjs
export default {
  pwa: {
    enabled: true,
    name: 'My App',
    shortName: 'App',
    themeColor: '#f59e0b',
    backgroundColor: '#ffffff',
    iconPath: 'logo.png',    // relative to public/
    startUrl: '/',
    display: 'standalone',
  },
}
```

## Generate Icons

Place a `logo.png` (at least 512x512px) in your `public/` directory, then run:

```bash
npx @craxjs/crax pwa
```

The script generates multiple icon sizes, a `manifest.webmanifest`, and patches `index.html` with icon links.

## Auto-Injection

When `pwa.enabled` is true, the router automatically injects:

```html
<link rel="manifest" href="/pwa/manifest.webmanifest" />
<meta name="theme-color" content="#f59e0b" />
<link rel="apple-touch-icon" href="/pwa/icon-192.png" />
```

No manual HTML edits needed.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enables PWA generation and tag injection |
| `name` | string | `"Crax App"` | Human-readable app name |
| `shortName` | string | `"Crax"` | Short name for home screen launcher |
| `startUrl` | string | `"/"` | Start URL when launched |
| `display` | string | `"standalone"` | Display mode (`standalone`, `fullscreen`, `minimal-ui`, `browser`) |
| `backgroundColor` | string | `"#ffffff"` | Splash screen background |
| `themeColor` | string | `"#000000"` | Browser UI and meta tag color |
| `iconPath` | string | — | Source image relative to `public/` |

## Service Worker

Crax generates the manifest and icons only. For offline support or push notifications, add `vite-plugin-pwa`:

```bash
pnpm add -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa/*.png'],
      manifest: false, // handled by crax
    }),
  ],
})
```

## Push Notifications

Add push notifications using the Web Push API with `web-push`:

### 1. Generate VAPID Keys

```bash
pnpm add -D web-push
npx web-push generate-vapid-keys
```

Save to `.env`:

```bash
VITE_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:you@example.com
```

### 2. Create Service Worker

Create `public/sw.js`:

```js
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Notification", {
      body: data.body ?? "New message",
      icon: "/pwa/icon-192.png",
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url ?? "/"))
})
```

### 3. Client-Side Subscription

```tsx
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  })

  await fetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
  })
}
```

### 4. Server-Side Sending

```bash
pnpm add web-push
```

```ts
import webpush from "web-push"

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Send notification
await webpush.sendNotification(subscription, JSON.stringify({
  title: "Hello!",
  body: "This is a push notification",
}))
```

### Browser Support

* Chrome 42+
* Firefox 44+
* Edge 17+
* Safari 16+ (macOS Ventura+)
