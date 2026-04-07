import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeCalendarPage() {
  return (
    <OpsWorkspacePage
      title="Calendar"
      subtitle="Manage concierge scheduling windows for events, deliveries, and resident appointments."
      storageKey="buildsync_concierge_calendar"
      fields={[
        { key: "event", label: "Event", placeholder: "Move-in, inspection, booking", required: true },
        { key: "date", label: "Date", placeholder: "YYYY-MM-DD", required: true },
        { key: "owner", label: "Owner", placeholder: "Resident or staff", required: true },
      ]}
      initialRecords={[
        { event: "Loading dock slot", date: "2026-04-03", owner: "Unit 2205" },
      ]}
    />
  );
}