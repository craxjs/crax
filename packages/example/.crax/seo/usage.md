# @crax/seo

Declarative document head management. Wraps `@unhead/react` — users write standard HTML elements inside `<Head>`.

## Install

Built into this project under `.crax/seo`. No install needed.

## Quick Start

```tsx
import { Head } from '@crax/seo'

export default function ProductPage() {
  return (
    <>
      <Head>
        <title>Product Name | Store</title>
        <meta name="description" content="Product description here" />
      </Head>
      <main>...</main>
    </>
  )
}
```

## Exports

```tsx
import { Head } from '@crax/seo'
```

| Export | Purpose |
|--------|---------|
| `<Head>` | Container for document head elements |

## Supported Elements

Nest standard HTML elements inside `<Head>`:

| Element | Purpose |
|---------|---------|
| `<title>` | Page title |
| `<meta>` | Meta tags (description, keywords, robots, OG, Twitter) |
| `<link>` | Links (canonical, alternates, icons) |
| `<script type="application/ld+json">` | Structured data |

## Usage

### Title

```tsx
<Head>
  <title>Dashboard | Crax</title>
</Head>
```

### Meta Tags

```tsx
<Head>
  <meta name="description" content="Analytics dashboard" />
  <meta name="keywords" content="dashboard, analytics" />
  <meta name="robots" content="index, follow" />
</Head>
```

### Open Graph

```tsx
<Head>
  <meta property="og:title" content="Dashboard | Crax" />
  <meta property="og:description" content="Analytics dashboard" />
  <meta property="og:image" content="https://example.com/og.jpg" />
  <meta property="og:url" content="https://example.com/dashboard" />
  <meta property="og:type" content="website" />
</Head>
```

### Twitter Card

```tsx
<Head>
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@handle" />
  <meta name="twitter:title" content="Dashboard | Crax" />
  <meta name="twitter:description" content="Analytics dashboard" />
  <meta name="twitter:image" content="https://example.com/twitter.jpg" />
</Head>
```

### Canonical & Alternates

```tsx
<Head>
  <link rel="canonical" href="https://example.com/page" />
  <link rel="alternate" hrefLang="en" href="https://example.com/en/page" />
  <link rel="alternate" hrefLang="es" href="https://example.com/es/page" />
</Head>
```

### Icons

```tsx
<Head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</Head>
```

### Structured Data (JSON-LD)

```tsx
<Head>
  <script type="application/ld+json">
    {JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Product Name',
      description: 'Product description',
    })}
  </script>
</Head>
```

## Complete Example

```tsx
import { Head } from '@crax/seo'

export default function ProductPage({ product }) {
  return (
    <>
      <Head>
        <title>{product.name} | Store</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={product.tags.join(', ')} />
        
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.name} />
        
        <link rel="canonical" href={`https://store.com/products/${product.slug}`} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.image,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'USD',
            },
          })}
        </script>
      </Head>
      <main>...</main>
    </>
  )
}
```

## Important

`<Head>` must be called unconditionally — before any early returns in your component. It follows React hooks rules and cannot be placed inside conditional branches.

```tsx
// ❌ Wrong
if (isLoading) return <Loading />
<Head><title>Page</title></Head>

// ✅ Correct
<Head><title>Page</title></Head>
if (isLoading) return <Loading />
```

## Implementation

Source lives in `.crax/seo/head.tsx`. Parses `<title>`, `<meta>`, `<link>`, and `<script type="application/ld+json">` children, passes them to `@unhead/react`.
