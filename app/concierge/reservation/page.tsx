import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeReservationPage() {
  return (
    <OpsWorkspacePage
      title="Reservation"
      subtitle="Manage amenity reservations and space booking requests from residents and staff."
      storageKey="buildsync_concierge_reservation"
      fields={[
        { key: "requestor", label: "Requestor", placeholder: "Resident or staff", required: true },
        { key: "space", label: "Space", placeholder: "Party room / Guest suite", required: true },
        { key: "timeslot", label: "Timeslot", placeholder: "2026-04-04 18:00-21:00", required: true },
      ]}
      initialRecords={[
        { requestor: "Unit 14B", space: "Party Room", timeslot: "2026-04-05 19:00-22:00" },
      ]}
    />
  );
}