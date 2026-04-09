import { NextResponse } from 'next/server';

export async function GET() {
  // Example: Return dashboard data for demo
  return NextResponse.json({
    dashboards: [
      { role: 'resident', data: 'Resident dashboard data' },
      { role: 'tenant', data: 'Tenant dashboard data' },
      { role: 'property_manager', data: 'Property Manager dashboard data' },
      { role: 'facility_manager', data: 'Facility Manager dashboard data' },
      { role: 'building_owner', data: 'Building Owner dashboard data' },
      { role: 'vendor', data: 'Vendor dashboard data', endpoints: [
        'GET /api/vendor/requests?vendorId=',
        'PATCH /api/vendor/requests',
        'GET /api/vendor/invoices?vendorId=',
        'POST /api/vendor/invoices',
        'GET /api/vendor/appointments?vendorId=',
        'GET /api/vendor/stats?vendorId=',
        'GET /api/vendor/health',
      ]},
    ]
  });
}
