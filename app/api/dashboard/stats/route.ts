import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/supabase/dashboard';

/** GET /api/dashboard/stats - ดึง aggregate stats สำหรับ Dashboard */
export async function GET(_request: NextRequest) {
  const { data, error } = await getDashboardStats();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
