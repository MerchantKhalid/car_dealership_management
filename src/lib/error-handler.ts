import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// ============================================================================
// BACKEND ERROR HANDLING (API Routes)
// ============================================================================

export function handleApiError(error: unknown) {
  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  // Prisma unique constraint errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[] | undefined;
      const fields = target?.join(', ') || 'fields';
      return NextResponse.json(
        { error: `A record with this ${fields} already exists` },
        { status: 400 },
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Foreign key constraint failed' },
        { status: 400 },
      );
    }
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      { error: 'Invalid data provided' },
      { status: 400 },
    );
  }

  // Generic errors
  if (error instanceof Error) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

// ============================================================================
// FRONTEND ERROR HANDLING (Client Components)
// ============================================================================

/**
 * Extracts user-friendly error message from various error types
 * Use this in client components with toast notifications
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  // Handle API error responses
  if (error && typeof error === 'object' && 'error' in error) {
    const err = error as { error: string };
    if (typeof err.error === 'string') return err.error;
  }

  return 'An unexpected error occurred';
}

/**
 * Logs error with optional context
 */
export function logError(error: unknown, context?: string): void {
  if (context) {
    console.error(`Error in ${context}:`, error);
  } else {
    console.error('Error:', error);
  }
}

/**
 * Combines logging and message extraction
 * Use both logging and user message
 */
export function handleClientError(error: unknown, context?: string): string {
  logError(error, context);
  return getErrorMessage(error);
}
