// import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { z } from 'zod';
// import prisma from '@/lib/prisma';
// import { authOptions } from '@/lib/auth';
// import { handleApiError } from '@/lib/error-handler';

// const dealUpdateSchema = z.object({
//   handlerId: z.string().optional().nullable(),
//   agreedPrice: z.coerce.number().min(0).optional(),
//   depositAmount: z.coerce.number().min(0).optional(),
//   depositDate: z.string().optional().nullable(),
//   depositPaidBy: z.string().optional().nullable(),
//   paymentMethod: z
//     .enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN'])
//     .optional(),
//   paymentStatus: z.enum(['PENDING', 'DEPOSIT_PAID', 'PAID_IN_FULL']).optional(),
//   expectedFinalPaymentDate: z.string().optional().nullable(),
//   notes: z.string().optional().nullable(),
// });

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const deal = await prisma.deal.findUnique({
//       where: { id: params.id },
//       include: {
//         customer: true,
//         car: {
//           include: {
//             photos: true,
//           },
//         },
//         handler: { select: { id: true, name: true, phone: true } },
//         installments: { orderBy: { installmentNumber: 'asc' } },
//       },
//     });

//     if (!deal) {
//       return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
//     }

//     return NextResponse.json(deal);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
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
//     const validated = dealUpdateSchema.parse(body);

//     const deal = await prisma.deal.update({
//       where: { id: params.id },
//       data: {
//         ...validated,
//         depositDate: validated.depositDate
//           ? new Date(validated.depositDate)
//           : null,
//         expectedFinalPaymentDate: validated.expectedFinalPaymentDate
//           ? new Date(validated.expectedFinalPaymentDate)
//           : null,
//       },
//       include: {
//         customer: true,
//         car: { include: { photos: true } },
//         handler: { select: { id: true, name: true, phone: true } },
//         installments: { orderBy: { installmentNumber: 'asc' } },
//       },
//     });

//     return NextResponse.json(deal);
//   } catch (error) {
//     return handleApiError(error);
//   }
// }

// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } },
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== 'OWNER') {
//       return NextResponse.json(
//         { error: 'Only owners can delete deals' },
//         { status: 403 },
//       );
//     }

//     await prisma.deal.delete({ where: { id: params.id } });
//     return NextResponse.json({ message: 'Deal deleted successfully' });
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

const dealUpdateSchema = z.object({
  handlerId: z.string().optional().nullable(),
  agreedPrice: z.coerce.number().min(0).optional(),
  paymentMethod: z
    .enum(['CASH', 'BANK_TRANSFER', 'FINANCING', 'PAYMENT_PLAN'])
    .optional(),
  paymentStatus: z
    .enum(['PENDING', 'DEPOSIT_PAID', 'PARTIALLY_PAID', 'PAID_IN_FULL'])
    .optional(),
  expectedFinalPaymentDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        car: { include: { photos: true } },
        handler: { select: { id: true, name: true, phone: true } },
        installments: { orderBy: { installmentNumber: 'asc' } },
        payments: {
          include: { recorder: { select: { id: true, name: true } } },
          orderBy: { paidDate: 'asc' },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    return handleApiError(error);
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
    if (session.user.role === 'VIEWER' || session.user.role === 'MECHANIC') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validated = dealUpdateSchema.parse(body);

    const deal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        ...validated,
        expectedFinalPaymentDate: validated.expectedFinalPaymentDate
          ? new Date(validated.expectedFinalPaymentDate)
          : null,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        car: { include: { photos: true } },
        handler: { select: { id: true, name: true, phone: true } },
        installments: { orderBy: { installmentNumber: 'asc' } },
        payments: {
          include: { recorder: { select: { id: true, name: true } } },
          orderBy: { paidDate: 'asc' },
        },
      },
    });

    return NextResponse.json(deal);
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
        { error: 'Only owners can delete deals' },
        { status: 403 },
      );
    }

    await prisma.deal.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Deal deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
