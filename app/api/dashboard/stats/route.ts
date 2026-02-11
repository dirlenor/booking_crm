import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/supabase/dashboard';

export async function GET() {
  const { data, error } = await getDashboardStats();

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}
