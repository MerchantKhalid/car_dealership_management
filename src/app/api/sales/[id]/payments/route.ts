import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

const paymentSchema = z.object({
  paidDate: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'MB_WAY', 'CHECK', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// ─── GET /api/sales/[id]/payments ─────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.paymentEntry.findMany({
      where: { dealId: params.id },
      orderBy: { paidDate: 'asc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── POST /api/sales/[id]/payments ────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'VIEWER' || session.user.role === 'MECHANIC') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    // Confirm deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = paymentSchema.parse(body);

    // Create payment
    const payment = await prisma.paymentEntry.create({
      data: {
        dealId: params.id,
        paidDate: new Date(validated.paidDate),
        amount: validated.amount,
        method: validated.method,
        reference: validated.reference || null,
        notes: validated.notes || null,
        recordedBy: session.user.id,
      },
    });

    // Recalculate and update paymentStatus on the Deal
    const allPayments = [...deal.payments, payment];
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus: 'PENDING' | 'DEPOSIT_PAID' | 'PAID_IN_FULL' = 'PENDING';
    if (totalPaid >= deal.agreedPrice) {
      newStatus = 'PAID_IN_FULL';
    } else if (totalPaid > 0) {
      newStatus = 'DEPOSIT_PAID';
    }

    await prisma.deal.update({
      where: { id: params.id },
      data: { paymentStatus: newStatus },
    });

    return NextResponse.json({ payment, newStatus }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
