import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/supabase/bookings';
import type { BookingPassengerInsert } from '@/types/database';

interface CreateBookingBody {
  customer_id: string;
  trip_id: string;
  pax: number;
  total_amount: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status?: 'unpaid' | 'partial' | 'paid' | 'refunded';
  booking_date?: string;
  passengers?: Omit<BookingPassengerInsert, 'booking_id'>[];
}

/** POST /api/bookings - สร้าง booking พร้อม generate ref และ insert passengers */
export async function POST(request: NextRequest) {
  let body: CreateBookingBody;

  try {
    body = (await request.json()) as CreateBookingBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.customer_id || !body.trip_id || body.pax == null || body.total_amount == null) {
    return NextResponse.json(
      { error: 'Missing required fields: customer_id, trip_id, pax, total_amount' },
      { status: 400 }
    );
  }

  if (!Number.isFinite(body.pax) || body.pax < 1) {
    return NextResponse.json({ error: 'pax must be at least 1' }, { status: 400 });
  }

  if (!Number.isFinite(body.total_amount) || body.total_amount < 0) {
    return NextResponse.json({ error: 'total_amount must be >= 0' }, { status: 400 });
  }

  const { data, error } = await createBooking({
    booking: {
      customer_id: body.customer_id,
      trip_id: body.trip_id,
      pax: body.pax,
      total_amount: body.total_amount,
      notes: body.notes ?? null,
      status: body.status ?? 'pending',
      payment_status: body.payment_status ?? 'unpaid',
      booking_date: body.booking_date ?? new Date().toISOString(),
    },
    passengers: body.passengers ?? [],
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
