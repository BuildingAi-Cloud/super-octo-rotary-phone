"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const CONCIERGE_SETTINGS_ROLES = ["admin", "building_owner", "building_manager", "property_manager", "concierge"] as const

export default function ConciergeSettingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (!user) return
    const saved = JSON.parse(localStorage.getItem(`buildsync_profile_settings_${user.id}`) || "{}")
    setDisplayName(saved.displayName || user.name || "")
    setPhone(saved.phone || "")
    setEmailNotifications(saved.emailNotifications ?? true)
    setSmsNotifications(saved.smsNotifications ?? false)
    setPushNotifications(saved.pushNotifications ?? true)
  }, [user])

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

  const canManageConciergeIntegrations = CONCIERGE_SETTINGS_ROLES.includes(user.role as (typeof CONCIERGE_SETTINGS_ROLES)[number])

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
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
    setStatus("Concierge settings saved")
  }

  // Back action returns to previous page with dashboard fallback.
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push("/dashboard")
  }

  return (
    <motion.main
      className="max-w-3xl mx-auto p-6 md:p-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="mb-6">
        {/* Back button keeps concierge settings aligned with global settings UX. */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-3 inline-flex items-center px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest border border-border/40 text-muted-foreground rounded-md hover:text-accent hover:border-accent/40 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Concierge Settings</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1">Manage your profile, alerts, and communication integrations.</p>
      </div>

      <section className="mb-6 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
        <h2 className="font-semibold mb-4">Profile Settings</h2>
        <form onSubmit={saveProfile} className="space-y-4">
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
            />
          </div>

          <div className="space-y-2 pt-2">
            <label htmlFor="concierge-email-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="concierge-email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => setEmailNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              Email notifications
            </label>
            <label htmlFor="concierge-sms-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="concierge-sms-notifications"
                checked={smsNotifications}
                onCheckedChange={(checked) => setSmsNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              SMS notifications
            </label>
            <label htmlFor="concierge-push-notifications" className="flex items-center gap-3 text-sm font-mono">
              <Checkbox
                id="concierge-push-notifications"
                checked={pushNotifications}
                onCheckedChange={(checked) => setPushNotifications(Boolean(checked))}
                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=checked]:text-accent-foreground"
              />
              In-app notifications
            </label>
          </div>

          <button type="submit" className="px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors">
            Save Settings
          </button>
        </form>
      </section>

      <section className="mb-6 border border-border/40 rounded-lg p-4 md:p-6 bg-card/20">
        <h2 className="font-semibold mb-2">Communication Integrations</h2>
        {canManageConciergeIntegrations ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">Configure Slack, Discord, and SMTP integrations for concierge workflows.</p>
            <Link
              href="/concierge/settings/communication"
              className="inline-flex items-center px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors"
            >
              Open Communication Settings
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Your role has personal settings only. Communication integrations require concierge or manager access.</p>
        )}
      </section>

      {status && <div className="text-green-600 font-mono text-xs mt-2">{status}</div>}
    </motion.main>
  )
}
