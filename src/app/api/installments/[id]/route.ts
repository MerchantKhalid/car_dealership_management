import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

const installmentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'LATE']),
  paidDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PUT(
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

    const body = await request.json();
    const validated = installmentUpdateSchema.parse(body);

    const installment = await prisma.installment.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        paidDate: validated.paidDate ? new Date(validated.paidDate) : null,
        notes: validated.notes ?? null,
      },
    });

    // After updating installment, check if all installments in the deal are paid
    // and auto-update deal paymentStatus to PAID_IN_FULL if so
    const deal = await prisma.deal.findUnique({
      where: { id: installment.dealId },
      include: { installments: true },
    });

    if (deal) {
      const allPaid = deal.installments.every((i) => i.status === 'PAID');
      if (allPaid && deal.paymentStatus !== 'PAID_IN_FULL') {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { paymentStatus: 'PAID_IN_FULL' },
        });
      } else if (!allPaid && deal.paymentStatus === 'PAID_IN_FULL') {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { paymentStatus: 'DEPOSIT_PAID' },
        });
      }
    }

    return NextResponse.json(installment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    await prisma.installment.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Installment deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
