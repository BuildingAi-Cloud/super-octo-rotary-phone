"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, getRoleDisplayName, type User } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  return (
    <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4">
          <span className="font-[var(--font-bebas)] text-xl tracking-wider text-foreground hover:text-accent transition-colors">
            BUILDSYNC
          </span>
          <span className="hidden md:block h-4 w-px bg-border" />
          <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {getRoleDisplayName(user.role)}
          </span>
        </Link>

        {/* User info & actions */}
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <div className="hidden md:block text-right">
            <p className="font-mono text-xs text-foreground">{user.name}</p>
            <p className="font-mono text-[10px] text-muted-foreground">{user.email}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            <ScrambleTextOnHover text="Sign Out" as="span" duration={0.4} />
          </button>
        </div>
      </div>
    </header>
  )
}
