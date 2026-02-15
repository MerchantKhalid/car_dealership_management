import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

import { handleApiError } from '@/lib/error-handler';

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
    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        type: body.type,
        amount: body.amount,
        date: new Date(body.date),
        description: body.description,
        vendor: body.vendor,
      },
    });

    return NextResponse.json(expense);
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
    if (
      !session ||
      (session.user.role !== 'OWNER' && session.user.role !== 'SALESPERSON')
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    await prisma.expense.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
