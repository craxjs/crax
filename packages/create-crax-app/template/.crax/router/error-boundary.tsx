import { Component, type ReactNode, type ErrorInfo } from "react"

type ErrorBoundaryProps = {
  fallback: ComponentType | null
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

type ComponentType = React.ComponentType

/**
 * Error boundary component. Catches render errors in children
 * and displays a fallback UI.
 *
 * React requires class components for error boundaries —
 * there is no hook-based alternative.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState & { error?: Error } = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[crax] ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback
      if (Fallback) return <Fallback />
      return (
        <div style={{color: "red", padding: 20, fontFamily: "monospace", whiteSpace: "pre-wrap"}}>
          <h1>Error</h1>
          <p>{this.state.error?.message}</p>
          <p>{this.state.error?.stack}</p>
        </div>
      )
    }

    return this.props.children
  }
}
