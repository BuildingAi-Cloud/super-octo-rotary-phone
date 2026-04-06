"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"

const OPTIONS = [
  { key: "accessibility-large-font", label: "Large Font" },
  { key: "accessibility-high-contrast", label: "High Contrast" },
  { key: "accessibility-dyslexia-font", label: "Dyslexia Friendly" },
  { key: "accessibility-reduced-motion", label: "Reduced Motion" },
]

const STORAGE_KEY = "buildsync_accessibility_options"
const MENU_ID = "buildsync-accessibility-menu"

export function AccessibilityToggle() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

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
      document.addEventListener("mousedown", handleGlobalInteraction)
      document.addEventListener("keydown", handleGlobalInteraction)
    }

    return () => {
      document.removeEventListener("mousedown", handleGlobalInteraction)
      document.removeEventListener("keydown", handleGlobalInteraction)
    }
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

  return (
    <div className="relative flex items-center gap-2" ref={menuRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label="Accessibility options"
        onClick={() => setOpen((v) => !v)}
        className="group relative flex items-center justify-center w-9 h-9 border border-border hover:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200 bg-background"
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

      <span
        className="hidden lg:inline-flex items-center max-w-[160px] truncate border border-border/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
        title={activeSummary}
        aria-live="polite"
      >
        {activeLabels.length > 0 ? activeSummary : "A11Y Off"}
      </span>

      {open && (
        <div id={MENU_ID} role="menu" className="absolute right-0 mt-2 w-56 rounded bg-background border border-border shadow-lg z-[80]">
          <ul className="py-1">
            {OPTIONS.map(opt => (
              <li key={opt.key}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-accent/10 flex items-center justify-between gap-3 ${selected.includes(opt.key) ? "font-bold text-accent" : ""}`}
                  onClick={() => handleToggle(opt.key, opt.label)}
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={selected.includes(opt.key)}
                >
                  <span>{opt.label}</span>
                  {selected.includes(opt.key) ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/60 px-2 py-2">
            <button
              type="button"
              className="w-full text-left px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10"
              onClick={resetAccessibilityOptions}
            >
              Reset Accessibility
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
