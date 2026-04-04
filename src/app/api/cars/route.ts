// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { Prisma, CarStatus } from '@prisma/client';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { carSchema } from '@/lib/validations';
// import { handleApiError } from '@/lib/error-handler';

// // Helper function to validate CarStatus
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
//     const limit = parseInt(searchParams.get('limit') || '50');

//     // Type-safe where clause
//     const where: Prisma.CarWhereInput = {};

//     // Validate and assign status if valid
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

//     // Hide purchase prices from SALESPERSON role
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

//     return NextResponse.json({
//       cars: processedCars,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
//     });
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
//     // Custom error message for car-specific unique constraint
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

// // import { NextRequest, NextResponse } from 'next/server';
// // import { getServerSession } from 'next-auth';
// // import { Prisma, CarStatus } from '@prisma/client';
// // import prisma from '@/lib/prisma';
// // import { authOptions } from '@/lib/auth';
// // import { carSchema } from '@/lib/validations';
// // import { handleApiError } from '@/lib/error-handler';

// // function isValidCarStatus(status: string): status is CarStatus {
// //   return Object.values(CarStatus).includes(status as CarStatus);
// // }

// // export async function GET(request: NextRequest) {
// //   try {
// //     const session = await getServerSession(authOptions);
// //     if (!session) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const { searchParams } = new URL(request.url);
// //     const statusParam = searchParams.get('status');
// //     const make = searchParams.get('make');
// //     const search = searchParams.get('search');
// //     const minPrice = searchParams.get('minPrice');
// //     const maxPrice = searchParams.get('maxPrice');
// //     const sortBy = searchParams.get('sortBy') || 'createdAt';
// //     const sortOrder = searchParams.get('sortOrder') || 'desc';
// //     const page = parseInt(searchParams.get('page') || '1');
// //     const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

// //     const where: Prisma.CarWhereInput = {};

// //     if (statusParam && isValidCarStatus(statusParam)) {
// //       where.status = statusParam;
// //     }

// //     if (make) where.make = { contains: make, mode: 'insensitive' };
// //     if (minPrice || maxPrice) {
// //       where.targetPrice = {};
// //       if (minPrice) where.targetPrice.gte = parseFloat(minPrice);
// //       if (maxPrice) where.targetPrice.lte = parseFloat(maxPrice);
// //     }
// //     if (search) {
// //       where.OR = [
// //         { make: { contains: search, mode: 'insensitive' } },
// //         { model: { contains: search, mode: 'insensitive' } },
// //         { vin: { contains: search, mode: 'insensitive' } },
// //         { licensePlate: { contains: search, mode: 'insensitive' } },
// //       ];
// //     }

// //     const [cars, total] = await Promise.all([
// //       prisma.car.findMany({
// //         where,
// //         include: {
// //           photos: true,
// //           expenses: true,
// //           sale: {
// //             include: { customer: true },
// //           },
// //           _count: {
// //             select: {
// //               customers: true,
// //               testDrives: true,
// //             },
// //           },
// //         },
// //         orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
// //         skip: (page - 1) * limit,
// //         take: limit,
// //       }),
// //       prisma.car.count({ where }),
// //     ]);

// //     const processedCars = cars.map((car) => {
// //       const totalExpenses = car.expenses.reduce(
// //         (sum, exp) => sum + exp.amount,
// //         0,
// //       );
// //       return {
// //         ...car,
// //         totalExpenses,
// //         purchasePrice:
// //           session.user.role === 'SALESPERSON' ? undefined : car.purchasePrice,
// //       };
// //     });

// //     return NextResponse.json(
// //       {
// //         cars: processedCars,
// //         total,
// //         page,
// //         totalPages: Math.ceil(total / limit),
// //       },
// //       {
// //         headers: {
// //           'Cache-Control':
// //             'private, max-age=0, s-maxage=30, stale-while-revalidate=15',
// //         },
// //       },
// //     );
// //   } catch (error) {
// //     return handleApiError(error);
// //   }
// // }

// // export async function POST(request: NextRequest) {
// //   try {
// //     const session = await getServerSession(authOptions);
// //     if (!session) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     if (session.user.role === 'VIEWER' || session.user.role === 'MECHANIC') {
// //       return NextResponse.json(
// //         { error: 'Insufficient permissions' },
// //         { status: 403 },
// //       );
// //     }

// //     const body = await request.json();
// //     const validated = carSchema.parse(body);

// //     const car = await prisma.car.create({
// //       data: {
// //         ...validated,
// //         purchaseDate: new Date(validated.purchaseDate),
// //         minimumPrice: validated.minimumPrice || null,
// //       },
// //       include: {
// //         photos: true,
// //         expenses: true,
// //       },
// //     });

// //     return NextResponse.json(car, { status: 201 });
// //   } catch (error) {
// //     if (
// //       error instanceof Prisma.PrismaClientKnownRequestError &&
// //       error.code === 'P2002'
// //     ) {
// //       return NextResponse.json(
// //         { error: 'A car with this VIN or license plate already exists' },
// //         { status: 400 },
// //       );
// //     }
// //     return handleApiError(error);
// //   }
// // }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma, CarStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { carSchema } from '@/lib/validations';
import { handleApiError } from '@/lib/error-handler';

// ✅ GOOD — runtime enum check keeps TypeScript + Prisma in sync
function isValidCarStatus(status: string): status is CarStatus {
  return Object.values(CarStatus).includes(status as CarStatus);
}

// ✅ FIX 1 — Whitelist allowed sort fields to prevent injection via sortBy param
// BUG: original code did orderBy: { [sortBy]: sortOrder } where sortBy came
// directly from the user's query string — a user could pass any field name
// (even internal fields) and Prisma would accept it or throw an unhandled error.
const ALLOWED_SORT_FIELDS = [
  'createdAt',
  'make',
  'model',
  'year',
  'targetPrice',
  'mileage',
  'purchaseDate',
] as const;

type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

function isSafeSort(field: string): field is AllowedSortField {
  return ALLOWED_SORT_FIELDS.includes(field as AllowedSortField);
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
    const sortByParam = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');

    // ✅ FIX 2 — Cap the limit to 100 rows maximum
    // BUG: original code had a default of 50 but no upper cap. A user could
    // pass ?limit=99999 and load tens of thousands of rows into memory,
    // crashing or severely slowing your database and server.
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // ✅ FIX 1 applied — use safe, whitelisted sortBy
    const sortBy: AllowedSortField = isSafeSort(sortByParam)
      ? sortByParam
      : 'createdAt';

    // Validate sortOrder too — only 'asc' or 'desc' are valid
    const safeSortOrder: Prisma.SortOrder =
      sortOrder === 'asc' ? 'asc' : 'desc';

    const where: Prisma.CarWhereInput = {};

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
        // ✅ FIX 1 applied — sortBy is now a whitelisted safe value
        orderBy: { [sortBy]: safeSortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

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
