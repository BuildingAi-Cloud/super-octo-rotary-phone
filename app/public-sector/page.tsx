export default function PublicSectorPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Public Sector Facilities</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Smart solutions for government and civic buildings</h2>
        <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          BuildSync is trusted by public sector organizations to manage civic infrastructure, ensure compliance, and deliver reliable services to communities. Our platform is built for transparency, accountability, and efficiency.
        </p>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Work order and asset management for public buildings</li>
          <li>Compliance and safety tracking</li>
          <li>Community bulletin and announcement tools</li>
          <li>Multi-site and multi-agency support</li>
          <li>Accessibility and language options</li>
          <li>Secure authentication and audit trails</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">Contact us to discover how BuildSync can support your public sector mission.</p>
      </section>
    </main>
  );
}
