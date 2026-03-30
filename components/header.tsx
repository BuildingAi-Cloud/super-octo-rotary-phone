"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { getRoleDisplayName } from "@/lib/auth-context"
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 dark:bg-background/80 backdrop-blur border-b border-border flex items-center min-h-[64px] px-4 md:px-8">
      {/* Accessibility button always visible for accessibility */}
      <div className="mr-2">
        <AccessibilityToggle />
      </div>
      <nav className="flex items-center gap-2 md:gap-4 ml-auto">
        {/* 1. Theme toggle */}
        <ThemeToggle />
        {/* 2. Language selector */}
        <LanguageSelector />
        {/* 3. About page */}
        <Link
          href="/about"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          About
        </Link>
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
    </header>
  );
}
