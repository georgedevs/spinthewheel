// app/api/spin/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { determineSpinResult } from '../../../../utils/prizeUtils';


const TEST_CODES = ['TEST123', 'DEMO456', 'SPIN789'];

// Define all possible prizes and their test probabilities
const PRIZE_DISTRIBUTION = [
  { prize: '₦1,000,000', probability: 0.01 },    // 1% chance
  { prize: '₦100,000', probability: 0.04 },      // 4% chance
  { prize: '₦50,000', probability: 0.05 },       // 5% chance
  { prize: '₦20,000', probability: 0.05 },       // 5% chance
  { prize: 'Phone', probability: 0.05 },         // 5% chance
  { prize: 'Artifact Hoodie', probability: 0.05 }, // 5% chance
  { prize: 'Premiere Invite', probability: 0.05 }, // 5% chance
  { prize: 'Try Again', probability: 0.70 }      // 70% chance
] as const;

export async function POST(request: Request) {
  try {
    const { ticketCode } = await request.json();

    if (!ticketCode) {
      return NextResponse.json(
        { error: 'Ticket code is required' },
        { status: 400 }
      );
    }

    // Handle test codes in development
    if (process.env.NODE_ENV === 'development' && TEST_CODES.includes(ticketCode)) {
      const random = Math.random();
      let cumulativeProbability = 0;
      
      // Find the prize based on cumulative probability
      const prize = PRIZE_DISTRIBUTION.find(({ probability }) => {
        cumulativeProbability += probability;
        return random < cumulativeProbability;
      })?.prize || 'Try Again';

      return NextResponse.json({ 
        prize,
        spinNumber: Math.floor(Math.random() * 1000),
        test: true
      });
    }

    // Normal spin logic with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get spin count first to check if promotion is still active
      const spinCount = await tx.spinCount.findFirst();
      if (!spinCount) {
        throw new Error('System not initialized');
      }

      if (spinCount.totalSpins >= 256000) {
        throw new Error('Promotion has ended');
      }

      // Verify ticket
      const ticket = await tx.ticket.findUnique({
        where: { code: ticketCode },
      });

      if (!ticket) {
        throw new Error('Invalid ticket code');
      }

      if (ticket.hasSpun) {
        throw new Error('Ticket has already been used');
      }

      const newSpinNumber = spinCount.totalSpins + 1;
      const prize = await determineSpinResult(newSpinNumber);

      // Update ticket and spin count atomically
      await Promise.all([
        tx.ticket.update({
          where: { code: ticketCode },
          data: {
            hasSpun: true,
            spinResult: prize,
            spinNumber: newSpinNumber,
          },
        }),
        tx.spinCount.update({
          where: { id: spinCount.id },
          data: { totalSpins: newSpinNumber },
        })
      ]);

      return { 
        prize, 
        spinNumber: newSpinNumber,
        remainingSpins: 256000 - newSpinNumber 
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing spin:', error);
    
    // Return appropriate error messages
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    const status = [
      'Invalid ticket code',
      'Ticket has already been used',
      'Promotion has ended'
    ].includes(errorMessage) ? 400 : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}