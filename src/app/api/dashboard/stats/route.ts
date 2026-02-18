// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { handleApiError } from '@/lib/error-handler';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59,
//     );

//     // Get all non-sold cars for inventory stats
//     const carsInStock = await prisma.car.findMany({
//       where: { status: { not: 'SOLD' } },
//       include: { expenses: true },
//     });

//     // Cars by status
//     const carsByStatus = await prisma.car.groupBy({
//       by: ['status'],
//       _count: { status: true },
//       where: { status: { not: 'SOLD' } },
//     });

//     // This month's sales
//     const monthlySales = await prisma.sale.findMany({
//       where: {
//         saleDate: { gte: startOfMonth, lte: endOfMonth },
//       },
//       include: {
//         car: { include: { expenses: true } },
//       },
//     });

//     // Calculate monthly revenue and profit
//     const monthlyRevenue = monthlySales.reduce(
//       (sum, sale) => sum + sale.salePrice,
//       0,
//     );
//     const monthlyProfit = monthlySales.reduce((sum, sale) => {
//       const totalExpenses = sale.car.expenses.reduce((s, e) => s + e.amount, 0);
//       return sum + (sale.salePrice - sale.car.purchasePrice - totalExpenses);
//     }, 0);

//     // Inventory value
//     const inventoryValue = carsInStock.reduce((sum, car) => {
//       const carExpenses = car.expenses.reduce((s, e) => s + e.amount, 0);
//       return sum + car.purchasePrice + carExpenses;
//     }, 0);

//     // Cars sitting > 60 days
//     const sixtyDaysAgo = new Date();
//     sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
//     const oldInventory = carsInStock.filter(
//       (car) => new Date(car.purchaseDate) < sixtyDaysAgo,
//     );

//     // Follow-ups needed today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const followUpsToday = await prisma.customer.count({
//       where: {
//         followUpDate: { gte: today, lt: tomorrow },
//         status: { notIn: ['SOLD', 'LOST'] },
//       },
//     });

//     // Average days to sell (last 30 sales)
//     const recentSales = await prisma.sale.findMany({
//       include: { car: true },
//       orderBy: { saleDate: 'desc' },
//       take: 30,
//     });

//     const avgDaysToSell =
//       recentSales.length > 0
//         ? recentSales.reduce((sum, sale) => {
//             const days = Math.floor(
//               (new Date(sale.saleDate).getTime() -
//                 new Date(sale.car.purchaseDate).getTime()) /
//                 (1000 * 60 * 60 * 24),
//             );
//             return sum + days;
//           }, 0) / recentSales.length
//         : 0;

//     // Average profit per car
//     const avgProfit =
//       recentSales.length > 0
//         ? recentSales.reduce((sum, sale) => sum + (sale.profit || 0), 0) /
//           recentSales.length
//         : 0;

//     // Best selling make
//     const salesByMake = await prisma.sale.findMany({
//       include: { car: { select: { make: true } } },
//     });
//     const makeCounts: Record<string, number> = {};
//     salesByMake.forEach((sale) => {
//       makeCounts[sale.car.make] = (makeCounts[sale.car.make] || 0) + 1;
//     });
//     const bestSellingMake = Object.entries(makeCounts).sort(
//       (a, b) => b[1] - a[1],
//     )[0];

//     // Monthly sales trend (last 6 months)
//     const monthlyTrend = [];
//     for (let i = 5; i >= 0; i--) {
//       const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthEnd = new Date(
//         now.getFullYear(),
//         now.getMonth() - i + 1,
//         0,
//         23,
//         59,
//         59,
//       );

//       const monthSales = await prisma.sale.findMany({
//         where: { saleDate: { gte: monthStart, lte: monthEnd } },
//         include: { car: { include: { expenses: true } } },
//       });

//       const revenue = monthSales.reduce((s, sale) => s + sale.salePrice, 0);
//       const profit = monthSales.reduce((s, sale) => {
//         const expenses = sale.car.expenses.reduce((es, e) => es + e.amount, 0);
//         return s + (sale.salePrice - sale.car.purchasePrice - expenses);
//       }, 0);

//       monthlyTrend.push({
//         month: monthStart.toLocaleString('en-US', {
//           month: 'short',
//           year: 'numeric',
//         }),
//         sales: monthSales.length,
//         revenue,
//         profit,
//       });
//     }

//     // Most profitable sale this month
//     const mostProfitableSale =
//       monthlySales.length > 0
//         ? monthlySales.reduce((best, sale) => {
//             const totalExpenses = sale.car.expenses.reduce(
//               (s, e) => s + e.amount,
//               0,
//             );
//             const profit =
//               sale.salePrice - sale.car.purchasePrice - totalExpenses;
//             const bestProfit = best
//               ? best.salePrice -
//                 best.car.purchasePrice -
//                 best.car.expenses.reduce((s, e) => s + e.amount, 0)
//               : -Infinity;
//             return profit > bestProfit ? sale : best;
//           }, monthlySales[0])
//         : null;

//     return NextResponse.json({
//       totalCarsInStock: carsInStock.length,
//       inventoryValue,
//       carsByStatus: carsByStatus.map((s) => ({
//         status: s.status,
//         count: s._count.status,
//       })),
//       thisMonth: {
//         salesCount: monthlySales.length,
//         revenue: monthlyRevenue,
//         profit: monthlyProfit,
//       },
//       alerts: {
//         oldInventory: oldInventory.length,
//         followUpsToday,
//         lowStock: carsInStock.length < 5,
//       },
//       quickStats: {
//         avgDaysToSell: Math.round(avgDaysToSell),
//         avgProfit: Math.round(avgProfit),
//         bestSellingMake: bestSellingMake
//           ? { make: bestSellingMake[0], count: bestSellingMake[1] }
//           : null,
//         mostProfitableSale: mostProfitableSale
//           ? {
//               car: `${mostProfitableSale.car.make} ${mostProfitableSale.car.model}`,
//               profit: mostProfitableSale.profit,
//             }
//           : null,
//       },
//       monthlyTrend,
//     });
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { handleApiError } from '@/lib/error-handler';

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(
//       now.getFullYear(),
//       now.getMonth() + 1,
//       0,
//       23,
//       59,
//       59,
//     );
//     const sixtyDaysAgo = new Date(now);
//     sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
//     const today = new Date(now);
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     // Build monthly trend date ranges up front
//     const monthRanges = Array.from({ length: 6 }, (_, i) => {
//       const monthStart = new Date(
//         now.getFullYear(),
//         now.getMonth() - (5 - i),
//         1,
//       );
//       const monthEnd = new Date(
//         now.getFullYear(),
//         now.getMonth() - (5 - i) + 1,
//         0,
//         23,
//         59,
//         59,
//       );
//       return { monthStart, monthEnd };
//     });

//     // ✅ Run ALL independent queries in parallel instead of sequentially
//     const [
//       carsInStock,
//       carsByStatus,
//       monthlySales,
//       followUpsToday,
//       recentSales,
//       allSalesForMake,
//       ...monthlyTrendResults
//     ] = await Promise.all([
//       // Inventory: only fetch fields we need (no full expenses include for count)
//       prisma.car.findMany({
//         where: { status: { not: 'SOLD' } },
//         select: {
//           id: true,
//           purchasePrice: true,
//           purchaseDate: true,
//           expenses: { select: { amount: true } },
//         },
//       }),

//       // Cars by status groupBy
//       prisma.car.groupBy({
//         by: ['status'],
//         _count: { status: true },
//         where: { status: { not: 'SOLD' } },
//       }),

//       // This month's sales
//       prisma.sale.findMany({
//         where: { saleDate: { gte: startOfMonth, lte: endOfMonth } },
//         select: {
//           salePrice: true,
//           profit: true,
//           car: {
//             select: {
//               make: true,
//               model: true,
//               purchasePrice: true,
//               expenses: { select: { amount: true } },
//             },
//           },
//         },
//       }),

//       // Follow-ups count
//       prisma.customer.count({
//         where: {
//           followUpDate: { gte: today, lt: tomorrow },
//           status: { notIn: ['SOLD', 'LOST'] },
//         },
//       }),

//       // Recent 30 sales for avg stats
//       prisma.sale.findMany({
//         select: {
//           profit: true,
//           saleDate: true,
//           car: { select: { purchaseDate: true } },
//         },
//         orderBy: { saleDate: 'desc' },
//         take: 30,
//       }),

//       // All sales for best-selling make
//       prisma.sale.findMany({
//         select: { car: { select: { make: true } } },
//       }),

//       // Monthly trend queries — all 6 in parallel
//       ...monthRanges.map(({ monthStart, monthEnd }) =>
//         prisma.sale.findMany({
//           where: { saleDate: { gte: monthStart, lte: monthEnd } },
//           select: {
//             salePrice: true,
//             car: {
//               select: {
//                 purchasePrice: true,
//                 expenses: { select: { amount: true } },
//               },
//             },
//           },
//         }),
//       ),
//     ]);

//     // --- Compute derived values in JS (no extra DB calls) ---

//     const inventoryValue = carsInStock.reduce((sum, car) => {
//       const carExpenses = car.expenses.reduce((s, e) => s + e.amount, 0);
//       return sum + car.purchasePrice + carExpenses;
//     }, 0);

//     const oldInventoryCount = carsInStock.filter(
//       (car) => new Date(car.purchaseDate) < sixtyDaysAgo,
//     ).length;

//     const monthlyRevenue = monthlySales.reduce(
//       (sum, s) => sum + s.salePrice,
//       0,
//     );
//     const monthlyProfit = monthlySales.reduce((sum, sale) => {
//       const totalExpenses = sale.car.expenses.reduce((s, e) => s + e.amount, 0);
//       return sum + (sale.salePrice - sale.car.purchasePrice - totalExpenses);
//     }, 0);

//     const avgDaysToSell =
//       recentSales.length > 0
//         ? recentSales.reduce((sum, sale) => {
//             const days = Math.floor(
//               (new Date(sale.saleDate).getTime() -
//                 new Date(sale.car.purchaseDate).getTime()) /
//                 (1000 * 60 * 60 * 24),
//             );
//             return sum + days;
//           }, 0) / recentSales.length
//         : 0;

//     const avgProfit =
//       recentSales.length > 0
//         ? recentSales.reduce((sum, s) => sum + (s.profit || 0), 0) /
//           recentSales.length
//         : 0;

//     const makeCounts: Record<string, number> = {};
//     allSalesForMake.forEach((sale) => {
//       makeCounts[sale.car.make] = (makeCounts[sale.car.make] || 0) + 1;
//     });
//     const bestSellingEntry = Object.entries(makeCounts).sort(
//       (a, b) => b[1] - a[1],
//     )[0];

//     const mostProfitableSale =
//       monthlySales.length > 0
//         ? monthlySales.reduce((best, sale) => {
//             const expenses = sale.car.expenses.reduce(
//               (s, e) => s + e.amount,
//               0,
//             );
//             const profit = sale.salePrice - sale.car.purchasePrice - expenses;
//             const bestExpenses = best.car.expenses.reduce(
//               (s, e) => s + e.amount,
//               0,
//             );
//             const bestProfit =
//               best.salePrice - best.car.purchasePrice - bestExpenses;
//             return profit > bestProfit ? sale : best;
//           }, monthlySales[0])
//         : null;

//     const monthlyTrend = monthlyTrendResults.map((monthSales, i) => {
//       const { monthStart } = monthRanges[i];
//       const revenue = monthSales.reduce((s, sale) => s + sale.salePrice, 0);
//       const profit = monthSales.reduce((s, sale) => {
//         const expenses = sale.car.expenses.reduce((es, e) => es + e.amount, 0);
//         return s + (sale.salePrice - sale.car.purchasePrice - expenses);
//       }, 0);
//       return {
//         month: monthStart.toLocaleString('en-US', {
//           month: 'short',
//           year: 'numeric',
//         }),
//         sales: monthSales.length,
//         revenue,
//         profit,
//       };
//     });

//     return NextResponse.json({
//       totalCarsInStock: carsInStock.length,
//       inventoryValue,
//       carsByStatus: carsByStatus.map((s) => ({
//         status: s.status,
//         count: s._count.status,
//       })),
//       thisMonth: {
//         salesCount: monthlySales.length,
//         revenue: monthlyRevenue,
//         profit: monthlyProfit,
//       },
//       alerts: {
//         oldInventory: oldInventoryCount,
//         followUpsToday,
//         lowStock: carsInStock.length < 5,
//       },
//       quickStats: {
//         avgDaysToSell: Math.round(avgDaysToSell),
//         avgProfit: Math.round(avgProfit),
//         bestSellingMake: bestSellingEntry
//           ? { make: bestSellingEntry[0], count: bestSellingEntry[1] }
//           : null,
//         mostProfitableSale: mostProfitableSale
//           ? {
//               car: `${mostProfitableSale.car.make} ${mostProfitableSale.car.model}`,
//               profit:
//                 mostProfitableSale.salePrice -
//                 mostProfitableSale.car.purchasePrice -
//                 mostProfitableSale.car.expenses.reduce(
//                   (s, e) => s + e.amount,
//                   0,
//                 ),
//             }
//           : null,
//       },
//       monthlyTrend,
//     });
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build monthly trend date ranges up front
    const monthRanges = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i),
        1,
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i) + 1,
        0,
        23,
        59,
        59,
      );
      return { monthStart, monthEnd };
    });

    // ✅ Run ALL independent queries in parallel instead of sequentially
    const [
      carsInStock,
      carsByStatus,
      monthlySales,
      followUpsToday,
      recentSales,
      allSalesForMake,
      ...monthlyTrendResults
    ] = await Promise.all([
      // Inventory: only fetch fields we need (no full expenses include for count)
      prisma.car.findMany({
        where: { status: { not: 'SOLD' } },
        select: {
          id: true,
          purchasePrice: true,
          purchaseDate: true,
          expenses: { select: { amount: true } },
        },
      }),

      // Cars by status groupBy
      prisma.car.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { status: { not: 'SOLD' } },
      }),

      // This month's sales
      prisma.sale.findMany({
        where: { saleDate: { gte: startOfMonth, lte: endOfMonth } },
        select: {
          salePrice: true,
          profit: true,
          car: {
            select: {
              make: true,
              model: true,
              purchasePrice: true,
              expenses: { select: { amount: true } },
            },
          },
        },
      }),

      // Follow-ups count
      prisma.customer.count({
        where: {
          followUpDate: { gte: today, lt: tomorrow },
          status: { notIn: ['SOLD', 'LOST'] },
        },
      }),

      // Recent 30 sales for avg stats
      prisma.sale.findMany({
        select: {
          profit: true,
          saleDate: true,
          car: { select: { purchaseDate: true } },
        },
        orderBy: { saleDate: 'desc' },
        take: 30,
      }),

      // All sales for best-selling make
      prisma.sale.findMany({
        select: { car: { select: { make: true } } },
      }),

      // Monthly trend queries — all 6 in parallel
      ...monthRanges.map(({ monthStart, monthEnd }) =>
        prisma.sale.findMany({
          where: { saleDate: { gte: monthStart, lte: monthEnd } },
          select: {
            salePrice: true,
            car: {
              select: {
                purchasePrice: true,
                expenses: { select: { amount: true } },
              },
            },
          },
        }),
      ),
    ]);

    // --- Compute derived values in JS (no extra DB calls) ---

    const inventoryValue = carsInStock.reduce((sum, car) => {
      const carExpenses = car.expenses.reduce((s, e) => s + e.amount, 0);
      return sum + car.purchasePrice + carExpenses;
    }, 0);

    const oldInventoryCount = carsInStock.filter(
      (car) => new Date(car.purchaseDate) < sixtyDaysAgo,
    ).length;

    const monthlyRevenue = monthlySales.reduce(
      (sum, s) => sum + s.salePrice,
      0,
    );
    const monthlyProfit = monthlySales.reduce((sum, sale) => {
      const totalExpenses = sale.car.expenses.reduce((s, e) => s + e.amount, 0);
      return sum + (sale.salePrice - sale.car.purchasePrice - totalExpenses);
    }, 0);

    const avgDaysToSell =
      recentSales.length > 0
        ? recentSales.reduce((sum, sale) => {
            const days = Math.floor(
              (new Date(sale.saleDate).getTime() -
                new Date(sale.car.purchaseDate).getTime()) /
                (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / recentSales.length
        : 0;

    const avgProfit =
      recentSales.length > 0
        ? recentSales.reduce((sum, s) => sum + (s.profit || 0), 0) /
          recentSales.length
        : 0;

    const makeCounts: Record<string, number> = {};
    allSalesForMake.forEach((sale) => {
      makeCounts[sale.car.make] = (makeCounts[sale.car.make] || 0) + 1;
    });
    const bestSellingEntry = Object.entries(makeCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const mostProfitableSale =
      monthlySales.length > 0
        ? monthlySales.reduce((best, sale) => {
            const expenses = sale.car.expenses.reduce(
              (s, e) => s + e.amount,
              0,
            );
            const profit = sale.salePrice - sale.car.purchasePrice - expenses;
            const bestExpenses = best.car.expenses.reduce(
              (s, e) => s + e.amount,
              0,
            );
            const bestProfit =
              best.salePrice - best.car.purchasePrice - bestExpenses;
            return profit > bestProfit ? sale : best;
          }, monthlySales[0])
        : null;

    const monthlyTrend = monthlyTrendResults.map((monthSales, i) => {
      const { monthStart } = monthRanges[i];
      const revenue = monthSales.reduce((s, sale) => s + sale.salePrice, 0);
      const profit = monthSales.reduce((s, sale) => {
        const expenses = sale.car.expenses.reduce((es, e) => es + e.amount, 0);
        return s + (sale.salePrice - sale.car.purchasePrice - expenses);
      }, 0);
      return {
        month: monthStart.toLocaleString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        sales: monthSales.length,
        revenue,
        profit,
      };
    });

    return NextResponse.json({
      totalCarsInStock: carsInStock.length,
      inventoryValue,
      carsByStatus: carsByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      thisMonth: {
        salesCount: monthlySales.length,
        revenue: monthlyRevenue,
        profit: monthlyProfit,
      },
      alerts: {
        oldInventory: oldInventoryCount,
        followUpsToday,
        lowStock: carsInStock.length < 5,
      },
      quickStats: {
        avgDaysToSell: Math.round(avgDaysToSell),
        avgProfit: Math.round(avgProfit),
        bestSellingMake: bestSellingEntry
          ? { make: bestSellingEntry[0], count: bestSellingEntry[1] }
          : null,
        mostProfitableSale: mostProfitableSale
          ? {
              car: `${mostProfitableSale.car.make} ${mostProfitableSale.car.model}`,
              profit:
                mostProfitableSale.salePrice -
                mostProfitableSale.car.purchasePrice -
                mostProfitableSale.car.expenses.reduce(
                  (s, e) => s + e.amount,
                  0,
                ),
            }
          : null,
      },
      monthlyTrend,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
