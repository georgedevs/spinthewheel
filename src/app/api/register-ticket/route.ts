// app/api/register-ticket/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Secret key for API authentication
const API_SECRET = process.env.API_SECRET;

export async function POST(request: Request) {
  try {
    // Verify API secret
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== API_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    if (!body.tickets || !Array.isArray(body.tickets)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of ticket codes' },
        { status: 400 }
      );
    }

    // Validate each ticket code
    for (const code of body.tickets) {
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
          in: body.tickets
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
    const createdTickets = await prisma.$transaction(
      body.tickets.map((code: any) => 
        prisma.ticket.create({
          data: {
            code: code,
            hasSpun: false,
            isMillionContestant: false
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Successfully registered ${createdTickets.length} tickets`,
      tickets: createdTickets.map(t => ({
        code: t.code,
        spinUrl: `https://wheelspin.vercel.app/?ticket=${t.code}`
      }))
    });

  } catch (error) {
    console.error('Error registering tickets:', error);
    return NextResponse.json(
      { error: 'Failed to register tickets' },
      { status: 500 }
    );
  }
}