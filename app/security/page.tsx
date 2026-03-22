export default function SecurityPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Security</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">How BuildSync keeps your data and operations safe</h2>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Built with Next.js, React, TypeScript, and secure cloud infrastructure</li>
          <li>End-to-end encryption for all sensitive data</li>
          <li>Role-based access control and multi-factor authentication (MFA)</li>
          <li>Regular security audits and vulnerability scanning</li>
          <li>Compliance with ISO 27001, SOC 2, and GDPR standards</li>
          <li>Continuous monitoring and incident response</li>
          <li>Data residency and backup options</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">For more details, see our <a href="/privacy-policy" className="text-accent underline hover:text-accent-foreground">Privacy Policy</a> or <a href="/contact" className="text-accent underline hover:text-accent-foreground">contact our security team</a>.</p>
      </section>
    </main>
  );
}
