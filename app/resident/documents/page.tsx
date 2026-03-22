import { DocumentUpload } from "@/components/document-upload";

export default function ResidentDocumentsPage() {
  return (
    <main className="min-h-screen py-24 px-6 md:px-28 bg-background">
      <section className="max-w-2xl mx-auto">
        <DocumentUpload />
      </section>
    </main>
  );
}
