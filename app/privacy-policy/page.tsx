export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Privacy Policy</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Your privacy is our priority</h2>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>We never sell or share your personal data with third parties</li>
          <li>All data is encrypted in transit and at rest</li>
          <li>Strict access controls and audit logs for all user actions</li>
          <li>Compliance with GDPR, ISO 27001, and SOC 2</li>
          <li>Clear data retention and deletion policies</li>
          <li>Transparent cookie and tracking practices</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">For questions or requests, please <a href="/contact" className="text-accent underline hover:text-accent-foreground">contact our privacy team</a>.</p>
      </section>
    </main>
  );
}
