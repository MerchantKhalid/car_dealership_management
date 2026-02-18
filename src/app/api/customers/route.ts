import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, CustomerStatus, LeadSource } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { customerSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/error-handler';

function isValidCustomerStatus(status: string): status is CustomerStatus {
  return Object.values(CustomerStatus).includes(status as CustomerStatus);
}

function isValidLeadSource(source: string): source is LeadSource {
  return Object.values(LeadSource).includes(source as LeadSource);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const leadSourceParam = searchParams.get('leadSource');
    const search = searchParams.get('search');
    const followUpToday = searchParams.get('followUpToday');

    const where: Prisma.CustomerWhereInput = {};

    if (statusParam && isValidCustomerStatus(statusParam)) {
      where.status = statusParam;
    }

    if (leadSourceParam && isValidLeadSource(leadSourceParam)) {
      where.leadSource = leadSourceParam;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (followUpToday === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      where.followUpDate = {
        gte: today,
        lt: tomorrow,
      };
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        interestedCars: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                targetPrice: true,
                status: true,
              },
            },
          },
        },
        sales: {
          include: {
            car: { select: { make: true, model: true, year: true } },
          },
        },
        _count: {
          select: {
            testDrives: true,
            sales: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
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

    const customer = await prisma.customer.create({
      data: {
        ...validated,
        email: validated.email || null,
        followUpDate: validated.followUpDate
          ? new Date(validated.followUpDate)
          : null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
