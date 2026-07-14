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
import { routeImportMap } from '../utils/enhance-router'
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

function SmartLink({
  to,
  children,
  className,
  ...rest
}: Omit<CraxLinkProps, 'prefetch' | 'hitSlop' | 'unregisterOnCallback' | 'name'>): ReactElement {
  const ref = useRef<HTMLAnchorElement>(null)
  const didPrefetch = useRef(false)

  const prefetchRoute = useCallback(async () => {
    if (didPrefetch.current) return
    didPrefetch.current = true
    const path = typeof to === 'string' ? to : (to as { pathname?: string })?.pathname ?? ''
    const importer = routeImportMap.get(path)
    if (importer) await importer()
  }, [to])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prefetchRoute()
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [prefetchRoute])

  return (
    <RouterLink to={to} ref={ref} className={className} {...rest}>
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
  ...rest
}: Omit<CraxLinkProps, 'prefetch'>): ReactElement {
  const foresightOptions = useMemo(
    () => ({
      callback: async () => {
        const path = typeof to === 'string' ? to : (to as { pathname?: string })?.pathname ?? ''
        const importer = routeImportMap.get(path)
        if (importer) await importer()
      },
      hitSlop,
      name,
      unregisterOnCallback,
    }),
    [to, hitSlop, name, unregisterOnCallback]
  )

  const { elementRef } = useForesight<HTMLAnchorElement>(foresightOptions)

  return (
    <RouterLink to={to} ref={elementRef} className={className} {...rest}>
      {children}
    </RouterLink>
  )
}

export function Link({
  prefetch = 'smart',
  hitSlop,
  unregisterOnCallback,
  name,
  ...props
}: CraxLinkProps): ReactElement {
  if (prefetch === 'none') return <RouterLink {...props} />
  if (prefetch === 'foresight') {
    return (
      <ForesightLink
        hitSlop={hitSlop}
        unregisterOnCallback={unregisterOnCallback}
        name={name}
        {...props}
      />
    )
  }
  return <SmartLink {...props} />
}
