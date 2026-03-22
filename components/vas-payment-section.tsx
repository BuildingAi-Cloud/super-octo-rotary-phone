"use client"
import { useState } from "react"

export function VasPaymentSection({ enabled = true }: { enabled?: boolean }) {
  const [amount, setAmount] = useState("")
  const [type, setType] = useState("rent")
  const [status, setStatus] = useState<string | null>(null)

  if (!enabled) {
    return (
      <div className="bg-card/80 p-8 rounded-lg shadow-lg max-w-lg mx-auto text-center mt-12">
        <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Payment Service Unavailable</h2>
        <p className="font-mono text-sm text-muted-foreground">Payment of rent and maintenance is not enabled for your building/unit. Please contact management for details.</p>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus("Please enter a valid amount.")
      return
    }
    setStatus("Processing payment...")
    setTimeout(() => {
      setStatus("Payment successful! Receipt sent to your email.")
      setAmount("")
      setType("rent")
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card/80 p-8 rounded-lg shadow-lg max-w-lg mx-auto mt-12">
      <h2 className="font-[var(--font-bebas)] text-2xl mb-4">Pay Rent & Maintenance <span className="font-mono text-xs text-accent">(VAS)</span></h2>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Payment Type</label>
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
        >
          <option value="rent">Rent</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Amount</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full border border-border bg-card/50 px-4 py-3 font-mono text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
          placeholder="Enter amount (e.g. 1200)"
          required
        />
      </div>
      <button
        type="submit"
        className="group w-full inline-flex items-center justify-center gap-3 bg-accent px-6 py-4 font-mono text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 transition-all duration-200"
      >
        Pay Now
      </button>
      {status && <div className="mt-2 font-mono text-xs text-accent">{status}</div>}
    </form>
  )
}
