import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeParkingPage() {
  return (
    <OpsWorkspacePage
      title="Parking Management"
      subtitle="Register temporary permits, valet notes, and parking exceptions."
      storageKey="buildsync_concierge_parking"
      fields={[
        { key: "plate", label: "Plate", placeholder: "ABC-1234", required: true },
        { key: "unit", label: "Unit", placeholder: "15A", required: true },
        { key: "note", label: "Note", placeholder: "Guest overnight permit", required: true },
      ]}
    />
  );
}