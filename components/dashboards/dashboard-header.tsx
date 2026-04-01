"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth, getRoleDisplayName, type User } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { signOut } = useAuth()
  const [notifCount, setNotifCount] = useState(0)

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  function handleNotification() {
    setNotifCount((c) => c + 1)
    toast({ title: "New Update", description: "You have a new notification." })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/90 backdrop-blur-md h-14 md:h-16">
      <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="font-[var(--font-bebas)] text-lg md:text-xl tracking-wider text-foreground hover:text-accent transition-colors">
            BUILDSYNC
          </span>
          <span className="hidden md:block h-4 w-px bg-border" />
          <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {getRoleDisplayName(user.role)}
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Notification bell */}
          <button
            aria-label="Notifications"
            className="relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 border border-border hover:border-accent rounded-md focus-visible:ring-2 focus-visible:ring-accent transition-colors bg-background"
            onClick={handleNotification}
            type="button"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 22c1.1 0 2-.9 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 17z" />
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">{notifCount}</span>
            )}
          </button>
          <ThemeToggle />
          {/* User avatar */}
          <div className="hidden sm:flex items-center gap-2 ml-1">
            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
              <span className="font-mono text-[10px] font-bold text-accent uppercase">{user.name?.charAt(0) || "U"}</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground hidden lg:block max-w-[120px] truncate">{user.name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors px-2 py-1 border border-border/40 rounded-md hover:border-accent/40"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
