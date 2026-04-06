"use client"

import { useEffect, useState } from "react"
import i18n from "@/lib/i18n"
import { useTranslation } from "react-i18next"

const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "zh"] as const
const LANGUAGE_STORAGE_KEY = "buildsync_language"

function normalizeLanguageCode(value: string | null | undefined): string {
  const code = (value || "").trim().toLowerCase()
  if (!code) {
    return "en"
  }

  const baseCode = code.split("-")[0]
  return SUPPORTED_LANGUAGES.includes(baseCode as (typeof SUPPORTED_LANGUAGES)[number]) ? baseCode : "en"
}

// Simple IP-based language detection (placeholder, real-world apps should use a backend or service)
async function detectLanguage(): Promise<string> {
  try {
    const res = await fetch("https://ipapi.co/json/")
    const data = await res.json()
    return normalizeLanguageCode(data.languages?.split(",")[0])
  } catch {
    return "en"
  }
}

export function LanguageSelector() {

  const { i18n: i18nInstance } = useTranslation()
  const activeI18n = typeof i18nInstance?.changeLanguage === "function" ? i18nInstance : i18n
  const [language, setLanguage] = useState(normalizeLanguageCode(activeI18n.resolvedLanguage || activeI18n.language))

  useEffect(() => {
    let isMounted = true

    const savedLanguage = normalizeLanguageCode(localStorage.getItem(LANGUAGE_STORAGE_KEY))

    if (savedLanguage !== normalizeLanguageCode(activeI18n.resolvedLanguage || activeI18n.language)) {
      setLanguage(savedLanguage)
      void activeI18n.changeLanguage(savedLanguage)
    }

    if (!localStorage.getItem(LANGUAGE_STORAGE_KEY)) {
      detectLanguage().then((detectedLanguage) => {
        if (!isMounted) return

        setLanguage(detectedLanguage)
        localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage)
        void activeI18n.changeLanguage(detectedLanguage)
      })
    }

    const handleLanguageChanged = (lng: string) => {
      setLanguage(normalizeLanguageCode(lng))
    }

    activeI18n.on("languageChanged", handleLanguageChanged)

    return () => {
      isMounted = false
      activeI18n.off("languageChanged", handleLanguageChanged)
    }
  }, [activeI18n])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = normalizeLanguageCode(e.target.value)
    setLanguage(nextLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage)
    void activeI18n.changeLanguage(nextLanguage)
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
