// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { Prisma, ExpenseType } from '@prisma/client';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { expenseSchema } from '@/lib/validations';
// import { handleApiError } from '@/lib/error-handler';

// // helper function
// function isValidExpenseType(type: string): type is ExpenseType {
//   return Object.values(ExpenseType).includes(type as ExpenseType);
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const carId = searchParams.get('carId');
//     const typeParam = searchParams.get('type'); // ✅ Renamed
//     const startDate = searchParams.get('startDate');
//     const endDate = searchParams.get('endDate');

//     const where: Prisma.ExpenseWhereInput = {};

//     if (carId) where.carId = carId;

//     // Validate type before assigning
//     if (typeParam && isValidExpenseType(typeParam)) {
//       where.type = typeParam;
//     }

//     if (startDate || endDate) {
//       where.date = {};
//       if (startDate) where.date.gte = new Date(startDate);
//       if (endDate) where.date.lte = new Date(endDate);
//     }

//     const expenses = await prisma.expense.findMany({
//       where,
//       include: {
//         car: {
//           select: {
//             id: true,
//             make: true,
//             model: true,
//             year: true,
//             licensePlate: true,
//           },
//         },
//         user: { select: { name: true } },
//       },
//       orderBy: { date: 'desc' },
//     });

//     return NextResponse.json(expenses);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     if (session.user.role === 'VIEWER') {
//       return NextResponse.json(
//         { error: 'Insufficient permissions' },
//         { status: 403 },
//       );
//     }

//     const body = await request.json();
//     const validated = expenseSchema.parse(body);

//     const expense = await prisma.expense.create({
//       data: {
//         ...validated,
//         date: new Date(validated.date),
//         userId: session.user.id,
//       },
//       include: {
//         car: { select: { make: true, model: true, year: true } },
//         user: { select: { name: true } },
//       },
//     });

//     return NextResponse.json(expense, { status: 201 });
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, ExpenseType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { expenseSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/error-handler';

// helper function
function isValidExpenseType(type: string): type is ExpenseType {
  return Object.values(ExpenseType).includes(type as ExpenseType);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');
    const typeParam = searchParams.get('type'); // ✅ Renamed
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Prisma.ExpenseWhereInput = {};

    if (carId) where.carId = carId;

    // Validate type before assigning
    if (typeParam && isValidExpenseType(typeParam)) {
      where.type = typeParam;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
          },
        },
        user: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
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
    const validated = expenseSchema.parse(body);

    // Verify userId references a real User to avoid FK constraint error
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    const resolvedUserId = userExists ? session.user.id : null;

    const expense = await prisma.expense.create({
      data: {
        ...validated,
        date: new Date(validated.date),
        userId: resolvedUserId,
      },
      include: {
        car: { select: { make: true, model: true, year: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
