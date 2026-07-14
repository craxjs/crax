import {
  Link as RouterLink,
  type LinkProps,
} from 'react-router-dom'
import {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
  type ReactElement,
} from 'react'
import { prefetchRoute, getPathFromTo } from './prefetch'
import useForesight from '../hooks/useForesight'

type PrefetchStrategy = 'smart' | 'foresight' | 'none'

export type CraxLinkProps = Omit<LinkProps, 'prefetch'> & {
  children: ReactNode
  className?: string
  prefetch?: PrefetchStrategy
  viewTransition?: boolean
  hitSlop?: number
  unregisterOnCallback?: boolean
  name?: string
}

/** Disables viewTransition when the OS prefers reduced motion; guards environments without matchMedia (SSR, old browsers) */
function resolveViewTransition(viewTransition?: boolean): boolean | undefined {
  if (!viewTransition) return viewTransition
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return viewTransition
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return prefersReducedMotion ? false : viewTransition
}

function SmartLink({
  to,
  children,
  className,
  onPointerEnter,
  onFocus,
  onPointerDown,
  ...rest
}: Omit<CraxLinkProps, 'prefetch' | 'hitSlop' | 'unregisterOnCallback' | 'name'>): ReactElement {
  const ref = useRef<HTMLAnchorElement>(null)
  const path = getPathFromTo(to)

  const triggerPrefetch = useCallback(() => {
    prefetchRoute({ path })
  }, [path])

  // Viewport-based prefetch stays as the baseline signal — hover/focus/pointerdown below cover intent before the link ever scrolls into view
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerPrefetch()
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [triggerPrefetch])

  return (
    <RouterLink
      to={to}
      ref={ref}
      className={className}
      onPointerEnter={(event) => {
        triggerPrefetch()
        onPointerEnter?.(event)
      }}
      onFocus={(event) => {
        triggerPrefetch()
        onFocus?.(event)
      }}
      onPointerDown={(event) => {
        triggerPrefetch()
        onPointerDown?.(event)
      }}
      {...rest}
    >
      {children}
    </RouterLink>
  )
}

function ForesightLink({
  to,
  children,
  className,
  hitSlop = 0,
  unregisterOnCallback = true,
  name = '',
  onPointerDown,
  ...rest
}: Omit<CraxLinkProps, 'prefetch'>): ReactElement {
  const path = getPathFromTo(to)

  const foresightOptions = useMemo(
    () => ({
      callback: () => prefetchRoute({ path }),
      hitSlop,
      name,
      unregisterOnCallback,
    }),
    [path, hitSlop, name, unregisterOnCallback]
  )

  const { elementRef } = useForesight<HTMLAnchorElement>(foresightOptions)

  return (
    <RouterLink
      to={to}
      ref={elementRef}
      className={className}
      onPointerDown={(event) => {
        prefetchRoute({ path })
        onPointerDown?.(event)
      }}
      {...rest}
    >
      {children}
    </RouterLink>
  )
}

export function Link({
  prefetch = 'smart',
  hitSlop,
  unregisterOnCallback,
  name,
  viewTransition,
  ...props
}: CraxLinkProps): ReactElement {
  const safeViewTransition = resolveViewTransition(viewTransition)

  if (prefetch === 'none') return <RouterLink viewTransition={safeViewTransition} {...props} />
  if (prefetch === 'foresight') {
    return (
      <ForesightLink
        hitSlop={hitSlop}
        unregisterOnCallback={unregisterOnCallback}
        name={name}
        viewTransition={safeViewTransition}
        {...props}
      />
    )
  }
  return <SmartLink viewTransition={safeViewTransition} {...props} />
}
