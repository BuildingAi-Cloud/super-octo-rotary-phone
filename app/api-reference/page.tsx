export default function ApiReferencePage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">API Reference</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Integrate with BuildSync using our secure, well-documented API</h2>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>RESTful endpoints for all major resources</li>
          <li>Authentication via API keys and OAuth</li>
          <li>Comprehensive error codes and responses</li>
          <li>Rate limiting and usage guidelines</li>
          <li>Interactive API explorer (coming soon)</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">See the <a href="/docs/api-reference" className="text-accent underline hover:text-accent-foreground">full API documentation</a> for detailed endpoints and examples.</p>
      </section>
    </main>
  );
}
