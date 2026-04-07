import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeUnitsPage() {
  return (
    <OpsWorkspacePage
      title="Units & Occupants"
      subtitle="Track occupancy updates, access notes, and concierge-visible unit context."
      storageKey="buildsync_concierge_units"
      fields={[
        { key: "unit", label: "Unit", placeholder: "14B", required: true },
        { key: "occupant", label: "Occupant", placeholder: "Resident name", required: true },
        { key: "note", label: "Concierge Note", placeholder: "Temporary access or handoff info", required: true },
      ]}
    />
  );
}