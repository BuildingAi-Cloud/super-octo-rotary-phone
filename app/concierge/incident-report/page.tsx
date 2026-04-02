import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeIncidentReportPage() {
  return (
    <OpsWorkspacePage
      title="Incident Report"
      subtitle="Log concierge incidents for escalation, audit, and service recovery actions."
      storageKey="buildsync_concierge_incidents"
      fields={[
        { key: "incident", label: "Incident", placeholder: "Visitor dispute in lobby", required: true },
        { key: "unit", label: "Unit / Area", placeholder: "Lobby or Unit 9C", required: true },
        { key: "status", label: "Status", placeholder: "open / resolved", required: true },
      ]}
    />
  );
}