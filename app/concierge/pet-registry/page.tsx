import { OpsWorkspacePage } from "@/components/concierge/ops-workspace-page";

export default function ConciergePetRegistryPage() {
  return (
    <OpsWorkspacePage
      title="Pet Registry"
      subtitle="Keep pet registration records accessible for concierge and security checks."
      storageKey="buildsync_concierge_pet_registry"
      fields={[
        { key: "owner", label: "Owner", placeholder: "Resident name", required: true },
        { key: "unit", label: "Unit", placeholder: "8A", required: true },
        { key: "pet", label: "Pet", placeholder: "Dog - Golden Retriever", required: true },
      ]}
    />
  );
}