import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergeInstructionsPage() {
  return (
    <OpsWorkspacePage
      title="Instructions"
      subtitle="Maintain operating instructions for staff handover and resident support tasks."
      storageKey="buildsync_concierge_instructions"
      fields={[
        { key: "topic", label: "Topic", placeholder: "Move-in checklist", required: true },
        { key: "audience", label: "Audience", placeholder: "Staff / Resident", required: true },
        { key: "owner", label: "Owner", placeholder: "Role or team", required: true },
      ]}
    />
  );
}