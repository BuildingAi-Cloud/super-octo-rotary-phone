"use client";
import { useState } from "react";

export default function CommunicationSettingsPage() {
  const [slackConnected, setSlackConnected] = useState(false);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [smtpMode, setSmtpMode] = useState<"default" | "custom">("default");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState<string | null>(null);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

  // Placeholder handlers for integration actions
  const handleConnectSlack = () => setSlackConnected(true);
  const handleConnectDiscord = () => setDiscordConnected(true);
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

  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-2xl mx-auto">
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
      </section>
    </main>
  );
}
