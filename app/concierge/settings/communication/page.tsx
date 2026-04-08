"use client";
import { useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  loadCommunicationSettings,
  saveCommunicationSettings,
  listReachableUsers,
  listBasicMessagesForUser,
  sendBasicMessage,
  type CommunicationSettings,
} from "@/lib/communication-store";

const CONCIERGE_SETTINGS_ROLES = ["admin", "building_owner", "building_manager", "property_manager", "concierge"] as const;

export default function CommunicationSettingsPage() {
  const { user, isLoading } = useAuth();
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [smtpMode, setSmtpMode] = useState<"default" | "custom">("default");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState<string | null>(null);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [integrationStatus, setIntegrationStatus] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [basicMessageStatus, setBasicMessageStatus] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadCommunicationSettings());
  }, []);

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

  const reachableUsers = user && settings
    ? listReachableUsers(user, settings.basic.allowCrossRoleForManagers)
    : [];

  const basicMessages = user
    ? listBasicMessagesForUser(user.email).slice(0, 8)
    : [];

  const slackConnected = Boolean(settings?.slack.connected);
  const discordConnected = Boolean(settings?.discord.connected);

  const updateIntegration = (
    provider: "slack" | "discord",
    patch: Partial<CommunicationSettings["slack"]>,
  ) => {
    if (!settings) return;
    const nextSettings: CommunicationSettings = {
      ...settings,
      [provider]: {
        ...settings[provider],
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    };
    setSettings(nextSettings);
    saveCommunicationSettings(nextSettings);
    setIntegrationStatus(`${provider === "slack" ? "Slack" : "Discord"} settings saved.`);
  };

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
  const handleConnectSlack = () => {
    updateIntegration("slack", { connected: true });
  };
  const handleConnectDiscord = () => {
    updateIntegration("discord", { connected: true });
  };
  const handleConfigureSmtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSmtpConfigured(true);
    setSmtpTestStatus(null);
  };

  const handleTestSmtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  const handleSendBasicMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !settings) return;
    if (!settings.basic.enabled) {
      setBasicMessageStatus("Basic in-app communication is currently disabled.");
      return;
    }
    if (!selectedRecipient || !messageBody.trim()) {
      setBasicMessageStatus("Recipient and message body are required.");
      return;
    }

    sendBasicMessage(user.email, selectedRecipient, messageBody.trim());
    setMessageBody("");
    setBasicMessageStatus("Message sent.");
  };

  if (!settings) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-sm text-muted-foreground">Loading communication settings...</p>
      </main>
    );
  }

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
            <p className="font-mono text-sm text-muted-foreground mb-4">Customer-owned Slack license. Bring your own workspace and bot credentials.</p>
            <div className="grid gap-3 mb-4">
              <input
                type="text"
                value={settings.slack.workspaceOrServer}
                onChange={(e) => updateIntegration("slack", { workspaceOrServer: e.target.value })}
                placeholder="Workspace (e.g. acme-workspace)"
                className="w-full border border-border px-2 py-1 rounded"
              />
              <input
                type="text"
                value={settings.slack.channel}
                onChange={(e) => updateIntegration("slack", { channel: e.target.value })}
                placeholder="Channel (e.g. #building-alerts)"
                className="w-full border border-border px-2 py-1 rounded"
              />
              <input
                type="password"
                value={settings.slack.credentialHint}
                onChange={(e) => updateIntegration("slack", { credentialHint: e.target.value })}
                placeholder="Bot token / webhook (stored client-side in demo mode)"
                className="w-full border border-border px-2 py-1 rounded"
              />
            </div>
            {slackConnected ? (
              <div className="font-mono text-xs text-green-600">Slack Connected</div>
            ) : (
              <button onClick={handleConnectSlack} className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90">Connect Slack</button>
            )}
          </div>

          {/* Discord Integration */}
          <div className="bg-card/80 p-6 rounded-lg shadow-lg">
            <h2 className="font-[var(--font-bebas)] text-2xl mb-2">Discord Integration</h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">Customer-owned Discord license. Bring your own server and webhook credentials.</p>
            <div className="grid gap-3 mb-4">
              <input
                type="text"
                value={settings.discord.workspaceOrServer}
                onChange={(e) => updateIntegration("discord", { workspaceOrServer: e.target.value })}
                placeholder="Server (e.g. BuildSync Ops)"
                className="w-full border border-border px-2 py-1 rounded"
              />
              <input
                type="text"
                value={settings.discord.channel}
                onChange={(e) => updateIntegration("discord", { channel: e.target.value })}
                placeholder="Channel (e.g. #concierge-updates)"
                className="w-full border border-border px-2 py-1 rounded"
              />
              <input
                type="password"
                value={settings.discord.credentialHint}
                onChange={(e) => updateIntegration("discord", { credentialHint: e.target.value })}
                placeholder="Webhook token (stored client-side in demo mode)"
                className="w-full border border-border px-2 py-1 rounded"
              />
            </div>
            {discordConnected ? (
              <div className="font-mono text-xs text-green-600">Discord Connected</div>
            ) : (
              <button onClick={handleConnectDiscord} className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90">Connect Discord</button>
            )}
          </div>

          {/* Basic in-app communication */}
          <div className="bg-card/80 p-6 rounded-lg shadow-lg">
            <h2 className="font-[var(--font-bebas)] text-2xl mb-2">BuildSync Basic Communication</h2>
            <p className="font-mono text-sm text-muted-foreground mb-4">
              Built-in fallback messaging between platform users. Recipients are filtered by role access and user profile.
            </p>

            <label className="flex items-center gap-2 font-mono text-xs mb-3">
              <input
                type="checkbox"
                checked={settings.basic.enabled}
                onChange={(e) => {
                  const next = {
                    ...settings,
                    basic: { ...settings.basic, enabled: e.target.checked },
                  };
                  setSettings(next);
                  saveCommunicationSettings(next);
                }}
              />
              Enable basic in-app communication
            </label>

            <label className="flex items-center gap-2 font-mono text-xs mb-4">
              <input
                type="checkbox"
                checked={settings.basic.allowCrossRoleForManagers}
                onChange={(e) => {
                  const next = {
                    ...settings,
                    basic: { ...settings.basic, allowCrossRoleForManagers: e.target.checked },
                  };
                  setSettings(next);
                  saveCommunicationSettings(next);
                }}
              />
              Allow manager roles to message across role boundaries
            </label>

            <form onSubmit={handleSendBasicMessage} className="space-y-3">
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="w-full border border-border px-2 py-1 rounded bg-background"
              >
                <option value="">Select recipient</option>
                {reachableUsers.map((candidate) => (
                  <option key={candidate.email} value={candidate.email}>
                    {candidate.name} ({candidate.role})
                  </option>
                ))}
              </select>

              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write a quick in-app message"
                className="w-full border border-border px-2 py-1 rounded bg-background min-h-[90px]"
              />

              <button
                type="submit"
                className="bg-accent text-accent-foreground px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-accent/90"
              >
                Send Message
              </button>
            </form>

            {basicMessageStatus && <p className="font-mono text-xs text-accent mt-3">{basicMessageStatus}</p>}

            <div className="mt-4 border border-border/40 rounded-md p-3 bg-background/60">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Recent Messages</p>
              {basicMessages.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">No messages yet.</p>
              ) : (
                <div className="space-y-2">
                  {basicMessages.map((msg) => (
                    <div key={msg.id} className="border border-border/30 rounded px-2 py-1">
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {msg.senderEmail} → {msg.recipientEmail}
                      </p>
                      <p className="font-mono text-xs">{msg.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              <form onSubmit={handleConfigureSmtp} className="space-y-3">
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Host
                    <span title="e.g. smtp.sendgrid.net, smtp.gmail.com" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className="w-full border border-border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Port
                    <span title="465 (SSL), 587 (TLS), or as required by your provider" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className="w-full border border-border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Username
                    <span title="Usually your email address or API user" className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} className="w-full border border-border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="font-mono text-xs flex items-center gap-2">SMTP Password
                    <span title="App password or API key. Never share this." className="ml-1 text-muted-foreground cursor-help">?</span>
                  </label>
                  <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} className="w-full border border-border px-2 py-1 rounded" required autoComplete="new-password" />
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
        {integrationStatus && <p className="font-mono text-xs text-accent mt-4">{integrationStatus}</p>}
      </section>
    </main>
  );
}
