"use client"

import { useAuth } from "@/lib/auth-context"
import { LlmSelector } from "@/components/llm-selector"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const { user } = useAuth()


  // Only allow property_manager, admin, or staff roles to see settings
  if (!user || !["property_manager", "admin", "staff"].includes(user.role)) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground">You do not have permission to view these settings.</p>
        </div>
      </main>
    )
  }

  // SMTP/SendGrid settings state
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [sendgridApiKey, setSendgridApiKey] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Load settings from localStorage (for demo)
    const saved = JSON.parse(localStorage.getItem("buildsync_settings") || "{}")
    setSmtpHost(saved.smtpHost || "");
    setSmtpPort(saved.smtpPort || "");
    setSmtpUser(saved.smtpUser || "");
    setSmtpPass(saved.smtpPass || "");
    setSendgridApiKey(saved.sendgridApiKey || "");
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("buildsync_settings", JSON.stringify({ smtpHost, smtpPort, smtpUser, smtpPass, sendgridApiKey }));
    setStatus("Settings saved!");
  };

  const handleTest = async () => {
    setStatus("Testing... (demo only, no real email sent)");
    setTimeout(() => setStatus("Test complete (demo only)"), 1200);
  };

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Local LLM Endpoint</h2>
        <LlmSelector />
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Communication Settings</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <fieldset className="border p-4 rounded">
            <legend className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SMTP Settings</legend>
            <div className="mb-2">
              <label className="block text-sm mb-1">SMTP Host</label>
              <input type="text" className="input input-bordered w-full" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">SMTP Port</label>
              <input type="text" className="input input-bordered w-full" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">SMTP Username</label>
              <input type="text" className="input input-bordered w-full" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="block text-sm mb-1">SMTP Password</label>
              <input type="password" className="input input-bordered w-full" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} />
            </div>
          </fieldset>
          <fieldset className="border p-4 rounded">
            <legend className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SendGrid</legend>
            <div className="mb-2">
              <label className="block text-sm mb-1">SendGrid API Key</label>
              <input type="password" className="input input-bordered w-full" value={sendgridApiKey} onChange={e => setSendgridApiKey(e.target.value)} />
            </div>
          </fieldset>
          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={handleTest}>Test</button>
          </div>
          {status && <div className="text-green-600 font-mono text-xs mt-2">{status}</div>}
        </form>
      </section>
    </main>
  )
}
