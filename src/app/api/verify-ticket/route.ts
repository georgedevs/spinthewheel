// app/api/verify-ticket/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

const TEST_CODES = ['TEST123', 'DEMO456', 'SPIN789']; // Add test codes here

export async function POST(request: Request) {
  try {
    const { ticketCode } = await request.json();

    // Accept test codes in development
    if (process.env.NODE_ENV === 'development' && TEST_CODES.includes(ticketCode)) {
      return NextResponse.json({ valid: true });
    }

    // Normal ticket verification logic
    const ticket = await prisma.ticket.findUnique({
      where: { code: ticketCode },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Invalid ticket code' },
        { status: 400 }
      );
    }

    if (ticket.hasSpun) {
      return NextResponse.json(
        { error: 'Ticket has already been used' },
        { status: 400 }
      );
    }

    // Get current spin count
    const spinCount = await prisma.spinCount.findFirst();
    if (!spinCount) {
      return NextResponse.json(
        { error: 'System error' },
        { status: 500 }
      );
    }

    // Check if we've reached the spin limit
    if (spinCount.totalSpins >= 256000) {
      return NextResponse.json(
        { error: 'Promotion has ended' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}