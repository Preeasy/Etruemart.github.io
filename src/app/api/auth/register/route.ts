import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateReferralCode } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role = 'USER' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Email and password are required' } },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_EXISTS', message: 'User already exists' } },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role: role.toUpperCase() as 'USER' | 'MERCHANT' | 'ADMIN',
        referralCode,
      },
    });

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}