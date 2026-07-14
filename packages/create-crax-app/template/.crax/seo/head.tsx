import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { useHead as useUnhead } from '@unhead/react'

type MetaTag = { name?: string; property?: string; content?: string; httpEquiv?: string }
type LinkTag = { rel?: string; href?: string; sizes?: string; type?: string; hreflang?: string; media?: string }

export interface HeadProps {
  children?: ReactNode
}

export function Head({ children }: HeadProps) {
  let title: string | undefined
  const metaTags: MetaTag[] = []
  const linkTags: LinkTag[] = []
  const scripts: { type?: string; innerHTML?: string }[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return

    const el = child as ReactElement<{ [key: string]: unknown }>
    const { type, props } = el

    if (type === 'title') {
      const text = typeof props.children === 'string'
        ? props.children
        : Array.isArray(props.children)
          ? props.children.filter((c) => typeof c === 'string').join('')
          : undefined
      if (text) title = text
    } else if (type === 'meta') {
      metaTags.push({
        name: props.name as string | undefined,
        property: props.property as string | undefined,
        content: props.content as string | undefined,
        httpEquiv: props.httpEquiv as string | undefined,
      })
    } else if (type === 'link') {
      linkTags.push({
        rel: props.rel as string | undefined,
        href: props.href as string | undefined,
        sizes: props.sizes as string | undefined,
        type: props.type as string | undefined,
        hreflang: props.hrefLang as string | undefined,
        media: props.media as string | undefined,
      })
    } else if (type === 'script' && props.type === 'application/ld+json') {
      scripts.push({
        type: 'application/ld+json',
        innerHTML: typeof props.children === 'string' ? props.children : undefined,
      })
    }
  })

  useUnhead({
    title,
    meta: metaTags,
    link: linkTags,
    script: scripts.length > 0 ? scripts : undefined,
  })

  return null
}
