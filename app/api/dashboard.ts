import { NextResponse } from 'next/server';

export async function GET() {
  // Example: Return dashboard data for demo
  return NextResponse.json({
    dashboards: [
      { role: 'resident', data: 'Resident dashboard data' },
      { role: 'tenant', data: 'Tenant dashboard data' },
      { role: 'property_manager', data: 'Property Manager dashboard data' },
      { role: 'facility_manager', data: 'Facility Manager dashboard data' },
      { role: 'building_owner', data: 'Building Owner dashboard data' }
    ]
  });
}
