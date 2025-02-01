import { prisma } from "../lib/prisma";


interface PrizeRange {
  start: number;
  end: number;
  gifts: number;
  probability: number;
}

const PRIZE_RANGES: PrizeRange[] = [
  { start: 1, end: 100, gifts: 10, probability: 0.1 }, // 1 in 10
  { start: 101, end: 1000, gifts: 10, probability: 0.0111 }, // 1 in 90
  { start: 1001, end: 2000, gifts: 8, probability: 0.008 }, // 1 in 125
  { start: 2001, end: 5000, gifts: 7, probability: 0.00233 }, // 1 in 428
  { start: 5001, end: 10000, gifts: 5, probability: 0.001 }, // 1 in 1000
  { start: 10001, end: 50000, gifts: 5, probability: 0.000125 }, // 1 in 8000
  { start: 50001, end: 256000, gifts: 5, probability: 0.0000243 }, // 1 in 41200
];

const PRIZES = [
  { name: '₦1,000,000', isSpecial: true },
  { name: '₦20,000', isSpecial: false },
  { name: 'Phone', isSpecial: false },
  { name: 'Artifact Hoodie', isSpecial: false },
  { name: '₦50,000', isSpecial: false },
  { name: 'Premiere Invite', isSpecial: false },
  { name: '₦100,000', isSpecial: false },
];

export async function determineSpinResult(spinNumber: number): Promise<string> {
  try {
    // Get current spin count and million naira status
    const spinCount = await prisma.spinCount.findFirst();
    if (!spinCount) throw new Error('Spin count not initialized');

    // Find the current range
    const currentRange = PRIZE_RANGES.find(
      range => spinNumber >= range.start && spinNumber <= range.end
    );
    if (!currentRange) return 'Try Again';

    // Get remaining gifts for this range
    const remainingGifts = await prisma.prize.findMany({
      where: {
        rangeStart: currentRange.start,
        remaining: { gt: 0 }
      }
    });

    // If no gifts remaining in this range, return try again
    if (remainingGifts.length === 0) return 'Try Again';

    // Determine if this spin should win based on probability
    const willWin = Math.random() < currentRange.probability;
    if (!willWin) return 'Try Again';

    // If winning, select a prize
    const availablePrizes = PRIZES.filter(prize => {
      // Filter out million if already won
      if (prize.isSpecial && spinCount.millionWon) return false;
      
      // Check if prize is still available in remainingGifts
      return remainingGifts.some(g => g.name === prize.name);
    });

    if (availablePrizes.length === 0) return 'Try Again';

    // Randomly select from available prizes
    const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    // Update prize counts
    await prisma.prize.updateMany({
      where: { name: selectedPrize.name, rangeStart: currentRange.start },
      data: { remaining: { decrement: 1 } }
    });

    // If million naira won, update status
    if (selectedPrize.name === '₦1,000,000') {
      await prisma.spinCount.update({
        where: { id: spinCount.id },
        data: { millionWon: true }
      });
    }

    return selectedPrize.name;
  } catch (error) {
    console.error('Error determining spin result:', error);
    return 'Try Again';
  }
}