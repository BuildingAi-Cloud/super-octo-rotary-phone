"use client"

import { useAuth } from "@/lib/auth-context"
import { ROLE_TEMPLATES } from "@/lib/rbac"
import { LlmSelector } from "@/components/llm-selector"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

export default function SettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [activeSection, setActiveSection] = useState<"profile" | "notifications" | "billing" | "system">("profile")

  // Personal settings state (available for all authenticated users)
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)

  // SMTP/SendGrid settings state
  const [smtpHost, setSmtpHost] = useState("")
  const [smtpPort, setSmtpPort] = useState("")
  const [smtpUser, setSmtpUser] = useState("")
  const [smtpPass, setSmtpPass] = useState("")
  const [sendgridApiKey, setSendgridApiKey] = useState("")

  // Subscription/Billing state
  const [subscriptionPlan, setSubscriptionPlan] = useState("professional")
  const [subscriptionUnits, setSubscriptionUnits] = useState(50)
  const [subscriptionInterval, setSubscriptionInterval] = useState<"monthly" | "yearly">("monthly")
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "paused" | "canceled">("active")
  const [nextBillingAt, setNextBillingAt] = useState("")

  const [status, setStatus] = useState("")

  const canAccessSystemSettings = user ? ROLE_TEMPLATES[user.role]?.canAccessSettings : false

  // Shared transition profile for section swaps to keep motion consistent.
  const sectionTransition = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: "easeOut" as const },
  }

  useEffect(() => {
    if (!user) return

    const profileSaved = JSON.parse(localStorage.getItem(`buildsync_profile_settings_${user.id}`) || "{}")
    setDisplayName(profileSaved.displayName || user.name || "")
    setPhone(profileSaved.phone || "")
    setEmailNotifications(profileSaved.emailNotifications ?? true)
    setSmsNotifications(profileSaved.smsNotifications ?? false)
    setPushNotifications(profileSaved.pushNotifications ?? true)

    const systemSaved = JSON.parse(localStorage.getItem("buildsync_settings") || "{}")
    setSmtpHost(systemSaved.smtpHost || "")
    setSmtpPort(systemSaved.smtpPort || "")
    setSmtpUser(systemSaved.smtpUser || "")
    setSmtpPass(systemSaved.smtpPass || "")
    setSendgridApiKey(systemSaved.sendgridApiKey || "")

    const subSaved = JSON.parse(localStorage.getItem(`buildsync_subscription_${user.id}`) || "{}")
    if (subSaved.plan) {
      setSubscriptionPlan(subSaved.plan)
      setSubscriptionUnits(subSaved.units || 50)
      setSubscriptionInterval(subSaved.interval || "monthly")
      setSubscriptionStatus(subSaved.status || "active")
      setNextBillingAt(subSaved.nextBillingAt || "")
    }
  }, [user])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    localStorage.setItem(
      `buildsync_profile_settings_${user.id}`,
      JSON.stringify({
        displayName,
        phone,
        emailNotifications,
        smsNotifications,
        pushNotifications,
      }),
    )
    setStatus("Personal settings saved")
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAccessSystemSettings) return

    localStorage.setItem("buildsync_settings", JSON.stringify({ smtpHost, smtpPort, smtpUser, smtpPass, sendgridApiKey }))
    setStatus("System settings saved")
  }

  const handleTest = async () => {
    if (!canAccessSystemSettings) return
    setStatus("Testing... (demo only, no real email sent)")
    setTimeout(() => setStatus("Test complete (demo only)"), 1200)
  }

  const saveSubscription = (interval: "monthly" | "yearly", status?: "active" | "paused" | "canceled") => {
    if (!user) return
    const now = new Date()
    const next = new Date(now)
    if (interval === "monthly") next.setMonth(next.getMonth() + 1)
    else next.setFullYear(next.getFullYear() + 1)

    const payload = {
      plan: subscriptionPlan,
      units: Math.max(10, Math.min(1000, subscriptionUnits || 50)),
      interval,
      status: status || subscriptionStatus,
      startedAt: now.toISOString(),
      nextBillingAt: next.toISOString(),
      source: "settings",
    }
    localStorage.setItem(`buildsync_subscription_${user.id}`, JSON.stringify(payload))
    setSubscriptionInterval(interval)
    setSubscriptionStatus(payload.status)
    setNextBillingAt(payload.nextBillingAt)
    setStatus(`Subscription updated to ${interval}${status ? ` (${status})` : ""}`)
  }

  // Back action returns to previous page with dashboard fallback.
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading settings...</p>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to access settings.</p>
        </div>
      </main>
    )
  }

  // Renders exactly one active section so AnimatePresence can animate tab changes.
  const renderActiveSection = () => {
    if (activeSection === "profile") {
      return (
        <section className="mb-8 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
          <h2 className="font-semibold mb-4">Profile Settings</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Display Name</label>
              <input
                type="text"
                className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" className="w-full border border-border/40 bg-muted/20 rounded-md px-3 py-2 text-sm" value={user.email} disabled />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone (Optional)</label>
              <input
                type="text"
                className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <button type="submit" className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors">
              Save Profile
            </button>
          </form>
        </section>
      )
    }

    if (activeSection === "notifications") {
      return (
        <section className="mb-8 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
          <h2 className="font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            <label htmlFor="settings-email-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="settings-email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => setEmailNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              Email notifications
            </label>
            <label htmlFor="settings-sms-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="settings-sms-notifications"
                checked={smsNotifications}
                onCheckedChange={(checked) => setSmsNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              SMS notifications
            </label>
            <label htmlFor="settings-push-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="settings-push-notifications"
                checked={pushNotifications}
                onCheckedChange={(checked) => setPushNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              In-app notifications
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!user) return
              localStorage.setItem(
                `buildsync_profile_settings_${user.id}`,
                JSON.stringify({ displayName, phone, emailNotifications, smsNotifications, pushNotifications }),
              )
              setStatus("Notification settings saved")
            }}
            className="mt-4 px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors"
          >
            Save Notifications
          </button>
        </section>
      )
    }

    if (activeSection === "billing") {
      const estimatedPerUnitMonthly = subscriptionPlan === "essential" ? 2.5 : subscriptionPlan === "professional" ? 4.5 : 0
      const multiplier = subscriptionInterval === "yearly" ? 12 * 0.85 : 1
      const currentBill = estimatedPerUnitMonthly * subscriptionUnits * multiplier
      return (
        <section className="mb-8 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
          <h2 className="font-semibold mb-4">Subscription & Billing</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-border/30 rounded-md p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Plan</p>
              <p className="text-sm font-medium mt-1">{subscriptionPlan}</p>
            </div>
            <div className="border border-border/30 rounded-md p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="text-sm font-medium mt-1 capitalize">{subscriptionStatus}</p>
            </div>
            <div className="border border-border/30 rounded-md p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Units</p>
              <input
                type="number"
                min={10}
                max={1000}
                value={subscriptionUnits}
                onChange={(e) => setSubscriptionUnits(parseInt(e.target.value || "50", 10))}
                className="mt-1 w-24 border border-border/40 bg-background rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div className="border border-border/30 rounded-md p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Next Billing</p>
              <p className="text-sm font-medium mt-1">{nextBillingAt ? new Date(nextBillingAt).toLocaleDateString() : "Not set"}</p>
            </div>
          </div>

          <div className="mt-4 border border-border/30 rounded-md p-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Billing Cycle</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => saveSubscription("monthly")}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${subscriptionInterval === "monthly" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => saveSubscription("yearly")}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${subscriptionInterval === "yearly" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"}`}
              >
                Yearly (15% off)
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Estimated {subscriptionInterval === "yearly" ? "yearly" : "monthly"} bill: ${currentBill.toFixed(2)}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => saveSubscription(subscriptionInterval, "active")}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-green-500/40 text-green-600 rounded-md hover:bg-green-500/10 transition-colors"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => saveSubscription(subscriptionInterval, "paused")}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-yellow-500/40 text-yellow-600 rounded-md hover:bg-yellow-500/10 transition-colors"
            >
              Pause
            </button>
            <button
              type="button"
              onClick={() => saveSubscription(subscriptionInterval, "canceled")}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-red-500/40 text-red-600 rounded-md hover:bg-red-500/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </section>
      )
    }

    if (activeSection === "system" && canAccessSystemSettings) {
      return (
        <>
          <section className="mb-6 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
            <h2 className="font-semibold mb-2">Local LLM Endpoint</h2>
            <LlmSelector />
          </section>

          <section className="mb-8 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
            <h2 className="font-semibold mb-4">Communication Settings</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <fieldset className="border border-border/30 p-4 rounded-md">
                <legend className="font-mono text-xs uppercase tracking-widest text-muted-foreground px-1">SMTP Settings</legend>
                <div className="mb-3">
                  <label className="block text-sm mb-1">SMTP Host</label>
                  <input type="text" className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">SMTP Port</label>
                  <input type="text" className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1">SMTP Username</label>
                  <input type="text" className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">SMTP Password</label>
                  <input type="password" className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} />
                </div>
              </fieldset>

              <fieldset className="border border-border/30 p-4 rounded-md">
                <legend className="font-mono text-xs uppercase tracking-widest text-muted-foreground px-1">SendGrid</legend>
                <div>
                  <label className="block text-sm mb-1">SendGrid API Key</label>
                  <input type="password" className="w-full border border-border/40 bg-background rounded-md px-3 py-2 text-sm" value={sendgridApiKey} onChange={(e) => setSendgridApiKey(e.target.value)} />
                </div>
              </fieldset>

              <div className="flex gap-3">
                <button type="submit" className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors">Save</button>
                <button type="button" className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-border/40 text-muted-foreground rounded-md hover:text-accent hover:border-accent/40 transition-colors" onClick={handleTest}>Test</button>
              </div>
            </form>
          </section>
        </>
      )
    }

    return (
      <section className="border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
        <p className="text-sm text-muted-foreground">Your role has profile and notification settings only.</p>
      </section>
    )
  }

  return (
    <motion.main
      className="max-w-3xl mx-auto p-6 md:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="mb-6">
        {/* Back button keeps navigation consistent across settings entry points. */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-3 inline-flex items-center px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 text-muted-foreground rounded-md hover:text-accent hover:border-accent/40 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">{ROLE_TEMPLATES[user.role]?.label || user.role}</p>
        <button
          type="button"
          onClick={() => router.push("/settings/license")}
          className="mt-3 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 text-muted-foreground rounded-md hover:text-accent hover:border-accent/40 transition-colors"
        >
          License
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-border/30 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection("profile")}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${
            activeSection === "profile" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("notifications")}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${
            activeSection === "notifications" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Notifications
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("billing")}
          className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${
            activeSection === "billing" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"
          }`}
        >
          Billing
        </button>
        {canAccessSystemSettings && (
          <button
            type="button"
            onClick={() => setActiveSection("system")}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border rounded-md transition-colors ${
              activeSection === "system" ? "border-accent text-accent bg-accent/10" : "border-border/40 text-muted-foreground hover:text-accent"
            }`}
          >
            System
          </button>
        )}
      </div>

      {/* AnimatePresence ensures smooth enter/exit when switching settings tabs. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSection}
          initial={sectionTransition.initial}
          animate={sectionTransition.animate}
          exit={sectionTransition.exit}
          transition={sectionTransition.transition}
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>

      {status && <div className="text-green-600 font-mono text-xs mt-2">{status}</div>}
    </motion.main>
  )
}
