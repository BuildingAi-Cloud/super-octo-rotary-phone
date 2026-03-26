export default function PolicyPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Policies & Terms</h1>
      <p className="text-muted-foreground mb-8 max-w-xl text-center">
        Please review our Privacy Policy, Terms of Service, and other important documents. We are committed to transparency and customer trust.
      </p>
      <ul className="list-disc pl-6 text-left">
        <li><a href="/privacy-policy" className="underline">Privacy Policy</a></li>
        <li><a href="/support" className="underline">Support</a></li>
      </ul>
    </main>
  );
}
