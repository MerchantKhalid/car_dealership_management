import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paidDate: z.string().min(1, 'Payment date is required'),
  method: z
    .enum(['CASH', 'BANK_TRANSFER', 'MB_WAY', 'CHECK', 'OTHER'])
    .default('CASH'),
  reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
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

    // Verify deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        payments: true,
      },
    });
    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const body = await request.json();
    const validated = paymentSchema.parse(body);

    // Create the payment entry
    const payment = await prisma.paymentEntry.create({
      data: {
        dealId: params.id,
        amount: validated.amount,
        paidDate: new Date(validated.paidDate),
        method: validated.method,
        reference: validated.reference ?? null,
        notes: validated.notes ?? null,
        recordedBy: session.user.id ?? null,
      },
      include: {
        recorder: { select: { id: true, name: true } },
      },
    });

    // Auto-update deal paymentStatus based on total paid vs agreedPrice
    const allPayments = await prisma.paymentEntry.findMany({
      where: { dealId: params.id },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus:
      | 'PENDING'
      | 'DEPOSIT_PAID'
      | 'PARTIALLY_PAID'
      | 'PAID_IN_FULL' = 'PENDING';
    if (totalPaid >= deal.agreedPrice) {
      newStatus = 'PAID_IN_FULL';
    } else if (totalPaid > 0 && allPayments.length === 1) {
      newStatus = 'DEPOSIT_PAID';
    } else if (totalPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    await prisma.deal.update({
      where: { id: params.id },
      data: { paymentStatus: newStatus },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.paymentEntry.findMany({
      where: { dealId: params.id },
      include: {
        recorder: { select: { id: true, name: true } },
      },
      orderBy: { paidDate: 'asc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return handleApiError(error);
  }
}
