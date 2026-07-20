import { NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/shipping';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { country, weight, dimensions } = body;

    if (!country || !weight || !dimensions) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Missing required fields' } },
        { status: 400 }
      );
    }

    const quotes = calculateShipping(country, weight, dimensions);

    return NextResponse.json({ success: true, data: quotes });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}