import Link from "next/link";
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="font-mono text-xs text-accent hover:underline">10 Back</Link>
          <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">Privacy Policy</h1>
        </div>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Your privacy is our priority</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">GDPR</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">ISO 27001</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">SOC 2</span>
        </div>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>We never sell or share your personal data with third parties</li>
          <li>All data is encrypted in transit and at rest</li>
          <li>Strict access controls and audit logs for all user actions</li>
          <li>Compliance with GDPR, ISO 27001, and SOC 2</li>
          <li>Clear data retention and deletion policies</li>
          <li>Transparent cookie and tracking practices</li>
        </ul>
        <section className="mb-8">
          <h3 className="font-mono text-xl mb-2">Frequently Asked Questions</h3>
          <ul className="font-mono text-sm text-muted-foreground space-y-2">
            <li><b>How can I request my data?</b> You can request, export, or delete your data at any time by contacting our privacy team.</li>
            <li><b>Where is my data stored?</b> All data is stored securely in ISO 27001-certified data centers in your region.</li>
            <li><b>How do you use cookies?</b> We use cookies only for essential functionality and analytics. No tracking cookies are used for advertising.</li>
          </ul>
        </section>
        <div className="font-mono text-xs text-muted-foreground mb-4">Last updated: March 2026</div>
        <p className="font-mono text-sm text-muted-foreground">For questions or requests, please <a href="/contact" className="text-accent underline hover:text-accent-foreground">contact our privacy team</a>.</p>
      </section>
    </main>
  );
}
