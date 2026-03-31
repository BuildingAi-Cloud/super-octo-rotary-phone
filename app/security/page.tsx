import Link from "next/link";
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="font-mono text-xs text-accent hover:underline">10 Back</Link>
          <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">Security</h1>
        </div>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">How BuildSync keeps your data and operations safe</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">ISO 27001</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">SOC 2</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">GDPR</span>
        </div>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Built with Next.js, React, TypeScript, and secure cloud infrastructure</li>
          <li>End-to-end encryption for all sensitive data</li>
          <li>Role-based access control and multi-factor authentication (MFA)</li>
          <li>Regular security audits and vulnerability scanning</li>
          <li>Compliance with ISO 27001, SOC 2, and GDPR standards</li>
          <li>Continuous monitoring and incident response</li>
          <li>Data residency and backup options</li>
        </ul>
        <section className="mb-8">
          <h3 className="font-mono text-xl mb-2">Frequently Asked Questions</h3>
          <ul className="font-mono text-sm text-muted-foreground space-y-2">
            <li><b>How do you handle security incidents?</b> We have a 24/7 incident response team and notify users of any breaches.</li>
            <li><b>How often do you run security audits?</b> We conduct regular internal and third-party audits and penetration tests.</li>
            <li><b>Can I request a security report?</b> Yes, contact our security team for compliance documentation and reports.</li>
          </ul>
        </section>
        <div className="font-mono text-xs text-muted-foreground mb-4">Last updated: March 2026</div>
        <p className="font-mono text-sm text-muted-foreground">For more details, see our <a href="/privacy-policy" className="text-accent underline hover:text-accent-foreground">Privacy Policy</a> or <a href="/contact" className="text-accent underline hover:text-accent-foreground">contact our security team</a>.</p>
      </section>
    </main>
  );
}
