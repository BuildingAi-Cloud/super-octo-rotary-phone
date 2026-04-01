"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { GlobalSearch } from "@/components/global-search"
import { useRouter } from "next/navigation"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { getRoleDisplayName } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"


export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [notifCount, setNotifCount] = useState(0);

  // Simulate receiving a notification (replace with real-time logic)
  function simulateNotification() {
    setNotifCount((c) => c + 1);
    toast({
      title: "New Update",
      description: "You have a new notification (work order, IoT alert, or equipment issue)."
    });
  }

  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            <span className="font-[var(--font-bebas)] text-xl tracking-wider text-foreground hover:text-accent transition-colors">
              BUILDSYNC
            </span>
            {user && (
              <>
                <span className="hidden md:block h-4 w-px bg-border" />
                <span className="hidden md:block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {getRoleDisplayName(user.role)}
                </span>
              </>
            )}
          </Link>

          {/* Right: all actions */}
          <nav className="flex items-center gap-3 md:gap-4">
            {/* Notification Bell */}
            {user && (
              <button
                aria-label="Notifications"
                className="relative group flex items-center justify-center w-9 h-9 border border-border hover:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200 bg-background"
                onClick={simulateNotification}
                type="button"
                title="Notifications"
              >
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 22c1.1 0 2-.9 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-5-6.32V4a1 1 0 1 0-2 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 17z" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">{notifCount}</span>
                )}
              </button>
            )}
            {/* Global Search */}
            <GlobalSearch />
            {user && (
              <>
                {/* Accessibility (post-login only) */}
                <AccessibilityToggle />
                {/* AI Chat (post-login only) */}
                <Link
                  href="/ai-chat"
                  className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                  aria-label="Open AI Chat"
                  title="Try AI Chat — runs locally in your browser"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                  </svg>
                  <span className="hidden sm:inline">AI Chat</span>
                </Link>
              </>
            )}
            {/* Theme toggle */}
            <ThemeToggle />
            {/* Language selector */}
            <LanguageSelector />
            {/* Auth actions */}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                >
                  <ScrambleTextOnHover text={t("dashboard") as string} as="span" duration={0.4} />
                </Link>
                {(user.role === "building_manager" || user.role === "staff" || user.role === "admin") && (
                  <Link
                    href="/settings"
                    className="group inline-flex items-center gap-2 border border-muted px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                  >
                    <ScrambleTextOnHover text={t("settings") as string} as="span" duration={0.4} />
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/audit-log"
                    className="group inline-flex items-center gap-2 border border-muted px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                  >
                    <ScrambleTextOnHover text={t("auditLog", "Audit Log") as string} as="span" duration={0.4} />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
                  aria-label="Logout"
                >
                  <ScrambleTextOnHover text={t("logout", "Sign Out") as string} as="span" duration={0.4} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <ScrambleTextOnHover text={t("signIn", "Sign In") as string} as="span" duration={0.4} />
                </Link>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
                >
                  <ScrambleTextOnHover text={t("getStarted", "Get Started") as string} as="span" duration={0.4} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
