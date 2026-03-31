"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// Provide default values so context works even before provider mounts
const defaultContext: ThemeContextType = {
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
<<<<<<< HEAD

  useEffect(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      setThemeState(stored)
=======
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    // Check localStorage first, then system preference
    const stored = localStorage.getItem("theme") as Theme | null
    if (stored) {
      requestAnimationFrame(() => setThemeState(stored))
>>>>>>> feature/ui-updates
      document.documentElement.classList.toggle("dark", stored === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialTheme = prefersDark ? "dark" : "light"
<<<<<<< HEAD
      setThemeState(initialTheme)
=======
      requestAnimationFrame(() => setThemeState(initialTheme))
>>>>>>> feature/ui-updates
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext)
}
