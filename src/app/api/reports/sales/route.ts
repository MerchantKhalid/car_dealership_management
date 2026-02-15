import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // ✅ Use proper Prisma type instead of any
    const where: Prisma.SaleWhereInput = {};

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        car: { include: { expenses: true } },
        customer: true,
        seller: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    const reportData = sales.map((sale) => {
      const totalExpenses = sale.car.expenses.reduce((s, e) => s + e.amount, 0);
      const profit = sale.salePrice - sale.car.purchasePrice - totalExpenses;
      return {
        id: sale.id,
        date: sale.saleDate,
        car: `${sale.car.make} ${sale.car.model} ${sale.car.year}`,
        customer: sale.customer.name,
        seller: sale.seller?.name || 'N/A',
        purchasePrice: sale.car.purchasePrice,
        expenses: totalExpenses,
        salePrice: sale.salePrice,
        profit,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
      };
    });

    const totalRevenue = reportData.reduce((s, r) => s + r.salePrice, 0);
    const totalProfit = reportData.reduce((s, r) => s + r.profit, 0);
    const totalExpenses = reportData.reduce((s, r) => s + r.expenses, 0);

    return NextResponse.json({
      sales: reportData,
      summary: {
        totalSales: reportData.length,
        totalRevenue,
        totalProfit,
        totalExpenses,
        avgProfit: reportData.length > 0 ? totalProfit / reportData.length : 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
