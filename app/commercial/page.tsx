export default function CommercialPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-4xl mx-auto">
        <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-4">Commercial Facilities</h1>
        <h2 className="font-mono text-base md:text-lg text-muted-foreground mb-8">Modernize your commercial property operations</h2>
        <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          BuildSync empowers commercial property managers and owners to streamline operations, enhance tenant satisfaction, and maximize asset value. Our platform is designed for office buildings, retail centers, mixed-use developments, and more.
        </p>
        <ul className="list-disc pl-6 font-mono text-sm text-foreground/90 space-y-2 mb-8">
          <li>Centralized maintenance and work order management</li>
          <li>Tenant and lease management tools</li>
          <li>Automated amenity booking and visitor management</li>
          <li>Energy and sustainability tracking</li>
          <li>Real-time alerts for building systems</li>
          <li>Comprehensive audit logs and compliance reporting</li>
        </ul>
        <p className="font-mono text-sm text-muted-foreground">Contact us to learn how BuildSync can transform your commercial property operations.</p>
      </section>
    </main>
  );
}
