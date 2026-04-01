import { DocumentUpload } from "@/components/document-upload";

export default function ResidentDocumentsPage() {
  return (
    <main className="min-h-screen py-16 px-4 md:px-12 bg-background">
      <section className="max-w-2xl mx-auto">
        <DocumentUpload />
      </section>
    </main>
  );
}
