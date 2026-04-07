export default function InstitutionalPage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-12 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Institutional Facilities</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Facility management for education, healthcare, and more</h2>
        <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          BuildSync supports the unique needs of institutional facilities such as schools, universities, hospitals, and government buildings. Our platform ensures safety, compliance, and operational efficiency at scale.
        </p>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Preventative maintenance scheduling and asset tracking</li>
          <li>Incident and compliance reporting</li>
          <li>Room and resource booking</li>
          <li>Visitor and contractor management</li>
          <li>Accessibility and safety features</li>
          <li>Role-based dashboards for staff and administrators</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">Contact us to see how BuildSync can help your institution operate smarter and safer.</p>
      </section>
    </main>
  );
}
