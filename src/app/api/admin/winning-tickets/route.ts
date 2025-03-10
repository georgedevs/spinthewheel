
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET() {
  try {
    const winningTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          {
            hasSpun: true,
            spinResult: {
              not: 'Try Again'
            }
          },
          {
            isMillionContestant: true
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        code: true,
        spinResult: true,
        spinNumber: true,
        createdAt: true,
        isMillionContestant: true  // Added this
      }
    });

    return NextResponse.json(winningTickets);
  } catch (error) {
    console.error('Error fetching winning tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winning tickets' },
      { status: 500 }
    );
  }
}

