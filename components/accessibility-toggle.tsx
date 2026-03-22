"use client"

import { useState, useEffect, useRef } from "react"

const OPTIONS = [
  { key: "fontSize", label: "Large Font" },
  { key: "highContrast", label: "High Contrast" },
  { key: "dyslexiaFont", label: "Dyslexia Friendly" },
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
    document.body.classList.toggle("accessibility-large-font", selected.includes("fontSize"))
    document.body.classList.toggle("accessibility-high-contrast", selected.includes("highContrast"))
    document.body.classList.toggle("accessibility-dyslexia-font", selected.includes("dyslexiaFont"))
  }, [selected])

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
                  onClick={() => setSelected(sel => sel.includes(opt.key) ? sel.filter(k => k !== opt.key) : [...sel, opt.key])}
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
