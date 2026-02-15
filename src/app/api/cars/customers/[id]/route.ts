import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { customerSchema } from '@/lib/validations';
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        interestedCars: {
          include: {
            car: {
              include: { photos: true },
            },
          },
        },
        testDrives: {
          include: { car: true },
          orderBy: { date: 'desc' },
        },
        sales: {
          include: {
            car: true,
            seller: { select: { name: true } },
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
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
    const validated = customerSchema.parse(body);

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...validated,
        email: validated.email || null,
        followUpDate: validated.followUpDate
          ? new Date(validated.followUpDate)
          : null,
      },
    });

    return NextResponse.json(customer);
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
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    await prisma.customer.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
