# View Transitions

Crax includes a `useViewTransition` hook that wraps navigations in the browser's native [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). On browsers that do not support it, the fallback is a plain callback with no transition.

## Basic usage

```tsx
import { useViewTransition } from '@crax/hooks'
import { useRouter } from '@crax/router'

export default function NavBar() {
  const { startTransition } = useViewTransition()
  const router = useRouter()

  return (
    <button onClick={() => startTransition(() => router.push('/dashboard'))}>
      Go to Dashboard
    </button>
  )
}
```

## On the Link component

Pass the `viewTransition` prop to any `Link` to wrap that navigation automatically:

```tsx
import { Link } from '@crax/router'

<Link to="/dashboard" viewTransition>
  Dashboard
</Link>
```

`viewTransition` is automatically disabled when the user's OS has `prefers-reduced-motion: reduce` set, regardless of the prop value — no extra check needed on your end.

## Checking support

```tsx
const { isSupported } = useViewTransition()

// isSupported is true when document.startViewTransition is available
```

## Custom transition styles

Add CSS in `src/index.css` to control the animation. The default template includes a simple fade:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 150ms;
}
```

Override with any CSS animation targeting `::view-transition-old(root)` and `::view-transition-new(root)`, or target named elements with `view-transition-name` for element-level transitions.
