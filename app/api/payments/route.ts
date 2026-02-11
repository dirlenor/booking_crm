import { NextRequest, NextResponse } from 'next/server';
import { recordPayment } from '@/lib/supabase/payments';
import type { PaymentMethod, PaymentStatus } from '@/types/database';

interface RecordPaymentBody {
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  note?: string;
  slip_url?: string;
  payment_date?: string;
}

const VALID_METHODS: PaymentMethod[] = ['Credit Card', 'Bank Transfer', 'Cash', 'PromptPay'];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RecordPaymentBody;

    if (!body.booking_id || body.amount == null || !body.method) {
      return NextResponse.json(
        { error: 'Missing required fields: booking_id, amount, method' },
        { status: 400 }
      );
    }

    if (body.amount < 0) {
      return NextResponse.json(
        { error: 'amount must be >= 0' },
        { status: 400 }
      );
    }

    if (!VALID_METHODS.includes(body.method)) {
      return NextResponse.json(
        { error: `Invalid method. Must be one of: ${VALID_METHODS.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await recordPayment({
      booking_id: body.booking_id,
      amount: body.amount,
      method: body.method,
      status: body.status ?? 'completed',
      note: body.note ?? null,
      slip_url: body.slip_url ?? null,
      payment_date: body.payment_date ?? new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
