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
import { useState, useEffect } from "react"
import { BackButton } from "@/components/back-button"


export function Header() {
  const { user, availableRoles, signOut, switchRole } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [notifCount, setNotifCount] = useState(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // The badge only becomes interactive when the session exposes more than one
  // distinct role for the same signed-in user.
  const canSwitchRoles = user && availableRoles.filter((role, index, roles) => roles.indexOf(role) === index).length > 1;

  useEffect(() => {
    if (!user) {
      setNotifCount(0)
      setShowRoleMenu(false)
      return
    }

    const stored = JSON.parse(localStorage.getItem(`buildsync_notifications_${user.id}`) || "[]")
    const unread = Array.isArray(stored) ? stored.filter((item) => item && item.read === false).length : 0
    setNotifCount(unread)
  }, [user])

  function openNotifications() {
    router.push("/notifications")
  }

  // Switching role updates auth state first, then sends the user back through
  // dashboard routing so they land on the correct role-specific experience.
  function handleRoleSwitch(nextRole: typeof availableRoles[number]) {
    switchRole(nextRole)
    setShowRoleMenu(false)
    router.push("/dashboard")
  }

  const handleLogout = () => {
    signOut();
    setShowRoleMenu(false)
    router.push("/signin");
  };

  return (
    <>
      <header className="safe-top-pad fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/85 backdrop-blur-md">
        <div className="safe-inline-pad max-w-screen-xl mx-auto flex items-center justify-between gap-3 py-3 md:py-4">

          <div className="flex items-center gap-3 md:gap-4">
            {/* Global back action so users can quickly return from any page with shared header. */}
            <BackButton />
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
              <span className="font-[var(--font-bebas)] text-xl tracking-wider text-foreground hover:text-accent transition-colors">
                BUILDSYNC
              </span>
              </Link>
              {user && (
                <>
                  <span className="h-4 w-px bg-border" />
                  <div className="relative">
                    {canSwitchRoles ? (
                      <>
                        {/* Clickable badge for multi-access users. Single-role users
                            see the same badge rendered as static text below. */}
                        <button
                          type="button"
                          onClick={() => setShowRoleMenu((value) => !value)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-border/40 rounded-sm font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:border-accent/50 hover:text-accent transition-colors"
                          aria-haspopup="menu"
                          aria-expanded={showRoleMenu}
                          title="Switch access role"
                        >
                          <span>{getRoleDisplayName(user.role)}</span>
                          <svg className={`w-3 h-3 transition-transform ${showRoleMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {showRoleMenu && (
                          // The menu is built from auth-context state, so it stays
                          // aligned with whatever access roles were assigned at sign-in.
                          <div className="absolute left-0 mt-2 min-w-[220px] border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl">
                            <div className="px-3 py-2 border-b border-border/20 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                              Switch Access
                            </div>
                            <div className="py-1">
                              {availableRoles.map((role) => {
                                const isActive = role === user.role
                                return (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleSwitch(role)}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-left font-mono text-[11px] uppercase tracking-widest transition-colors ${isActive ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                                  >
                                    <span>{getRoleDisplayName(role)}</span>
                                    {isActive && <span className="text-[10px]">Active</span>}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 border border-border/40 rounded-sm font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: all actions */}
          <nav className="flex items-center gap-2 md:gap-4 min-w-0 overflow-x-auto md:overflow-visible scrollbar-hide">
            {/* Notification Bell */}
            {user && (
              <button
                aria-label="Notifications"
                className="relative group flex items-center justify-center w-9 h-9 border border-border hover:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200 bg-background"
                onClick={openNotifications}
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
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            {/* Accessibility controls should be available for all users, including pre-login pages. */}
            <AccessibilityToggle />
            {user && (
              <>
                {/* AI Chat (post-login only) */}
                <Link
                  href="/ai-chat"
                  className="hidden md:inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
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
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            {/* Auth actions */}
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                >
                  <ScrambleTextOnHover text={t("dashboard") as string} as="span" duration={0.4} />
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center w-9 h-9 border border-muted text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
                  aria-label={t("settings") as string}
                  title={t("settings") as string}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.094c.55 0 1.02.398 1.11.94l.149.898c.048.29.24.536.505.662.266.127.577.116.835-.02l.8-.424a1.125 1.125 0 011.35.236l.774.774c.39.39.48.99.236 1.35l-.424.8a.94.94 0 00-.02.835c.126.265.372.457.662.505l.898.149c.542.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.898.149a.94.94 0 00-.662.505 1.04 1.04 0 00.02.835l.424.8c.244.46.154 1.06-.236 1.35l-.774.774a1.125 1.125 0 01-1.35.236l-.8-.424a1.04 1.04 0 00-.835-.02.94.94 0 00-.505.662l-.149.898a1.125 1.125 0 01-1.11.94h-1.094a1.125 1.125 0 01-1.11-.94l-.149-.898a.94.94 0 00-.505-.662 1.04 1.04 0 00-.835.02l-.8.424a1.125 1.125 0 01-1.35-.236l-.774-.774a1.125 1.125 0 01-.236-1.35l.424-.8a1.04 1.04 0 00.02-.835.94.94 0 00-.662-.505l-.898-.149a1.125 1.125 0 01-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.898-.149a.94.94 0 00.662-.505 1.04 1.04 0 00-.02-.835l-.424-.8a1.125 1.125 0 01.236-1.35l.774-.774a1.125 1.125 0 011.35-.236l.8.424c.258.136.57.147.835.02a.94.94 0 00.505-.662l.149-.898z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
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
                <div className="md:hidden">
                  <GlobalSearch />
                </div>
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
