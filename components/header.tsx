"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 right-0 z-50 flex items-center gap-3 p-4 md:p-6">
      <ThemeToggle />
      {user ? (
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
        >
          <ScrambleTextOnHover text="Dashboard" as="span" duration={0.4} />
        </Link>
      ) : (
        <>
          <Link
            href="/signin"
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ScrambleTextOnHover text="Sign In" as="span" duration={0.4} />
          </Link>
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
          >
            <ScrambleTextOnHover text="Get Started" as="span" duration={0.4} />
          </Link>
        </>
      )}
    </header>
  )
}
