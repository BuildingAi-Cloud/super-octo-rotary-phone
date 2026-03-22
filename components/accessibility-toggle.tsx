"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "@/hooks/use-toast"

const OPTIONS = [
  { key: "accessibility-large-font", label: "Large Font" },
  { key: "accessibility-high-contrast", label: "High Contrast" },
  { key: "accessibility-dyslexia-font", label: "Dyslexia Friendly" },
]

export function AccessibilityToggle() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  useEffect(() => {
    OPTIONS.forEach(opt => {
      document.body.classList.toggle(opt.key, selected.includes(opt.key))
    })
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Accessibility options"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center justify-center w-9 h-9 border border-border hover:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-200 bg-background"
        type="button"
      >
        <span className="sr-only">Accessibility options</span>
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 7v4m0 0v4m0-4h4m-4 0H8" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded bg-background border border-border shadow-lg z-50">
          <ul className="py-1">
            {OPTIONS.map(opt => (
              <li key={opt.key}>
                <button
                  className={`w-full text-left px-4 py-2 hover:bg-accent/10 ${selected.includes(opt.key) ? "font-bold text-accent" : ""}`}
                  onClick={() => handleToggle(opt.key, opt.label)}
                  type="button"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
