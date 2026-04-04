import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

export async function DELETE(
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

    const payment = await prisma.paymentEntry.findUnique({
      where: { id: params.id },
    });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await prisma.paymentEntry.delete({ where: { id: params.id } });

    // Recalculate deal payment status after deletion
    const allPayments = await prisma.paymentEntry.findMany({
      where: { dealId: payment.dealId },
    });
    const deal = await prisma.deal.findUnique({
      where: { id: payment.dealId },
    });

    if (deal) {
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
        where: { id: payment.dealId },
        data: { paymentStatus: newStatus },
      });
    }

    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
