"use client"

import Link from "next/link"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth-context"
import { ScrambleTextOnHover } from "@/components/scramble-text"
import { ThemeToggle } from "@/components/theme-toggle"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { getRoleDisplayName } from "@/lib/auth-context"
import { SplitFlapText, SplitFlapAudioProvider } from "@/components/split-flap-text"
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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-wrap items-center gap-2 md:gap-6 p-4 md:p-6 bg-background/80 backdrop-blur border-b border-border">
      <div
        className="flex items-center min-w-[120px] md:min-w-[180px] justify-center"
        style={{ maxHeight: 200 }}
      >
        <Link
          href="/"
          className="flex items-center"
          aria-label="Home"
          style={{ maxHeight: 200 }}
        >
          <SplitFlapAudioProvider>
            <SplitFlapText
              text="BUILDSYNC"
              speed={80}
              className="max-h-[48px] md:max-h-[120px] lg:max-h-[200px] h-full w-auto px-2 md:px-4"
            />
          </SplitFlapAudioProvider>
        </Link>
      </div>
      <div className="flex-1 flex flex-wrap items-center gap-2 md:gap-4">
        <AccessibilityToggle />
        <ThemeToggle />
        <LanguageSelector />
        {user && (
          <span className="hidden md:inline-block font-mono text-xs text-muted-foreground ml-2" aria-label="User role">
            {getRoleDisplayName(user.role)}
          </span>
        )}
      </div>
      <nav className="flex items-center gap-2 md:gap-4">
        <Link
          href="/about"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors duration-200"
        >
          About
        </Link>
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            >
              <ScrambleTextOnHover text={t("dashboard")} as="span" duration={0.4} />
            </Link>
            {/* Settings link for property_manager, staff, admin */}
            {(user.role === "property_manager" || user.role === "staff" || user.role === "admin") && (
              <Link
                href="/settings"
                className="group inline-flex items-center gap-2 border border-muted px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
              >
                <ScrambleTextOnHover text={t("settings")} as="span" duration={0.4} />
              </Link>
            )}
            {/* Audit Log for admin */}
            {user.role === "admin" && (
              <Link
                href="/audit-log"
                className="group inline-flex items-center gap-2 border border-muted px-4 py-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-accent hover:text-accent transition-all duration-200"
              >
                <ScrambleTextOnHover text={t("auditLog", "Audit Log")} as="span" duration={0.4} />
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
              <ScrambleTextOnHover text={t("signIn", "Sign In")} as="span" duration={0.4} />
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 border border-foreground/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200"
            >
              <ScrambleTextOnHover text={t("getStarted", "Get Started")} as="span" duration={0.4} />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
