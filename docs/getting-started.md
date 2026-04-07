# Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/BuildingAi-Cloud/super-octo-rotary-phone.git
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the app at [http://localhost:3000](http://localhost:3000)

## Demo Accounts

The platform pre-seeds test accounts for every role (password: `12345678`):

| Tier | Role | Email |
|------|------|-------|
| 1 | Property Owner | `test_building_owner@example.com` |
| 2 | Facility Manager | `test_facility_manager@example.com` |
| 3 | Building Manager | `test_building_manager@example.com` |
| 4 | Concierge | `test_concierge@example.com` |
| 4 | Security | `test_security@example.com` |
| 4 | Staff | `test_staff@example.com` |
| 4 | Vendor | `test_vendor@example.com` |
| — | Resident | `test_resident@example.com` |
| — | Admin | `test_admin@example.com` |

Each role routes to a dedicated dashboard after sign-in. See **User Role Flows and Dashboard Wireframes** for the full hierarchy.
