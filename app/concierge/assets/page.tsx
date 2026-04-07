import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeAssetsPage() {
  return (
    <OpsWorkspacePage
      title="Asset Manager"
      subtitle="Log concierge-managed assets such as carts, key sets, and front-desk devices."
      storageKey="buildsync_concierge_assets"
      fields={[
        { key: "asset", label: "Asset", placeholder: "Mail cart A", required: true },
        { key: "status", label: "Status", placeholder: "available / maintenance", required: true },
        { key: "location", label: "Location", placeholder: "Front desk", required: true },
      ]}
    />
  );
}