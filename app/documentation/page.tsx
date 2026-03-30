"use client"

import { GlobalSearch } from "@/components/global-search";

export default function DocumentationPage() {
  return (
    <main className="min-h-screen max-w-[900px] mx-auto px-4 py-16">
      <div className="flex justify-end mb-4">
        <GlobalSearch />
      </div>
      <h1 className="font-[var(--font-bebas)] text-5xl md:text-7xl tracking-tight mb-6 text-center">Documentation & Advanced Search</h1>
      <p className="font-mono text-base md:text-lg text-muted-foreground mb-6 text-center">
        Welcome to the BuildSync documentation. Here you'll find detailed guides, user flows, and dashboard wireframes for every role in the platform. Use the advanced search below to quickly locate the information you need.
      </p>
      <div className="text-muted-foreground text-xs text-center mb-8">
        (Use the search button above to find documentation and pages. For now, browse the docs or contact support.)
      </div>
      <div className="text-muted-foreground text-xs text-center mb-8">
        <b>API Documentation:</b> API access for specific products will be available soon. Customers will be able to review API docs and receive API keys after purchase. To view/manage your API access, log in and visit <a href="/api-access" className="underline">API Access</a>.
      </div>
      <section className="mb-12">
        <h2 className="font-mono text-2xl mb-4">Quick Links</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li><a href="#facility-manager" className="underline hover:text-accent">Facility Manager Flow</a></li>
          <li><a href="#property-manager" className="underline hover:text-accent">Property Manager Flow</a></li>
          <li><a href="#staff" className="underline hover:text-accent">Staff Flow</a></li>
          <li><a href="#concierge" className="underline hover:text-accent">Concierge Flow</a></li>
          <li><a href="#resident" className="underline hover:text-accent">Resident Flow</a></li>
          <li><a href="#wireframes" className="underline hover:text-accent">Dashboard Wireframes</a></li>
        </ul>
      </section>
      <section id="facility-manager" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Facility Manager Flow</h2>
        <ol className="list-decimal list-inside text-muted-foreground">
          <li>Login → Dashboard</li>
          <li>View all properties, KPIs, alerts</li>
          <li>Manage amenities (add/edit, approve bookings)</li>
          <li>Assign/track work orders</li>
          <li>Schedule preventive maintenance</li>
          <li>Manage staff (add/remove, assign roles)</li>
          <li>Generate reports</li>
          <li>Receive and act on alerts</li>
        </ol>
      </section>
      <section id="property-manager" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Property Manager Flow</h2>
        <ol className="list-decimal list-inside text-muted-foreground">
          <li>Login → Dashboard</li>
          <li>View assigned properties</li>
          <li>Manage residents (approve, update info)</li>
          <li>Approve amenity bookings</li>
          <li>Oversee work orders</li>
          <li>Upload compliance docs</li>
          <li>Generate property reports</li>
        </ol>
      </section>
      <section id="staff" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Staff Flow</h2>
        <ol className="list-decimal list-inside text-muted-foreground">
          <li>Login → Dashboard</li>
          <li>View assigned tasks/work orders</li>
          <li>Mark tasks as in progress/completed</li>
          <li>Access task details</li>
          <li>Upload completion notes/photos</li>
          <li>View schedule</li>
        </ol>
      </section>
      <section id="concierge" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Concierge Flow</h2>
        <ol className="list-decimal list-inside text-muted-foreground">
          <li>Login → Dashboard</li>
          <li>View resident/visitor directory</li>
          <li>Register visitors</li>
          <li>Book amenities for residents</li>
          <li>Log packages/deliveries</li>
          <li>Submit service requests for residents</li>
        </ol>
      </section>
      <section id="resident" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Resident Flow (Tenant/Owner)</h2>
        <ol className="list-decimal list-inside text-muted-foreground">
          <li>Login → Dashboard</li>
          <li>View unit details, announcements</li>
          <li>Book amenities</li>
          <li>Submit/track service requests</li>
          <li>Access community features</li>
          <li>Update profile</li>
          <li>(Owner) View financials, manage tenants, participate in votes</li>
        </ol>
      </section>
      <section id="wireframes" className="mb-12">
        <h2 className="font-mono text-xl mb-2">Dashboard Wireframes</h2>
        <p className="mb-2 text-muted-foreground">Each dashboard is structured for clarity and ease of use. Below are wireframe layouts for each role:</p>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto mb-4">
Facility Manager:
+-------------------------------------------------------------+
| Header: Notifications | Profile | Quick Actions             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Properties      | - KPIs                                 |
| - Amenities       | - Amenity Management                   |
| - Work Orders     | - Work Orders List                     |
| - Staff           | - Staff Overview                       |
| - Reports         | - Alerts Feed                          |
+-------------------+-----------------------------------------+
        </pre>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto mb-4">
Property Manager:
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Residents       | - Property Overview                    |
| - Amenities       | - Resident List                        |
| - Work Orders     | - Amenity Bookings                     |
| - Compliance      | - Work Orders                          |
| - Reports         | - Compliance Status                    |
+-------------------+-----------------------------------------+
        </pre>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto mb-4">
Staff:
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Tasks           | - Task List                            |
| - Schedule        | - Task Details                         |
+-------------------+-----------------------------------------+
        </pre>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto mb-4">
Concierge:
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Residents       | - Visitor Log                          |
| - Visitors        | - Amenity Bookings                     |
| - Packages        | - Package Log                          |
| - Amenities       | - Service Requests                     |
+-------------------+-----------------------------------------+
        </pre>
        <pre className="bg-muted p-4 rounded text-xs overflow-x-auto mb-4">
Resident:
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - My Unit         | - Unit Info                            |
| - Amenities       | - Amenity Booking                      |
| - Requests        | - Service Requests                     |
| - Community       | - Community Feed                       |
+-------------------+-----------------------------------------+
        </pre>
      </section>
      <footer className="w-full text-center py-6 text-xs text-muted-foreground bg-background/80 border-t border-border mt-12">
        <a href="/">← Back to Home</a>
      </footer>
    </main>
  );
}
