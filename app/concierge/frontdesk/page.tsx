import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeFrontDeskPage() {
  return (
    <OpsWorkspacePage
      title="Front Desk"
      subtitle="Track desk handoffs, key pickups, and high-priority resident requests in one queue."
      storageKey="buildsync_concierge_frontdesk"
      fields={[
        { key: "resident", label: "Resident", placeholder: "Name", required: true },
        { key: "request", label: "Request", placeholder: "Package, key, access help", required: true },
        { key: "priority", label: "Priority", placeholder: "low / medium / high", required: true },
      ]}
      initialRecords={[
        { resident: "A. Torres", request: "Temporary elevator booking", priority: "high" },
        { resident: "L. Wang", request: "Package hold extension", priority: "medium" },
      ]}
    />
  );
}