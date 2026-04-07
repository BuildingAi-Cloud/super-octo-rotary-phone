import { VasPaymentSection } from "@/components/vas-payment-section";

export default function VasPaymentPage() {
  // Set enabled={false} to simulate VAS disabled for this unit
  return (
    <main className="min-h-screen py-16 px-4 md:px-12 bg-background">
      <section className="max-w-2xl mx-auto">
        <VasPaymentSection enabled={true} />
      </section>
    </main>
  );
}
