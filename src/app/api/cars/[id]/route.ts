import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { carSchema } from '@/lib/validations';
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

    const car = await prisma.car.findUnique({
      where: { id: params.id },
      include: {
        photos: true,
        expenses: {
          include: { user: { select: { name: true } } },
          orderBy: { date: 'desc' },
        },
        sale: {
          include: {
            customer: true,
            seller: { select: { name: true } },
          },
        },
        testDrives: {
          include: {
            customer: true,
          },
          orderBy: { date: 'desc' },
        },
        customers: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const totalExpenses = car.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    const result = {
      ...car,
      totalExpenses,
      purchasePrice:
        session.user.role === 'SALESPERSON' ? undefined : car.purchasePrice,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = carSchema.parse(body);

    const car = await prisma.car.update({
      where: { id: params.id },
      data: {
        ...validated,
        purchaseDate: new Date(validated.purchaseDate),
        minimumPrice: validated.minimumPrice || null,
      },
      include: {
        photos: true,
        expenses: true,
      },
    });

    return NextResponse.json(car);
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'Only owners can delete cars' },
        { status: 403 },
      );
    }

    await prisma.car.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
