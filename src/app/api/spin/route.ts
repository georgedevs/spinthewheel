// app/api/spin/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { determineSpinResult } from '../../../../utils/prizeUtils';

const TEST_CODES = ['TEST123', 'DEMO456', 'SPIN789'];

// Define test prize distribution with million contestant probability
const TEST_PRIZE_DISTRIBUTION = [
  { prize: '₦1,000,000', isMillionContestant: true, probability: 0.01 },  // 1% chance
  { prize: '₦100,000', isMillionContestant: false, probability: 0.04 },   // 4% chance
  { prize: '₦50,000', isMillionContestant: false, probability: 0.05 },    // 5% chance
  { prize: '₦20,000', isMillionContestant: false, probability: 0.05 },    // 5% chance
  { prize: 'Phone', isMillionContestant: false, probability: 0.05 },      // 5% chance
  { prize: 'Artifact Hoodie', isMillionContestant: false, probability: 0.05 }, // 5% chance
  { prize: 'Premiere Invite', isMillionContestant: false, probability: 0.05 }, // 5% chance
  { prize: 'Try Again', isMillionContestant: false, probability: 0.70 }   // 70% chance
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
      const result = TEST_PRIZE_DISTRIBUTION.find(({ probability }) => {
        cumulativeProbability += probability;
        return random < cumulativeProbability;
      }) || { prize: 'Try Again', isMillionContestant: false, probability: 0 };

      return NextResponse.json({ 
        prize: result.prize,
        isMillionContestant: result.isMillionContestant,
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
      
      // Determine prize and million contestant status
      const spinResult = await determineSpinResult(newSpinNumber);

      // Update ticket and spin count atomically
      await Promise.all([
        tx.ticket.update({
          where: { code: ticketCode },
          data: {
            hasSpun: true,
            spinResult: spinResult.prize,
            spinNumber: newSpinNumber,
            isMillionContestant: spinResult.isMillionContestant
          },
        }),
        tx.spinCount.update({
          where: { id: spinCount.id },
          data: { totalSpins: newSpinNumber },
        })
      ]);

      return { 
        prize: spinResult.prize,
        isMillionContestant: spinResult.isMillionContestant,
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