"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"

const OPTIONS = [
  {
    key: "accessibility-large-font",
    label: "Large Font",
    description: "Increase text size across the interface",
  },
  {
    key: "accessibility-high-contrast",
    label: "High Contrast",
    description: "Boost contrast for stronger readability",
  },
  {
    key: "accessibility-dyslexia-font",
    label: "Dyslexia Friendly",
    description: "Use a font optimized for dyslexia support",
  },
  {
    key: "accessibility-reduced-motion",
    label: "Reduced Motion",
    description: "Minimize motion and animations",
  },
]

const STORAGE_KEY = "buildsync_accessibility_options"
const MENU_ID = "buildsync-accessibility-menu"

export function AccessibilityToggle() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstOptionRef = useRef<HTMLButtonElement>(null)

  const activeLabels = OPTIONS
    .filter((opt) => selected.includes(opt.key))
    .map((opt) => opt.label)
  const activeSummary = activeLabels.length > 0 ? activeLabels.join(" • ") : "No modes active"

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      if (Array.isArray(saved)) {
        const valid = saved.filter((key) => OPTIONS.some((opt) => opt.key === key))
        setSelected(valid)
      }
    } catch {
      setSelected([])
    }
  }, [])

  useEffect(() => {
    function handleGlobalInteraction(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setOpen(false)
        return
      }

      if (!(e instanceof MouseEvent)) return
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handleGlobalInteraction)
      document.addEventListener("keydown", handleGlobalInteraction)
    }

    return () => {
      document.removeEventListener("pointerdown", handleGlobalInteraction)
      document.removeEventListener("keydown", handleGlobalInteraction)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      firstOptionRef.current?.focus()
      return
    }

    triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    OPTIONS.forEach(opt => {
      document.body.classList.toggle(opt.key, selected.includes(opt.key))
      document.documentElement.classList.toggle(opt.key, selected.includes(opt.key))
    })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected))
    } catch {
      // Ignore storage write failures.
    }
  }, [selected])

  function handleToggle(optKey: string, optLabel: string) {
    setSelected(sel => {
      const isActive = sel.includes(optKey)
      const newSel = isActive ? sel.filter(k => k !== optKey) : [...sel, optKey]
      toast({
        title: isActive ? `${optLabel} disabled` : `${optLabel} enabled`,
        description: isActive
          ? `The ${optLabel} accessibility option has been turned off.`
          : `The ${optLabel} accessibility option is now active.`
      })
      return newSel
    })
  }

  function resetAccessibilityOptions() {
    setSelected([])
    toast({
      title: "Accessibility reset",
      description: "All accessibility options have been turned off."
    })
  }

  const triggerAriaLabel = selected.length > 0
    ? `Accessibility options. ${selected.length} mode${selected.length > 1 ? "s" : ""} active.`
    : "Accessibility options"

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label={triggerAriaLabel}
        onClick={() => setOpen((v) => !v)}
        className="group relative flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200"
        title={activeSummary}
        type="button"
      >
        <span className="sr-only">Accessibility options</span>
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm-6.5 7a1 1 0 0 1 1-1h10.999a1 1 0 1 1 0 2H13.2v3.65l1.9 6.14a1 1 0 1 1-1.91.59L12 17.3l-1.19 3.84a1 1 0 1 1-1.91-.59l1.9-6.14v-3.65H6.5a1 1 0 0 1-1-1Z"
          />
        </svg>
        {selected.length > 0 && (
          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
        )}
      </button>

      {activeLabels.length > 0 && (
        <span
          className="hidden lg:inline-flex h-9 items-center max-w-[160px] truncate border border-border/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          title={activeSummary}
          aria-live="polite"
        >
          {activeSummary}
        </span>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-[79] bg-background/45 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id={MENU_ID}
            role="menu"
            className="fixed inset-x-2 bottom-2 z-[80] rounded-xl bg-background border border-border shadow-2xl md:absolute md:inset-x-auto md:right-0 md:top-full md:bottom-auto md:mt-2 md:w-[min(92vw,22rem)] md:rounded-md"
          >
            <div className="border-b border-border/60 px-3 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Accessibility</p>
              <p className="mt-1 text-xs text-muted-foreground">Choose display and motion preferences.</p>
            </div>
            <ul className="py-1.5">
              {OPTIONS.map((opt, index) => (
                <li key={opt.key}>
                  <button
                    ref={index === 0 ? firstOptionRef : undefined}
                    className={`w-full text-left px-3 py-2.5 hover:bg-accent/10 flex items-center justify-between gap-3 ${selected.includes(opt.key) ? "text-accent" : ""}`}
                    onClick={() => handleToggle(opt.key, opt.label)}
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={selected.includes(opt.key)}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{opt.label}</span>
                      <span className="block text-xs text-muted-foreground">{opt.description}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-5 min-w-10 items-center rounded-full border px-1 transition-colors ${selected.includes(opt.key) ? "border-accent bg-accent/20 justify-end" : "border-border/70 justify-start"}`}
                    >
                      <span className={`h-3.5 w-3.5 rounded-full ${selected.includes(opt.key) ? "bg-accent" : "bg-muted-foreground/40"}`} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-border/60 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-2">
              <button
                type="button"
                className="px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10"
                onClick={resetAccessibilityOptions}
              >
                Reset Accessibility
              </button>
              <button
                type="button"
                className="px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/10"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
