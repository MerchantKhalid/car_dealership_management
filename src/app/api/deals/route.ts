// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { z } from 'zod';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { handleApiError } from '@/lib/error-handler';

// const dealSchema = z.object({
//   customerId: z.string().min(1, 'Customer is required'),
//   carId: z.string().min(1, 'Car is required'),
//   handlerId: z.string().optional().nullable(),
//   agreedPrice: z.coerce.number().min(0, 'Agreed price must be positive'),
//   depositAmount: z.coerce.number().min(0).default(0),
//   depositDate: z.string().optional().nullable(),
//   depositPaidBy: z.string().optional().nullable(),
//   paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
//   paymentStatus: z
//     .enum(['PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL'])
//     .default('PENDING'),
//   expectedFinalPaymentDate: z.string().optional().nullable(),
//   notes: z.string().optional().nullable(),
//   // Installments (optional, used when paymentMethod = PAYMENT_PLAN)
//   installments: z
//     .array(
//       z.object({
//         installmentNumber: z.number().int().min(1),
//         amount: z.coerce.number().min(0),
//         dueDate: z.string().min(1),
//         notes: z.string().optional().nullable(),
//       }),
//     )
//     .optional(),
// });

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const customerId = searchParams.get('customerId');

//     const where = customerId ? { customerId } : {};

//     const deals = await prisma.deal.findMany({
//       where,
//       include: {
//         customer: true,
//         car: {
//           include: {
//             photos: { where: { isMain: true }, take: 1 },
//           },
//         },
//         handler: { select: { id: true, name: true } },
//         installments: { orderBy: { installmentNumber: 'asc' } },
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json(deals);
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
//     const validated = dealSchema.parse(body);

//     const { installments, ...dealData } = validated;

//     // Check if a deal already exists for this customer
//     const existing = await prisma.deal.findUnique({
//       where: { customerId: validated.customerId },
//     });
//     if (existing) {
//       return NextResponse.json(
//         {
//           error:
//             'A deal already exists for this customer. Please edit the existing deal.',
//         },
//         { status: 409 },
//       );
//     }

//     const deal = await prisma.deal.create({
//       data: {
//         ...dealData,
//         depositDate: dealData.depositDate
//           ? new Date(dealData.depositDate)
//           : null,
//         expectedFinalPaymentDate: dealData.expectedFinalPaymentDate
//           ? new Date(dealData.expectedFinalPaymentDate)
//           : null,
//         installments: installments?.length
//           ? {
//               create: installments.map((inst) => ({
//                 installmentNumber: inst.installmentNumber,
//                 amount: inst.amount,
//                 dueDate: new Date(inst.dueDate),
//                 notes: inst.notes ?? null,
//                 status: 'PENDING',
//               })),
//             }
//           : undefined,
//       },
//       include: {
//         customer: true,
//         car: { include: { photos: { where: { isMain: true }, take: 1 } } },
//         handler: { select: { id: true, name: true } },
//         installments: { orderBy: { installmentNumber: 'asc' } },
//       },
//     });

//     return NextResponse.json(deal, { status: 201 });
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/error-handler';

const dealSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  carId: z.string().min(1, 'Car is required'),
  handlerId: z.string().optional().nullable(),
  agreedPrice: z.coerce.number().min(0, 'Agreed price must be positive'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN']),
  paymentStatus: z
    .enum(['PENDING', 'DEPOSIT_PAID', 'PARTIALLY_PAID', 'PAID_IN_FULL'])
    .default('PENDING'),
  expectedFinalPaymentDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  // Optional first payment entry on creation
  initialPayment: z
    .object({
      amount: z.coerce.number().min(0),
      paidDate: z.string().min(1),
      method: z
        .enum(['CASH', 'BANK_TRANSFER', 'MB_WAY', 'CHECK', 'OTHER'])
        .default('CASH'),
      reference: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // Optional installment schedule
  installments: z
    .array(
      z.object({
        installmentNumber: z.number().int().min(1),
        amount: z.coerce.number().min(0),
        dueDate: z.string().min(1),
        notes: z.string().optional().nullable(),
      }),
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const where = customerId ? { customerId } : {};

    const deals = await prisma.deal.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        car: {
          include: { photos: { where: { isMain: true }, take: 1 } },
        },
        handler: { select: { id: true, name: true, phone: true } },
        installments: { orderBy: { installmentNumber: 'asc' } },
        payments: {
          include: {
            recorder: { select: { id: true, name: true } },
          },
          orderBy: { paidDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deals);
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
    const validated = dealSchema.parse(body);
    const { initialPayment, installments, ...dealData } = validated;

    const existing = await prisma.deal.findUnique({
      where: { customerId: validated.customerId },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A deal already exists for this customer.' },
        { status: 409 },
      );
    }

    const deal = await prisma.deal.create({
      data: {
        ...dealData,
        expectedFinalPaymentDate: dealData.expectedFinalPaymentDate
          ? new Date(dealData.expectedFinalPaymentDate)
          : null,
        payments: initialPayment
          ? {
              create: {
                amount: initialPayment.amount,
                paidDate: new Date(initialPayment.paidDate),
                method: initialPayment.method,
                reference: initialPayment.reference ?? null,
                notes: initialPayment.notes ?? null,
                recordedBy: session.user.id ?? null,
              },
            }
          : undefined,
        installments: installments?.length
          ? {
              create: installments.map((inst) => ({
                installmentNumber: inst.installmentNumber,
                amount: inst.amount,
                dueDate: new Date(inst.dueDate),
                notes: inst.notes ?? null,
                status: 'PENDING' as const,
              })),
            }
          : undefined,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        car: { include: { photos: { where: { isMain: true }, take: 1 } } },
        handler: { select: { id: true, name: true, phone: true } },
        installments: { orderBy: { installmentNumber: 'asc' } },
        payments: {
          include: { recorder: { select: { id: true, name: true } } },
          orderBy: { paidDate: 'asc' },
        },
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
