import { useMemo } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import type { CraxRouter } from "./types"

/**
 * Unified router hook — wraps useNavigate, useLocation, and useParams.
 * Mirrors the Next.js useRouter() experience.
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

  return useMemo(
    () => ({
      push: (path: string) => navigate(path),
      replace: (path: string) => navigate(path, { replace: true }),
      back: () => navigate(-1),
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      params: params as Record<string, string | undefined>,
    }),
    [navigate, location, params]
  )
}
