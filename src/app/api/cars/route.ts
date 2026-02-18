import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, CarStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { carSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/error-handler';

// Helper function to validate CarStatus
function isValidCarStatus(status: string): status is CarStatus {
  return Object.values(CarStatus).includes(status as CarStatus);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const make = searchParams.get('make');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Type-safe where clause
    const where: Prisma.CarWhereInput = {};

    // Validate and assign status if valid
    if (statusParam && isValidCarStatus(statusParam)) {
      where.status = statusParam;
    }

    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.targetPrice = {};
      if (minPrice) where.targetPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.targetPrice.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        include: {
          photos: true,
          expenses: true,
          sale: {
            include: { customer: true },
          },
          _count: {
            select: {
              customers: true,
              testDrives: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    // Hide purchase prices from SALESPERSON role
    const processedCars = cars.map((car) => {
      const totalExpenses = car.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );
      return {
        ...car,
        totalExpenses,
        purchasePrice:
          session.user.role === 'SALESPERSON' ? undefined : car.purchasePrice,
      };
    });

    return NextResponse.json({
      cars: processedCars,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

    if (session.user.role === 'VIEWER' || session.user.role === 'MECHANIC') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = carSchema.parse(body);

    const car = await prisma.car.create({
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

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    // Custom error message for car-specific unique constraint
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'A car with this VIN or license plate already exists' },
        { status: 400 },
      );
    }

    return handleApiError(error);
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { Prisma, CarStatus } from '@prisma/client';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { carSchema } from '@/lib/validations';
// import { handleApiError } from '@/lib/error-handler';

// function isValidCarStatus(status: string): status is CarStatus {
//   return Object.values(CarStatus).includes(status as CarStatus);
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const statusParam = searchParams.get('status');
//     const make = searchParams.get('make');
//     const search = searchParams.get('search');
//     const minPrice = searchParams.get('minPrice');
//     const maxPrice = searchParams.get('maxPrice');
//     const sortBy = searchParams.get('sortBy') || 'createdAt';
//     const sortOrder = searchParams.get('sortOrder') || 'desc';
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

//     const where: Prisma.CarWhereInput = {};

//     if (statusParam && isValidCarStatus(statusParam)) {
//       where.status = statusParam;
//     }

//     if (make) where.make = { contains: make, mode: 'insensitive' };
//     if (minPrice || maxPrice) {
//       where.targetPrice = {};
//       if (minPrice) where.targetPrice.gte = parseFloat(minPrice);
//       if (maxPrice) where.targetPrice.lte = parseFloat(maxPrice);
//     }
//     if (search) {
//       where.OR = [
//         { make: { contains: search, mode: 'insensitive' } },
//         { model: { contains: search, mode: 'insensitive' } },
//         { vin: { contains: search, mode: 'insensitive' } },
//         { licensePlate: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     const [cars, total] = await Promise.all([
//       prisma.car.findMany({
//         where,
//         include: {
//           photos: true,
//           expenses: true,
//           sale: {
//             include: { customer: true },
//           },
//           _count: {
//             select: {
//               customers: true,
//               testDrives: true,
//             },
//           },
//         },
//         orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
//         skip: (page - 1) * limit,
//         take: limit,
//       }),
//       prisma.car.count({ where }),
//     ]);

//     const processedCars = cars.map((car) => {
//       const totalExpenses = car.expenses.reduce(
//         (sum, exp) => sum + exp.amount,
//         0,
//       );
//       return {
//         ...car,
//         totalExpenses,
//         purchasePrice:
//           session.user.role === 'SALESPERSON' ? undefined : car.purchasePrice,
//       };
//     });

//     return NextResponse.json(
//       {
//         cars: processedCars,
//         total,
//         page,
//         totalPages: Math.ceil(total / limit),
//       },
//       {
//         headers: {
//           'Cache-Control':
//             'private, max-age=0, s-maxage=30, stale-while-revalidate=15',
//         },
//       },
//     );
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

//     if (session.user.role === 'VIEWER' || session.user.role === 'MECHANIC') {
//       return NextResponse.json(
//         { error: 'Insufficient permissions' },
//         { status: 403 },
//       );
//     }

//     const body = await request.json();
//     const validated = carSchema.parse(body);

//     const car = await prisma.car.create({
//       data: {
//         ...validated,
//         purchaseDate: new Date(validated.purchaseDate),
//         minimumPrice: validated.minimumPrice || null,
//       },
//       include: {
//         photos: true,
//         expenses: true,
//       },
//     });

//     return NextResponse.json(car, { status: 201 });
//   } catch (error) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === 'P2002'
//     ) {
//       return NextResponse.json(
//         { error: 'A car with this VIN or license plate already exists' },
//         { status: 400 },
//       );
//     }
//     return handleApiError(error);
//   }
// }
