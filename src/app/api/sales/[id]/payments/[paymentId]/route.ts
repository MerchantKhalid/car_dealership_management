import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

// ─── DELETE /api/sales/[id]/payments/[paymentId] ──────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; paymentId: string } },
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

    // Confirm payment belongs to this sale
    const payment = await prisma.salePayment.findFirst({
      where: { id: params.paymentId, saleId: params.id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Delete the payment
    await prisma.salePayment.delete({ where: { id: params.paymentId } });

    // Recalculate paymentStatus from remaining payments
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);

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

    return NextResponse.json({ deleted: params.paymentId, newStatus });
  } catch (error) {
    return handleApiError(error);
  }
}
