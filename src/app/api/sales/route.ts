import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { saleSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/error-handler';
import { Prisma, PaymentStatus } from '@prisma/client';

function isValidPaymentStatus(status: string): status is PaymentStatus {
  return Object.values(PaymentStatus).includes(status as PaymentStatus);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const paymentStatus = searchParams.get('paymentStatus');

    const where: Prisma.SaleWhereInput = {};

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    if (paymentStatus && isValidPaymentStatus(paymentStatus)) {
      where.paymentStatus = paymentStatus;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        car: {
          include: { expenses: true },
        },
        customer: true,
        seller: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    // Calculate profit for each sale
    const salesWithProfit = sales.map((sale) => {
      const totalExpenses = sale.car.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );
      const profit = sale.salePrice - sale.car.purchasePrice - totalExpenses;
      return {
        ...sale,
        profit,
        totalExpenses,
        car: {
          ...sale.car,
          purchasePrice:
            session.user.role === 'SALESPERSON'
              ? undefined
              : sale.car.purchasePrice,
        },
      };
    });

    return NextResponse.json(salesWithProfit);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validated = saleSchema.parse(body);

    // Get car details for profit calculation
    const car = await prisma.car.findUnique({
      where: { id: validated.carId },
      include: { expenses: true, sale: true },
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (car.sale) {
      return NextResponse.json(
        { error: 'This car has already been sold' },
        { status: 400 },
      );
    }

    const totalExpenses = car.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );
    const profit = validated.salePrice - car.purchasePrice - totalExpenses;

    // Create sale and update car status in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          carId: validated.carId,
          customerId: validated.customerId,
          sellerId: validated.sellerId || session.user.id,
          salePrice: validated.salePrice,
          saleDate: new Date(validated.saleDate),
          paymentMethod: validated.paymentMethod,
          paymentStatus: validated.paymentStatus,
          commission: validated.commission || null,
          profit,
        },
        include: {
          car: true,
          customer: true,
          seller: { select: { name: true } },
        },
      });

      // Update car status to SOLD
      await tx.car.update({
        where: { id: validated.carId },
        data: { status: 'SOLD' },
      });

      // Update customer status to SOLD
      await tx.customer.update({
        where: { id: validated.customerId },
        data: { status: 'SOLD' },
      });

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    handleApiError(error);
  }
}
