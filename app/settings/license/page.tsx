"use client"

import { useEffect, useMemo, useState } from "react"
import { BackButton } from "@/components/back-button"

type LicenseStatus = {
  mode: "saas" | "onprem" | "hybrid"
  valid: boolean
  reason: string
  readOnly: boolean
  aiEnabled: boolean
  daysRemaining: number | null
  seats: number | null
  capabilities: string[]
  customer: string | null
  product: string | null
  expiresAt: string | null
  provider: string
}

export default function LicensePage() {
  const [status, setStatus] = useState<LicenseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [licenseKey, setLicenseKey] = useState("")
  const [message, setMessage] = useState("")

  const loadStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/license/status", { cache: "no-store" })
      const data = (await response.json()) as { status: LicenseStatus }
      setStatus(data.status)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
    const timer = window.setInterval(() => {
      loadStatus()
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const runValidation = async () => {
    setMessage("")
    const response = await fetch("/api/license/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    })
    const data = (await response.json()) as { status: LicenseStatus }
    setStatus(data.status)
    setMessage(data.status.valid ? "License signature verified" : data.status.reason)
  }

  const runHeartbeat = async () => {
    setMessage("")
    const response = await fetch("/api/license/heartbeat", { method: "POST" })
    const data = (await response.json()) as { ok: boolean; message: string }
    setMessage(data.message)
    await loadStatus()
  }

  const stateBadge = useMemo(() => {
    if (!status) return "Unknown"
    if (status.readOnly) return "Read-Only Degraded State"
    return "Full Access"
  }, [status])

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-8">
      <div className="mb-4">
        <BackButton fallbackHref="/settings" />
      </div>

      <header className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Licensing</p>
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Enterprise License</h1>
        <p className="text-sm text-muted-foreground mt-2">
          On-Prem uses signed licenses with graceful degraded states. SaaS mode remains validated by hosted auth and subscription checks.
        </p>
      </header>

      <section className="border border-border/40 rounded-lg p-4 md:p-6 bg-card/20 mb-6">
        {loading ? (
          <p className="font-mono text-xs text-muted-foreground">Checking license...</p>
        ) : status ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-border/40 rounded-md">Mode: {status.mode}</span>
              <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-border/40 rounded-md">Provider: {status.provider}</span>
              <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-md ${status.readOnly ? "border-yellow-500/60 text-yellow-600" : "border-green-500/60 text-green-600"}`}>{stateBadge}</span>
            </div>

            <p className="text-sm text-muted-foreground">{status.reason}</p>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><dt className="text-muted-foreground">Customer</dt><dd>{status.customer || "n/a"}</dd></div>
              <div><dt className="text-muted-foreground">Product</dt><dd>{status.product || "n/a"}</dd></div>
              <div><dt className="text-muted-foreground">Seat Limit</dt><dd>{status.seats ?? "n/a"}</dd></div>
              <div><dt className="text-muted-foreground">Days Remaining</dt><dd>{status.daysRemaining ?? "n/a"}</dd></div>
              <div><dt className="text-muted-foreground">AI Enabled</dt><dd>{status.aiEnabled ? "Yes" : "No"}</dd></div>
              <div><dt className="text-muted-foreground">Capabilities</dt><dd>{status.capabilities.join(", ") || "n/a"}</dd></div>
            </dl>
          </div>
        ) : null}
      </section>

      <section className="border border-border/40 rounded-lg p-4 md:p-6 bg-card/20 mb-6">
        <h2 className="font-semibold mb-3">Validate Signed License Key</h2>
        <textarea
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Paste signed license key (payload.signature)"
          className="w-full min-h-28 border border-border/40 bg-background rounded-md px-3 py-2 text-xs font-mono"
        />
        <div className="flex gap-3 mt-3">
          <button type="button" onClick={runValidation} className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors">
            Validate Key
          </button>
          <button type="button" onClick={runHeartbeat} className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-border/40 text-muted-foreground rounded-md hover:text-accent hover:border-accent/40 transition-colors">
            Send Heartbeat
          </button>
        </div>
        {message && <p className="mt-3 font-mono text-xs text-muted-foreground">{message}</p>}
      </section>

      <section className="border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
        <h2 className="font-semibold mb-2">Degraded States</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Expired license: system becomes read-only and AI queries are disabled.</li>
          <li>Seat limit reached: show guidance to contact admin for seat expansion.</li>
          <li>Heartbeat stale beyond grace period: system stays readable but locks write operations.</li>
        </ul>
      </section>
    </main>
  )
}
