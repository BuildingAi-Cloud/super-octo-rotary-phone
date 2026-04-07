# Features

## Platform Capabilities
- AI-native and legacy system support
- Tenant hub for requests, amenity booking, and notices
- Knowledge graph with schemas and API
- Advanced security protocols, privacy, and compliance
- Dynamic documentation system (markdown-based, searchable)
- Developer resources and API documentation

## Role-Based Dashboards

Each tier of the four-level user hierarchy receives a purpose-built dashboard:

### Property Owner Dashboard
- **Pulse Indicator** — single Green/Yellow/Red building health status
- **Financial Performance** — NOI tracker, arrears & collections heatmap, budget vs actuals, yield/dividend monitoring
- **Asset Health & Lifecycle** — CapEx forecast (5–10 yr), asset depreciation ledger, preventative vs reactive ratio
- **Occupancy & Portfolio** — vacancy/retention rates, leasing pipeline, WALT (Weighted Average Lease Term)
- **Risk & Compliance** — insurance & liability status, critical incident alerts, sustainability & ESG score
- **Smart Insights** — market benchmarking, predictive maintenance alerts, management performance score

### Facility Manager Dashboard
- 15 tabs focused on technical infrastructure: Overview, Work Orders, Preventative Maintenance, Equipment Directory, IoT Alerts, Vendors, Compliance, Assets, Space, Reports, Documents, Workflows, Vendor Database, Integrations, Audit Log
- IoT sensor integration, preventive maintenance scheduling, vendor SLA tracking, asset lifecycle management

### Building Manager Dashboard (Super User)
- 17 tabs across 7 sections: Overview (leasing pipeline, renewals, shift log), Resident Experience, Operational Logistics, Service Oversight, Admin (Governance, Users), Security Integration, Systems (Integrations)
- Communication blasts, move-in/out workflows, amenity management, visitor logs, governance & e-voting

### Support Staff & Vendor Portals
- Mobile-first task views with check-in, photo upload, and ticket closure
- Role-specific portals for concierge, security, technicians, and external vendors

## Integrations & Interoperability (Open Ecosystem)

BuildSync connects to external systems across four integration layers:

1. **Financial & Accounting (ERP)** — Yardi, MRI Software, AppFolio, QuickBooks, Sage Intacct, Rent Manager. REST API sync for leases, invoices, GL entries. Webhooks for real-time updates.
2. **Physical Access Control** — Brivo, HID, Salto, Verkada, LiftMaster. Cloud-to-cloud APIs for credential provisioning and access event auditing.
3. **BMS & IoT** — BACnet/IP, Modbus TCP/RTU, MQTT gateways, Schneider EcoStruxure, Johnson Controls Metasys, Honeywell Forge. Sensor telemetry for HVAC, lighting, and metering.
4. **Vendor Portals** — Magic Links (zero-install, token-based task completion), QR Codes, CSV Importers, Slack & Gmail notifications. Vendors complete work orders without accounts.

Connection strategy: Software→Software (REST/GraphQL), Software→Hardware (Cloud APIs), Software→Building (Protocol Gateways), Software→Human (Magic Links/QR).
