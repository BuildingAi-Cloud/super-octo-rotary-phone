import {
  docsSignIn,
  docsSignUp,
  docsDashboard,
  docsSettings,
  docsAuditLog,
  docsAccessibility,
  docsUserHierarchy,
  docsOnboardingHierarchy,
  docsIntegrations,
  markdownDocs,
} from "./entries";

export const inlineDocs = [
  docsSignIn,
  docsSignUp,
  docsDashboard,
  docsUserHierarchy,
  docsOnboardingHierarchy,
  docsIntegrations,
  docsSettings,
  docsAuditLog,
  docsAccessibility,
];

export { markdownDocs };

const docsIndex = [...inlineDocs, ...markdownDocs];

export default docsIndex;
