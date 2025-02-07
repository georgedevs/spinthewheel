// app/api/register-ticket/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


const API_SECRET_KEY = process.env.API_SECRET_KEY;

export async function POST(request: Request) {
  try {
    // Verify API key from headers
    const authHeader = request.headers.get('x-api-key');
    if (!authHeader || authHeader !== API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get ticket data from request body
    const { tickets } = await request.json();

    // Validate request body
    if (!tickets || !Array.isArray(tickets)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected array of ticket codes.' },
        { status: 400 }
      );
    }

    // Validate each ticket code
    for (const code of tickets) {
      if (typeof code !== 'string' || code.length < 3) {
        return NextResponse.json(
          { error: 'Invalid ticket code format' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate tickets
    const existingTickets = await prisma.ticket.findMany({
      where: {
        code: {
          in: tickets
        }
      },
      select: {
        code: true
      }
    });

    if (existingTickets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Duplicate tickets found',
          duplicates: existingTickets.map(t => t.code)
        },
        { status: 400 }
      );
    }

    // Create tickets in database
    const createdTickets = await prisma.ticket.createMany({
      data: tickets.map(code => ({
        code,
        hasSpun: false,
        isMillionContestant: false
      })),
      skipDuplicates: true 
    });

    return NextResponse.json({
      success: true,
      created: createdTickets.count
    });

  } catch (error) {
    console.error('Error registering tickets:', error);
    return NextResponse.json(
      { error: 'Failed to register tickets' },
      { status: 500 }
    );
  }
}