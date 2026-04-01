# User Role Flows and Dashboard Wireframes

This documentation provides detailed user flows and dashboard wireframes for each role in the BuildSync platform, organised by the four-tier operational hierarchy. Use these as a reference for both development and onboarding.

---

# Tier 1 — Property Owner (The "Investor")

The Owner sees the building as a business unit. Their dashboard is primarily **view-only** — a high-level analytics layer that summarises data produced by the managers below.

## Property Owner Flow

**Flow:**
1. Login → Owner Dashboard (Pulse banner visible immediately)
2. Review "Pulse" indicator (Green / Yellow / Red)
3. Financial Performance tab — NOI tracker, arrears heatmap, budget vs actuals, yield/dividend
4. Asset Health tab — CapEx forecast (5-10 yr), depreciation ledger, preventative vs reactive ratio
5. Occupancy & Portfolio tab — vacancy/retention rates, leasing pipeline, WALT
6. Risk & Compliance tab — insurance status (Green/Red), critical incidents, ESG score
7. Smart Insights tab — market benchmarking, predictive maintenance alerts, management performance score
8. Approve/flag items that require Owner-level authority (CapEx, budget changes)

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: BuildSync | Owner | Notifications | Theme | Profile |
+-------------------------------------------------------------+
| PULSE: ● GREEN — Profitable, systems healthy, compliant     |
+-------------------------------------------------------------+
| [Financials] [Asset Health] [Occupancy] [Risk] [Insights]   |
+-------------------------------------------------------------+
| Tab Content Area                                             |
| - KPI Strip (role-specific metrics)                          |
| - Charts & Trend Lines                                       |
| - Filterable Data Tables                                     |
| - Actionable Alerts                                          |
+-------------------------------------------------------------+
```

---

# Tier 2 — Facility Manager (The "Technical Lead")

The FM is responsible for the physical health of the asset. They manage hard-FM (HVAC, electrical, plumbing, fire-safety) and soft-FM (cleaning, pest control, landscaping), supervise technical vendors, and feed CapEx data up to the Owner.

## Facility Manager Flow

**Flow:**
1. Login → FM Dashboard
2. View system health KPIs and IoT sensor alerts
3. Hard FM tabs — HVAC, electrical, plumbing, fire/life-safety, structural, elevators
4. Soft FM tabs — cleaning, pest control, landscaping, waste management
5. Security & Safety tabs — CCTV, access control, emergency response, environmental
6. Smart Building tabs — IoT sensors, energy management, BMS integration
7. Admin tabs — vendor management, compliance docs, asset lifecycle, budgets/procurement
8. Assign/track work orders and schedule preventive maintenance
9. Generate reports for Owner review

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: BuildSync | FM | Notifications | Theme | Profile    |
+-------------------------------------------------------------+
| [HVAC][Elec][Plumb][Fire][Struct][Elev][Clean][Pest]...     |
|   (21 tabs across 5 sections: Hard FM, Soft FM, Security,   |
|    Smart Building, Admin/Financial)                          |
+-------------------------------------------------------------+
| Tab Content Area                                             |
| - Equipment status, sensor readings                          |
| - Maintenance schedules & work orders                        |
| - Vendor SLA compliance                                      |
| - Asset lifecycle tracking                                   |
+-------------------------------------------------------------+
```

---

# Tier 3 — Building Manager (The "Operator")

The BM is the platform **super-user**, managing day-to-day data that flows up to the FM and Owner. They bridge the physical building and the people inside it.

## Building Manager Flow

**Flow:**
1. Login → BM Dashboard
2. Resident & Tenant Experience tabs — communications, onboarding, amenities, visitors, packages
3. Operational Logistics tabs — work orders, keys & fobs, vendor compliance
4. Service & Maintenance Oversight tab — incidents & violations
5. Administrative & Financial Control tabs — documents, analytics
6. Smart Access & Security Integration tab — access control
7. Manage front-of-house staff (concierge, security, cleaners)
8. Resolve resident tickets and handle communication blasts

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: BuildSync | BM | Notifications | Theme | Profile    |
+-------------------------------------------------------------+
| [Comms][Onboard][Amenities][Visitors][Packages][WorkOrders] |
|   [Keys][Vendors][Incidents][Violations][Docs][Analytics]    |
|   [Access Control]                                           |
+-------------------------------------------------------------+
| Tab Content Area                                             |
| - Resident communication & satisfaction                      |
| - Move-in/out workflows                                      |
| - Amenity bookings & visitor logs                            |
| - Front-of-house operations                                  |
+-------------------------------------------------------------+
```

---

# Tier 4 — Support Staff & Vendors (The "Execution Layer")

These users perform specialised tasks. Their SaaS experience is **mobile-first** and task-focused.

## Concierge Flow

**Flow:**
1. Login → Concierge Dashboard
2. View resident/visitor directory
3. Register visitors and log arrivals
4. Book amenities for residents
5. Log packages/deliveries
6. Submit service requests on behalf of residents
7. Log key returns and elevator bookings for move-ins/outs

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Residents       | - Visitor Log                          |
| - Visitors        | - Amenity Bookings                     |
| - Packages        | - Package Log                          |
| - Amenities       | - Service Requests                     |
+-------------------+-----------------------------------------+
```

## Security Staff Flow

**Flow:**
1. Login → Security Dashboard
2. Monitor CCTV feeds and access control logs
3. Respond to incident alerts
4. Log security patrols
5. Manage visitor access authorisation
6. File incident reports

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: Alerts | Profile                                    |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Incidents       | - Active Alerts                        |
| - Access Logs     | - CCTV Overview                        |
| - Patrols         | - Visitor Queue                        |
+-------------------+-----------------------------------------+
```

## Staff / Technician Flow

**Flow:**
1. Login → Task Dashboard (mobile-first)
2. View assigned tasks/work orders
3. Check-in at job site
4. Mark tasks as in-progress / completed
5. Upload completion photos and notes
6. View schedule

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - Tasks           | - Task List                            |
| - Schedule        | - Task Details + Photo Upload          |
+-------------------+-----------------------------------------+
```

## Vendor Flow

**Flow:**
1. Login → Vendor Portal (mobile-first)
2. View assigned work orders
3. Check-in at job site (geo-stamped)
4. Upload photos of completed repairs
5. Submit completion report
6. Close out ticket

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| - Work Orders     | - Order Details                        |
| - Check-In        | - Photo Upload                         |
| - History         | - Completion Report                    |
+-------------------+-----------------------------------------+
```

---

## Resident Flow (Tenant / Unit Owner)

**Flow:**
1. Login → Resident Dashboard
2. View unit details, announcements
3. Book amenities
4. Submit/track service requests
5. Access community features
6. Update profile
7. (Unit Owner) View financials, manage tenants, participate in governance votes

**Wireframe:**
```
+-------------------------------------------------------------+
| Header: Notifications | Profile                             |
+-------------------+-----------------------------------------+
| Sidebar           | Main Panel                             |
| - My Unit         | - Unit Info                            |
| - Amenities       | - Amenity Booking                      |
| - Requests        | - Service Requests                     |
| - Community       | - Community Feed                       |
+-------------------+-----------------------------------------+
```

---

# Data Flow — How the Hierarchy Syncs

| Event | Tier 4 (Execution) | Tier 2/3 (Reporting) | Tier 1 (Owner Visibility) |
|---|---|---|---|
| A pipe bursts | Vendor closes the repair ticket | FM reviews cost & updates asset history | Owner sees "Maintenance Expense" spike on monthly budget |
| A tenant moves out | Concierge logs key return & elevator booking | BM triggers unit cleaning & security deposit refund | Owner sees "Vacancy" increase by 1% on occupancy chart |
| Energy bill is high | IoT sensor flags high usage | FM investigates HVAC efficiency | Owner sees "Utility Costs" 10% over budget |

---

## Implementation Notes

- Each tier maps to a React component tree, with role-based routing in `/app/dashboard/page.tsx`.
- The Owner dashboard is **view-only analytics**; the BM dashboard is the **super-user operational hub**.
- Role-based access control ensures users only see features relevant to their tier.
- Tab-based dashboards (Owner: 5 tabs, FM: 21 tabs, BM: 13 tabs) use sticky navigation with shared utility components in their respective `*-tabs/` directories.

---

*For diagram visuals, import these wireframes into a tool like draw.io or Figma for high-fidelity documentation.*
