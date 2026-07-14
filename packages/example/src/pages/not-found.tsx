import { Link } from '@crax/router'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-6xl font-bold text-amber-500">404</h1>
      <p className="text-xl text-neutral-600">Page not found</p>
      <Link to="/" className="mt-4 text-amber-500 underline underline-offset-4 hover:text-amber-600">
        Go home
      </Link>
    </main>
  )
}
