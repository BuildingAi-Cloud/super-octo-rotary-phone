"use client"
import Link from "next/link"

const NAV_SECTIONS = [
  {
    title: "Dashboard",
    items: [
      { label: "Announcements", href: "/concierge/announcements" },
      { label: "Bulletin Board", href: "/concierge/bulletin-board" },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Units/Occupants", href: "/concierge/units" },
      { label: "Custom Fields", href: "/concierge/custom-fields" },
      { label: "Calendar", href: "/concierge/calendar" },
      { label: "Library", href: "/concierge/library" },

      { label: "Pet Registry", href: "/concierge/pet-registry" },
      { label: "Parking Management", href: "/concierge/parking" },
      { label: "Asset Manager", href: "/concierge/assets" },
    ],
  },
  {
    title: "Front Desk",
    items: [
      { label: "Home", href: "/concierge/frontdesk" },
      { label: "Event Logs", href: "/concierge/event-logs" },
      { label: "Instructions", href: "/concierge/instructions" },
      { label: "Incident Report", href: "/concierge/incident-report" },
      { label: "Resident Directory", href: "/concierge/resident-directory" },
    ],
  },
  {
    title: "Maintenance",
    items: [
      { label: "New Request", href: "/concierge/maintenance/new" },
      { label: "Search Request", href: "/concierge/maintenance/search" },
      { label: "Vendors List", href: "/concierge/maintenance/vendors" },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Mailbox", href: "/concierge/mailbox" },
      { label: "Library Documents", href: "/concierge/library-documents" },
      { label: "Manage Photo Albums", href: "/concierge/photo-albums" },
      { label: "Configure Public Display", href: "/concierge/public-display" },
      { label: "Resident Directory", href: "/concierge/resident-directory" },
      { label: "Building Directory", href: "/concierge/building-directory" },
    ],
  },
  {
    title: "Resident Site",
    items: [
      { label: "View Resident Posting", href: "/concierge/resident-posting" },
      { label: "Manage Local Businesses Directory", href: "/concierge/business-directory" },
      { label: "Manage Offers", href: "/concierge/offers" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "General Settings", href: "/concierge/settings" },
    ],
  },
  {
    title: "Others",
    items: [
      { label: "Know Residents", href: "/concierge/know-residents" },
      { label: "Payments", href: "/concierge/payments" },
      { label: "Resident ID Verify", href: "/concierge/id-verify" },
    ],
  },
]

export function ConciergeDashboardNav() {
  return (
    <nav className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
      {NAV_SECTIONS.map(section => (
        <div key={section.title}>
          <h3 className="font-[var(--font-bebas)] text-xl mb-4">{section.title}</h3>
          <ul className="space-y-2">
            {section.items.map(item => (
              <li key={item.label}>
                <Link href={item.href} className="font-mono text-sm text-accent hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
