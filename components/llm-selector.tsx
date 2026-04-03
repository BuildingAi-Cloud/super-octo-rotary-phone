"use client"

import { useState, useEffect } from "react"
import { getAiMode, getDefaultLlmEndpoint, isOnPremRuntime } from "@/lib/runtime-public"

const LLM_OPTIONS = [
  { label: "Ollama (localhost:11434)", value: "http://localhost:11434" },
  { label: "LM Studio (localhost:1234)", value: "http://localhost:1234" },
  { label: "Custom Endpoint...", value: "custom" },
]

export function LlmSelector() {
  const [llmUrl, setLlmUrl] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const aiMode = getAiMode()
  const onPremRuntime = isOnPremRuntime()
  const defaultEndpoint = getDefaultLlmEndpoint()

  useEffect(() => {
    const stored = localStorage.getItem("llm_endpoint")
    requestAnimationFrame(() => {
      const next = stored || defaultEndpoint
      setLlmUrl(next)
      if (!stored) {
        localStorage.setItem("llm_endpoint", next)
      }
    })
  }, [defaultEndpoint])

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
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        Mode: {aiMode === "local" ? "Local AI" : "Cloud AI"} {onPremRuntime ? "(On-Prem Runtime)" : "(SaaS Runtime)"}
      </p>
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
