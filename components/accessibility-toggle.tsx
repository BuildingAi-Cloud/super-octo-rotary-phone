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
    const saved = JSON.parse(localStorage.getItem("buildsync_accessibility_options") || "[]")
    if (Array.isArray(saved)) {
      const valid = saved.filter((key) => OPTIONS.some((opt) => opt.key === key))
      setSelected(valid)
    }
  }, [])

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
      document.documentElement.classList.toggle(opt.key, selected.includes(opt.key))
    })
    localStorage.setItem("buildsync_accessibility_options", JSON.stringify(selected))
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
        <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2.75a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5Zm-6.5 7a1 1 0 0 1 1-1h10.999a1 1 0 1 1 0 2H13.2v3.65l1.9 6.14a1 1 0 1 1-1.91.59L12 17.3l-1.19 3.84a1 1 0 1 1-1.91-.59l1.9-6.14v-3.65H6.5a1 1 0 0 1-1-1Z"
          />
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
