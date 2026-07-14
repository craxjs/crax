import { Callout } from '@rspress/core/theme';

# SEO

Crax provides a `<Head>` component for declarative document head management. It wraps `@unhead/react` internally and parses standard HTML elements as children.

```tsx
import { Head } from '@crax/seo'
```

All tags are expressed as JSX — nest `<title>`, `<meta>`, `<link>`, and `<script>` directly inside `<Head>`.

<Callout type="warning">
  `<Head>` must be called unconditionally — before any early returns in your component. It follows React hooks rules and cannot be placed inside conditional branches.
</Callout>

## Title

```tsx
<Head>
  <title>Dashboard | Crax</title>
</Head>
```

## Meta Tags

```tsx
<Head>
  <meta name="description" content="Analytics dashboard with real-time metrics" />
  <meta name="keywords" content="dashboard, analytics, metrics" />
  <meta name="robots" content="index, follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</Head>
```

## Open Graph

Use `property` attributes for Open Graph tags:

```tsx
<Head>
  <meta property="og:title" content="Dashboard | Crax" />
  <meta property="og:description" content="Analytics dashboard with real-time metrics" />
  <meta property="og:image" content="https://example.com/og-image.jpg" />
  <meta property="og:url" content="https://example.com/dashboard" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Crax" />
  <meta property="og:locale" content="en_US" />
</Head>
```

## Twitter Card

```tsx
<Head>
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@craxjs" />
  <meta name="twitter:creator" content="@craxjs" />
  <meta name="twitter:title" content="Dashboard | Crax" />
  <meta name="twitter:description" content="Analytics dashboard with real-time metrics" />
  <meta name="twitter:image" content="https://example.com/og-image.jpg" />
</Head>
```

## Canonical URL

```tsx
<Head>
  <link rel="canonical" href="https://example.com/dashboard" />
</Head>
```

### Language Alternates

```tsx
<Head>
  <link rel="alternate" hrefLang="en" href="https://example.com/en/dashboard" />
  <link rel="alternate" hrefLang="es" href="https://example.com/es/dashboard" />
  <link rel="alternate" hrefLang="fr" href="https://example.com/fr/dashboard" />
  <link rel="alternate" hrefLang="x-default" href="https://example.com/dashboard" />
</Head>
```

## Icons

```tsx
<Head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</Head>
```

## Structured Data (JSON-LD)

Pass serialized JSON inside a `<script type="application/ld+json">` element:

```tsx
<Head>
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Crax Framework",
      "description": "React framework for dashboards and web apps",
      "applicationCategory": "DeveloperApplication",
    })}
  </script>
</Head>
```

## Complete Example

```tsx
import { Head } from '@crax/seo'

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard | Crax</title>
        <meta name="description" content="Analytics dashboard with real-time metrics" />
        <meta property="og:title" content="Dashboard | Crax" />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <link rel="canonical" href="https://example.com/dashboard" />
      </Head>

      <main>{/* page content */}</main>
    </>
  )
}
```
