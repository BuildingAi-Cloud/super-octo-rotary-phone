"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { getRoleDisplayName } from "@/lib/auth-context"
import { GlobalSearch } from "@/components/global-search"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 dark:bg-background/80 backdrop-blur border-b border-border">
      <div className="w-full max-w-screen-xl mx-auto flex items-center min-h-[64px] px-4 md:px-8">
        {/* Accessibility button always visible for accessibility */}
        <div className="mr-2">
          <AccessibilityToggle />
        </div>
        <nav className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Global Search button */}
          <GlobalSearch />
          {/* 1. Theme toggle */}
          <ThemeToggle />
          {/* 2. Language selector */}
          <LanguageSelector />
          {/* 3. Resources dropdown */}
          <div className="relative group">
            <button className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors duration-200 px-2 py-1 flex items-center gap-1">
              Resources
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-50">
              <ul className="py-2">
                <li>
                  <Link href="/about" className="block px-4 py-2 font-mono text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">About</Link>
                </li>
                <li>
                  <Link href="/documentation" className="block px-4 py-2 font-mono text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">Documentation</Link>
                </li>
                <li>
                  <Link href="/api-reference" className="block px-4 py-2 font-mono text-xs text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors">API Reference</Link>
                </li>
              </ul>
            </div>
          </div>
          {/* 4. Sign in / 5. Get Started */}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
              >
                <ScrambleTextOnHover text={t("dashboard") as string} as="span" duration={0.4} />
              </Link>
              {(user.role === "property_manager" || user.role === "staff" || user.role === "admin") && (
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
                className="ml-2 px-4 py-2 border border-destructive text-destructive font-mono text-xs uppercase tracking-widest rounded hover:bg-destructive hover:text-white transition-all duration-200"
                aria-label="Logout"
              >
                {t("logout")}
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
          {user && (
            <span className="hidden md:inline-block font-mono text-xs text-muted-foreground ml-2" aria-label="User role">
              {getRoleDisplayName(user.role)}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
