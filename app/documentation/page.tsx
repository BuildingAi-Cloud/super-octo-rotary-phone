export default function DocumentationPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Documentation</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Guides, tutorials, and best practices for using BuildSync</h2>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li><a href="/docs/getting-started" className="text-accent underline hover:text-accent-foreground">Getting Started</a></li>
          <li><a href="/docs/features" className="text-accent underline hover:text-accent-foreground">Features Overview</a></li>
          <li><a href="/docs/security" className="text-accent underline hover:text-accent-foreground">Security & Compliance</a></li>
          <li><a href="/docs/support" className="text-accent underline hover:text-accent-foreground">Support & Troubleshooting</a></li>
          <li><a href="/docs/api-reference" className="text-accent underline hover:text-accent-foreground">API Reference</a></li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">Looking for something else? <a href="/contact" className="text-accent underline hover:text-accent-foreground">Contact our team</a> for help.</p>
      </section>
    </main>
  );
}
