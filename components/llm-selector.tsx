"use client"

import { useState, useEffect } from "react"

const LLM_OPTIONS = [
  { label: "Ollama (localhost:11434)", value: "http://localhost:11434" },
  { label: "LM Studio (localhost:1234)", value: "http://localhost:1234" },
  { label: "Custom Endpoint...", value: "custom" },
]

export function LlmSelector() {
  const [llmUrl, setLlmUrl] = useState("")
  const [customUrl, setCustomUrl] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("llm_endpoint")
<<<<<<< HEAD
    if (stored) requestAnimationFrame(() => setLlmUrl(stored))
=======
    if (stored) requestAnimationFrame(() => setLlmUrl(stored))
>>>>>>> feature/ui-updates
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setLlmUrl(val)
    if (val !== "custom") {
      localStorage.setItem("llm_endpoint", val)
    }
  }

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value)
    localStorage.setItem("llm_endpoint", e.target.value)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-xs">Select Local LLM Endpoint</label>
      <select value={llmUrl.startsWith("http") ? llmUrl : ""} onChange={handleChange} className="border rounded px-2 py-1 text-xs">
        {LLM_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {llmUrl === "custom" && (
        <input
          type="text"
          placeholder="http://localhost:PORT"
          value={customUrl}
          onChange={handleCustom}
          className="border rounded px-2 py-1 text-xs"
        />
      )}
    </div>
  )
}
