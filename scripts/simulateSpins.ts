// scripts/simulateFirst100.ts
import { PrismaClient } from '@prisma/client';
import { determineSpinResult } from '../utils/prizeUtils';

const prisma = new PrismaClient();

// Helper function to add delay and retry logic
async function retry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('All retries failed');
}

async function simulateFirst100() {
  console.log('\n=== Starting First 100 Spins Simulation ===\n');

  // Statistics tracking
  const stats = {
    totalSpins: 0,
    millionContestants: 0,
    regularPrizes: 0,
    tryAgain: 0,
    prizeBreakdown: {} as Record<string, number>
  };

  // Create and process 100 spins
  for (let i = 1; i <= 100; i++) {
    try {
      const ticketCode = `SIM${i.toString().padStart(3, '0')}`;
      
      // Create ticket with retry logic
      await retry(async () => {
        await prisma.ticket.create({
          data: {
            code: ticketCode,
            hasSpun: false,
            isMillionContestant: false
          }
        });
      });

      // Determine spin result with retry logic
      const result = await retry(async () => {
        return await determineSpinResult(i);
      });

      // Update ticket with retry logic
      await retry(async () => {
        await prisma.ticket.update({
          where: { code: ticketCode },
          data: {
            hasSpun: true,
            spinResult: result.prize,
            spinNumber: i,
            isMillionContestant: result.isMillionContestant
          }
        });
      });

      // Update statistics
      stats.totalSpins++;
      if (result.isMillionContestant) {
        stats.millionContestants++;
      }
      if (result.prize === 'Try Again') {
        stats.tryAgain++;
      } else {
        stats.regularPrizes++;
      }
      stats.prizeBreakdown[result.prize] = (stats.prizeBreakdown[result.prize] || 0) + 1;

      // Log each spin result with timestamp
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] Spin ${i.toString().padStart(3, ' ')}: ${ticketCode} - ${result.prize}${result.isMillionContestant ? ' (Million Contestant!)' : ''}`);

      // Add a small delay between spins to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing spin ${i}:`, error);
      // Wait for a second before continuing to next spin
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Print detailed statistics
  console.log('\n=== Final Statistics ===\n');
  console.log(`Total Spins: ${stats.totalSpins}`);
  console.log(`Million Naira Contestants: ${stats.millionContestants} (Target: 4)`);
  console.log(`Regular Prizes Won: ${stats.regularPrizes} (Target: 10)`);
  console.log(`Try Again Results: ${stats.tryAgain}`);
  
  console.log('\nPrize Breakdown:');
  Object.entries(stats.prizeBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([prize, count]) => {
      console.log(`${prize.padEnd(20)}: ${count}`);
    });

  // Check remaining prizes in database with retry logic
  console.log('\nRemaining Prizes in Range 1-100:');
  const remainingPrizes = await retry(async () => {
    return await prisma.prize.findMany({
      where: {
        rangeStart: 1,
        rangeEnd: 100,
        remaining: { gt: 0 }
      }
    });
  });

  remainingPrizes.forEach(prize => {
    console.log(`${prize.name.padEnd(20)}: ${prize.remaining}/${prize.totalCount}`);
  });

  // Check million contestant count in database with retry logic
  const spinCount = await retry(async () => {
    return await prisma.spinCount.findFirst();
  });

  console.log('\nMillion Contestant Tracking:');
  if (spinCount && spinCount.rangeMillionCounts) {
    const rangeCounts = JSON.parse(spinCount.rangeMillionCounts as string);
    console.log(`Range 1-100: ${rangeCounts['1-100']}/4 contestants`);
    console.log(`Total Million Contestants: ${spinCount.millionContestants}`);
  }

  // Database connection status
  console.log('\nDatabase Status: Connected');
}


Promise.race([
  simulateFirst100(),
])
.catch(error => {
  console.error('Simulation failed:', error);
  process.exit(1);
})
.finally(async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
});