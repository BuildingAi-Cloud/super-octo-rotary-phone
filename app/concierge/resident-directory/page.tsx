import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeResidentDirectoryPage() {
  return (
    <OpsWorkspacePage
      title="Resident Directory"
      subtitle="Maintain a concierge-facing resident contact directory for quick lookup and support."
      storageKey="buildsync_concierge_resident_directory"
      fields={[
        { key: "resident", label: "Resident", placeholder: "Full name", required: true },
        { key: "unit", label: "Unit", placeholder: "7C", required: true },
        { key: "contact", label: "Contact", placeholder: "Phone or email", required: true },
      ]}
    />
  );
}