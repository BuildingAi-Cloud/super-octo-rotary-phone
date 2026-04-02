import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeLibraryPage() {
  return (
    <OpsWorkspacePage
      title="Library"
      subtitle="Track policy documents, forms, and resident-facing resources maintained by concierge."
      storageKey="buildsync_concierge_library"
      fields={[
        { key: "document", label: "Document", placeholder: "Pet policy v2", required: true },
        { key: "category", label: "Category", placeholder: "Policy / Form / Guide", required: true },
        { key: "owner", label: "Owner", placeholder: "Department", required: true },
      ]}
    />
  );
}