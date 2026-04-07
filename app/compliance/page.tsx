export default function CompliancePage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-12">
      <h1 className="text-4xl font-bold mb-6">Compliance</h1>
      <p className="mb-4">We are building toward ISO 27001, SOC 2 Type II, and GDPR readiness. This page tracks our execution artifacts and will be updated as the program matures.</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>ISO 27001 Program (in progress)</li>
        <li>SOC 2 Type II Program (in progress)</li>
        <li>GDPR Readiness (in progress)</li>
      </ul>

      <section className="mt-10 max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Program Execution Assets</h2>
        <p className="text-muted-foreground mb-4">
          These artifacts are used to drive beta compliance execution and audit preparation.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a href="/docs/compliance-control-matrix-template" className="underline">Control Matrix Template</a>
          </li>
          <li>
            <a href="/docs/evidence-checklist-by-control-owner" className="underline">Evidence Checklist by Control Owner</a>
          </li>
          <li>
            <a href="/docs/compliance-90-day-readiness-plan" className="underline">90-Day ISO, SOC 2, and GDPR Readiness Plan</a>
          </li>
        </ul>
      </section>
    </main>
  );
}