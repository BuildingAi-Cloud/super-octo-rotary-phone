import Link from "next/link";

export default function ApiReferencePage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/documentation" className="font-mono text-xs text-accent hover:underline">10 Back to Docs</Link>
          <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight">API Reference</h1>
        </div>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">BuildSync REST API documentation</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">OpenAPI 3.1</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">Swagger</span>
          <span className="inline-block bg-card border border-border px-3 py-1 rounded font-mono text-xs text-muted-foreground">Versioned</span>
        </div>
        <p className="font-mono text-sm text-foreground/90 mb-8">Our API is designed for easy integration and automation. All endpoints are versioned and follow RESTful conventions.</p>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Base URL: <span className="text-accent">https://api.buildsync.com/v1/</span></li>
          <li>Authentication: Bearer token (see <a href="/documentation" className="text-accent underline hover:text-accent-foreground">docs</a>)</li>
          <li>OpenAPI/Swagger spec available</li>
          <li>Rate limits: 1000 requests/minute</li>
          <li>Comprehensive error codes and messages</li>
        </ul>
        <section className="mb-8">
          <h3 className="font-mono text-xl mb-2">Quick Links</h3>
          <ul className="font-mono text-sm text-muted-foreground space-y-2">
            <li><a href="#auth" className="text-accent underline hover:text-accent-foreground">Authentication</a></li>
            <li><a href="#users" className="text-accent underline hover:text-accent-foreground">Users</a></li>
            <li><a href="#properties" className="text-accent underline hover:text-accent-foreground">Properties</a></li>
            <li><a href="#payments" className="text-accent underline hover:text-accent-foreground">Payments</a></li>
          </ul>
        </section>
        <div className="font-mono text-xs text-muted-foreground mb-4">Last updated: March 2026</div>
        <p className="font-mono text-sm text-muted-foreground">For full API details, see our <a href="/docs/api-spec.yaml" className="text-accent underline hover:text-accent-foreground">OpenAPI spec</a> or <a href="/contact" className="text-accent underline hover:text-accent-foreground">contact our developer support</a>.</p>
      </section>
    </main>
  );
}
