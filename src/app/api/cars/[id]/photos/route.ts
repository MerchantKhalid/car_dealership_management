import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === 'VIEWER') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { url, isMain } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // If setting as main, unset existing main photo
    if (isMain) {
      await prisma.carPhoto.updateMany({
        where: { carId: params.id, isMain: true },
        data: { isMain: false },
      });

      await prisma.car.update({
        where: { id: params.id },
        data: { mainPhoto: url },
      });
    }

    const photo = await prisma.carPhoto.create({
      data: {
        carId: params.id,
        url,
        isMain: isMain || false,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error adding photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
