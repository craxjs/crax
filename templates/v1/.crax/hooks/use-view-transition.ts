import { useCallback } from 'react'

type TransitionCallback = () => void | Promise<void>

export function useViewTransition() {
  const startTransition = useCallback((callback: TransitionCallback) => {
    if ('startViewTransition' in document) {
      document.startViewTransition(() => {
        Promise.resolve(callback()).catch(console.error)
      })
    } else {
      Promise.resolve(callback()).catch(console.error)
    }
  }, [])

  const isSupported = typeof document !== 'undefined' && 'startViewTransition' in document

  return { startTransition, isSupported }
}
