import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/supabase/bookings';
import type { BookingStatus } from '@/types/database';

const VALID_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

interface StatusUpdateBody {
  status: BookingStatus;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as StatusUpdateBody;

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: currentBooking } = await import('@/lib/supabase/bookings').then(
      (m) => m.getBookingById(id)
    );

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[currentBooking.status];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Cannot transition from '${currentBooking.status}' to '${body.status}'. Allowed: ${allowed.join(', ') || 'none'}`,
        },
        { status: 422 }
      );
    }

    const { data, error } = await updateBookingStatus(id, body.status);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
