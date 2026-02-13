import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, updateBookingStatus } from '@/lib/supabase/bookings';
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

/** PATCH /api/bookings/[id]/status - อัปเดตสถานะ booking พร้อมตรวจ transition */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: StatusUpdateBody;
  try {
    body = (await request.json()) as StatusUpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 }
    );
  }

  const { data: currentBooking, error: currentError } = await getBookingById(id);
  if (currentError) {
    return NextResponse.json({ error: currentError }, { status: 500 });
  }
  if (!currentBooking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const allowedTransitions = VALID_TRANSITIONS[currentBooking.status];
  if (!allowedTransitions.includes(body.status)) {
    return NextResponse.json(
      {
        error: `Cannot transition from '${currentBooking.status}' to '${body.status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
      },
      { status: 422 }
    );
  }

  const { data, error } = await updateBookingStatus(id, body.status);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
