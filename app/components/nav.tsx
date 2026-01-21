import Link from 'next/link'

export function Nav() {
  return (
    <nav className="flex space-x-4 mb-4">
      <Link href="/" className="hover:underline">
        Home
      </Link>
      <Link href="/dashboard" className="hover:underline">
        Memory Dashboard
      </Link>
      <Link href="/analytics" className="hover:underline">
        Memory Analytics
      </Link>
    </nav>
  )
} 