import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeEventLogsPage() {
  return (
    <OpsWorkspacePage
      title="Event Logs"
      subtitle="Capture notable front-of-house events with concise operational context."
      storageKey="buildsync_concierge_event_logs"
      fields={[
        { key: "event", label: "Event", placeholder: "Fire drill check-in", required: true },
        { key: "severity", label: "Severity", placeholder: "info / warning / critical", required: true },
        { key: "owner", label: "Logged By", placeholder: "Staff name", required: true },
      ]}
    />
  );
}