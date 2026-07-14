import { useMemo } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import type { CraxRouter } from "./types"

/**
 * Unified router hook — wraps useNavigate, useLocation, and useParams.
 * Mirrors the Next.js useRouter() experience.
 *
 * `searchParams` is memoized on the query string alone, so its identity
 * is referentially stable across navigations that don't change the query
 * (e.g. pathname/hash/params changes) — safe to use as an effect dependency.
 *
 * @example
 * ```tsx
 * const router = useRouter()
 * router.push("/dashboard")
 * router.replace("/login")
 * router.back()
 * console.log(router.pathname)    // "/dashboard/settings"
 * console.log(router.params)      // { id: "123" }
 * ```
 */
export function useRouter(): CraxRouter {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search])

  return useMemo(
    () => ({
      push: (path: string) => navigate(path),
      replace: (path: string) => navigate(path, { replace: true }),
      back: () => navigate(-1),
      pathname: location.pathname,
      searchParams,
      params: params as Record<string, string | undefined>,
    }),
    [navigate, location, params, searchParams]
  )
}
