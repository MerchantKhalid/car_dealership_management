import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

const paymentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.number().positive('Amount must be positive'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
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

    const payments = await prisma.salePayment.findMany({
      where: { saleId: params.id },
      orderBy: { date: 'asc' },
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

    // Confirm sale exists
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = paymentSchema.parse(body);

    // Create payment
    const payment = await prisma.salePayment.create({
      data: {
        saleId: params.id,
        date: new Date(validated.date),
        amount: validated.amount,
        method: validated.method,
        reference: validated.reference || null,
        notes: validated.notes || null,
      },
    });

    // Recalculate and update paymentStatus on the Sale
    const allPayments = [...sale.payments, payment];
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let newStatus: 'PENDING' | 'DEPOSIT_PAID' | 'PAID_IN_FULL' = 'PENDING';
    if (totalPaid >= sale.salePrice) {
      newStatus = 'PAID_IN_FULL';
    } else if (totalPaid > 0) {
      newStatus = 'DEPOSIT_PAID';
    }

    await prisma.sale.update({
      where: { id: params.id },
      data: { paymentStatus: newStatus },
    });

    return NextResponse.json({ payment, newStatus }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
