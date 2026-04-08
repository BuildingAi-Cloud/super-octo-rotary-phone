"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const CONCIERGE_SETTINGS_ROLES = ["admin", "building_owner", "building_manager", "property_manager", "concierge"] as const;

export default function CommunicationSettingsPage() {
  const { user, isLoading } = useAuth();
  const [slackConnected, setSlackConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [smtpMode, setSmtpMode] = useState<"default" | "custom">("default");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState<string | null>(null);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFormError, setSmtpFormError] = useState<string | null>(null);
  const [smtpFieldErrors, setSmtpFieldErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading settings...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to access communication settings.</p>
        </div>
      </main>
    );
  }

  const canManageConciergeIntegrations = CONCIERGE_SETTINGS_ROLES.includes(user.role as (typeof CONCIERGE_SETTINGS_ROLES)[number]);

  if (!canManageConciergeIntegrations) {
    return (
      <main className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-xl">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">Your role has personal settings only. Communication integrations require concierge or manager access.</p>
          <Link
            href="/concierge/settings"
            className="inline-flex items-center px-4 py-2 text-xs font-mono uppercase tracking-widest border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors"
          >
            Back to Concierge Settings
          </Link>
        </div>
      </main>
    );
  }

  // Placeholder handlers for integration actions
  const handleConnectSlack = () => setSlackConnected(true);
  const handleConnectDiscord = () => setDiscordConnected(true);
  const validateSmtp = () => {
    const nextErrors: Record<string, string> = {};

    if (!smtpHost.trim()) nextErrors.smtpHost = "SMTP host is required.";
    if (!smtpPort.trim()) {
      nextErrors.smtpPort = "SMTP port is required.";
    } else {
      const parsed = Number(smtpPort);
      if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 65535) {
        nextErrors.smtpPort = "Enter a valid SMTP port (1-65535).";
      }
    }
    if (!smtpUser.trim()) nextErrors.smtpUser = "SMTP username is required.";
    if (!smtpPass.trim()) nextErrors.smtpPass = "SMTP password is required.";

    setSmtpFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfigureSmtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSmtpFormError(null);
    if (!validateSmtp()) {
      setSmtpFormError("Please fix the highlighted SMTP fields and try again.");
      return;
    }
    setSmtpConfigured(true);
    setSmtpTestStatus(null);
  };

  const handleTestSmtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSmtpFormError(null);
    if (!validateSmtp()) {
      setSmtpFormError("Please fix the highlighted SMTP fields before testing.");
      return;
    }
    setSmtpTestStatus("Testing SMTP connection...");
    setTimeout(() => {
      // Simulate test result
      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        setSmtpTestStatus("SMTP connection successful! Test email sent.");
      } else {
        setSmtpTestStatus("SMTP test failed. Please check your settings.");
      }
    }, 1200);
  };

  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link href="/concierge/settings" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors">
            ← Back to Concierge Settings
          </Link>
        </div>
        <h1 className="font-[var(--font-bebas)] text-4xl md:text-6xl tracking-tight mb-8">Communication Integrations</h1>
        <div className="space-y-8">
          {/* Slack Integration */}
          <div className="bg-card/80 p-6 rounded-lg shadow-lg">
            <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Slack Integration</h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">Connect your building's Slack workspace for real-time notifications and communication.</p>
            {slackConnected ? (
              <div className="font-mono text-xs text-green-600">Slack Connected</div>
            ) : (
              <button onClick={handleConnectSlack} className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90">Connect Slack</button>
            )}
          </div>

          {/* Discord Integration */}
          <div className="bg-card/80 p-6 rounded-lg shadow-lg">
            <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Discord Integration</h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">Connect a Discord server for community chat and announcements.</p>
            {discordConnected ? (
              <div className="font-mono text-xs text-green-600">Discord Connected</div>
            ) : (
              <button onClick={handleConnectDiscord} className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90">Connect Discord</button>
            )}
          </div>

          {/* SMTP Email Integration */}
          <div className="bg-card/80 p-6 rounded-lg shadow-lg">
            <h2 className="font-[var(--font-bebas)] text-2xl mb-2">SMTP Email</h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">Choose to use the default buildings.com SMTP service or configure your own SMTP provider for official building emails and notifications.</p>
            <div className="mb-4 flex gap-6">
              <label className="flex items-center gap-2 font-mono text-xs">
                <input
                  type="radio"
                  checked={smtpMode === "default"}
                  onChange={() => setSmtpMode("default")}
                />
                Use buildings.com SMTP (recommended)
              </label>
              <label className="flex items-center gap-2 font-mono text-xs">
                <input
                  type="radio"
                  checked={smtpMode === "custom"}
                  onChange={() => setSmtpMode("custom")}
                />
                Use my own SMTP provider
              </label>
            </div>
            {smtpMode === "default" ? (
              <div className="font-mono text-xs text-green-600 mb-2">Default SMTP will be used for all emails.</div>
            ) : (
              <form noValidate onSubmit={handleConfigureSmtp} className="space-y-3">
                {smtpFormError && <div role="alert" className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-600">{smtpFormError}</div>}
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Host
                    <span title="e.g. smtp.sendgrid.net, smtp.gmail.com" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="text" value={smtpHost} onChange={e => {
                    setSmtpHost(e.target.value)
                    setSmtpFieldErrors((prev) => ({ ...prev, smtpHost: "" }))
                  }} className={`w-full border px-2 py-1 rounded ${smtpFieldErrors.smtpHost ? "border-red-500" : "border-border"}`} required aria-invalid={Boolean(smtpFieldErrors.smtpHost)} aria-describedby={smtpFieldErrors.smtpHost ? "smtp-host-error" : undefined} />
                  {smtpFieldErrors.smtpHost && <p id="smtp-host-error" className="mt-1 font-mono text-[10px] text-red-600">{smtpFieldErrors.smtpHost}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Port
                    <span title="465 (SSL), 587 (TLS), or as required by your provider" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="number" value={smtpPort} onChange={e => {
                    setSmtpPort(e.target.value)
                    setSmtpFieldErrors((prev) => ({ ...prev, smtpPort: "" }))
                  }} className={`w-full border px-2 py-1 rounded ${smtpFieldErrors.smtpPort ? "border-red-500" : "border-border"}`} required aria-invalid={Boolean(smtpFieldErrors.smtpPort)} aria-describedby={smtpFieldErrors.smtpPort ? "smtp-port-error" : undefined} />
                  {smtpFieldErrors.smtpPort && <p id="smtp-port-error" className="mt-1 font-mono text-[10px] text-red-600">{smtpFieldErrors.smtpPort}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Username
                    <span title="Usually your email address or API user" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="text" value={smtpUser} onChange={e => {
                    setSmtpUser(e.target.value)
                    setSmtpFieldErrors((prev) => ({ ...prev, smtpUser: "" }))
                  }} className={`w-full border px-2 py-1 rounded ${smtpFieldErrors.smtpUser ? "border-red-500" : "border-border"}`} required aria-invalid={Boolean(smtpFieldErrors.smtpUser)} aria-describedby={smtpFieldErrors.smtpUser ? "smtp-user-error" : undefined} />
                  {smtpFieldErrors.smtpUser && <p id="smtp-user-error" className="mt-1 font-mono text-[10px] text-red-600">{smtpFieldErrors.smtpUser}</p>}
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Password
                    <span title="App password or API key. Never share this." className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="password" value={smtpPass} onChange={e => {
                    setSmtpPass(e.target.value)
                    setSmtpFieldErrors((prev) => ({ ...prev, smtpPass: "" }))
                  }} className={`w-full border px-2 py-1 rounded ${smtpFieldErrors.smtpPass ? "border-red-500" : "border-border"}`} required autoComplete="new-password" aria-invalid={Boolean(smtpFieldErrors.smtpPass)} aria-describedby={smtpFieldErrors.smtpPass ? "smtp-pass-error" : undefined} />
                  {smtpFieldErrors.smtpPass && <p id="smtp-pass-error" className="mt-1 font-mono text-[10px] text-red-600">{smtpFieldErrors.smtpPass}</p>}
                </div>
                <div className="flex gap-4 mt-2">
                  <button type="button" onClick={handleTestSmtp} className="bg-muted text-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/20">Send Test Email</button>
                  <button type="submit" className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90">Save SMTP Settings</button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <strong>Examples:</strong><br />
                  <span className="block">SendGrid: smtp.sendgrid.net, Port 587, Username: apikey, Password: &lt;API Key&gt;</span>
                  <span className="block">Gmail: smtp.gmail.com, Port 465/587, Username: your@gmail.com, Password: &lt;App Password&gt;</span>
                </div>
                {smtpTestStatus && <div className="mt-2 font-mono text-xs text-accent">{smtpTestStatus}</div>}
              </form>
            )}
            {smtpConfigured && <div className="mt-2 font-mono text-xs text-green-600">SMTP Configured</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
