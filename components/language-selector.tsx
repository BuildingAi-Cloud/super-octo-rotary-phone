"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

// Simple IP-based language detection (placeholder, real-world apps should use a backend or service)
async function detectLanguage(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/")
    const data = await res.json()
    return data.languages?.split(",")[0] || "en"
  } catch {
    return "en"
  }
}

export function LanguageSelector() {

  const { i18n } = useTranslation()
  const [language, setLanguage] = useState(i18n.language || "en")

  useEffect(() => {
    detectLanguage().then((lng) => {
      setLanguage(lng)
      i18n.changeLanguage(lng)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value)
    i18n.changeLanguage(e.target.value)
  }

  return (
    <select
      aria-label="Select language"
      value={language}
      onChange={handleChange}
      className="border rounded px-2 py-1 text-xs font-mono bg-background text-foreground"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
      <option value="de">Deutsch</option>
      <option value="zh">中文</option>
      {/* Add more languages as needed */}
    </select>
  )
}
