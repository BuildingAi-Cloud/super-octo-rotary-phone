import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeCustomFieldsPage() {
  return (
    <OpsWorkspacePage
      title="Custom Fields"
      subtitle="Define custom concierge data points used in front-desk and resident workflows."
      storageKey="buildsync_concierge_custom_fields"
      fields={[
        { key: "field", label: "Field Name", placeholder: "Preferred contact window", required: true },
        { key: "type", label: "Type", placeholder: "text / number / select", required: true },
        { key: "scope", label: "Scope", placeholder: "resident / visitor / package", required: true },
      ]}
    />
  );
}