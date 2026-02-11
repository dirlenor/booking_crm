import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/supabase/bookings';
import type { BookingPassengerInsert } from '@/types/database';

interface CreateBookingBody {
  customer_id: string;
  trip_id: string;
  pax: number;
  total_amount: number;
  notes?: string;
  passengers?: Omit<BookingPassengerInsert, 'booking_id'>[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBookingBody;

    if (!body.customer_id || !body.trip_id || !body.pax || body.total_amount == null) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, trip_id, pax, total_amount' },
        { status: 400 }
      );
    }

    if (body.pax < 1) {
      return NextResponse.json(
        { error: 'pax must be at least 1' },
        { status: 400 }
      );
    }

    const { passengers, ...bookingInput } = body;

    const { data, error } = await createBooking(
      {
        ...bookingInput,
        notes: bookingInput.notes ?? null,
        status: 'pending',
        payment_status: 'unpaid',
        booking_date: new Date().toISOString(),
      },
      passengers
    );

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
