import { VasPaymentSection } from "@/components/vas-payment-section";

export default function VasPaymentPage() {
  // Set enabled={false} to simulate VAS disabled for this unit
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-2xl mx-auto">
        <VasPaymentSection enabled={true} />
      </section>
    </main>
  );
}
