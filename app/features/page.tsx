export default function FeaturesPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Feature Comparison</h1>
      <p className="text-muted-foreground mb-8">A detailed comparison of all features will be available soon.</p>
      <ul className="list-disc pl-6 text-left">
        <li>Property management tools</li>
        <li>Resident & tenant portals</li>
        <li>Maintenance tracking</li>
        <li>Compliance & security</li>
        <li>Integrations and more...</li>
      </ul>
    </main>
  );
}
