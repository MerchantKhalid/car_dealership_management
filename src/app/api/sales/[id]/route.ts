import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: {
        car: { include: { expenses: true, photos: true } },
        customer: true,
        seller: { select: { name: true } },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
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

    const body = await request.json();

    const sale = await prisma.sale.update({
      where: { id: params.id },
      data: {
        paymentStatus: body.paymentStatus,
        paymentMethod: body.paymentMethod,
        salePrice: body.salePrice,
        commission: body.commission,
      },
    });

    return NextResponse.json(sale);
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
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owners can delete sales' },
        { status: 403 },
      );
    }

    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.sale.delete({ where: { id: params.id } });
      await tx.car.update({
        where: { id: sale.carId },
        data: { status: 'AVAILABLE' },
      });
    });

    return NextResponse.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
