import { prisma } from "../lib/prisma";

interface PrizeRange {
  start: number;
  end: number;
  gifts: number;
  probability: number;
}

interface SpinCountType {
  id: string;
  totalSpins: number;
  millionContestants: number;
  rangeMillionCounts: string;
  createdAt: Date;
  updatedAt: Date;
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
  { name: '₦20,000', isSpecial: false },
  { name: 'Phone', isSpecial: false },
  { name: 'Artifact Hoodie', isSpecial: false },
  { name: '₦50,000', isSpecial: false },
  { name: 'Premiere Invite', isSpecial: false },
  { name: '₦100,000', isSpecial: false },
];

export async function determineSpinResult(spinNumber: number): Promise<{prize: string; isMillionContestant: boolean}> {
  try {
    // Get current spin count and million contestant status
    const spinCount = (await prisma.spinCount.findFirst()) as SpinCountType;
    if (!spinCount) throw new Error('Spin count not initialized');
    const rangeMillionCounts = JSON.parse(spinCount.rangeMillionCounts);

    // Find the current range
    const currentRange = PRIZE_RANGES.find(
      range => spinNumber >= range.start && spinNumber <= range.end
    );
    if (!currentRange) return { prize: 'Try Again', isMillionContestant: false };

    // Check if we can still select million naira contestants for this range
    const rangeKey = `${currentRange.start}-${currentRange.end}`;
    const maxContestants = currentRange.start === 1 ? 4 : 2;
    const currentContestants = rangeMillionCounts[rangeKey];

    // Calculate million naira probability
    let millionProbability = 0;
    if (currentContestants < maxContestants && spinCount.millionContestants < 16) {
      const remainingSpinsInRange = currentRange.end - spinNumber + 1;
      const remainingContestants = maxContestants - currentContestants;
      millionProbability = remainingContestants / remainingSpinsInRange;
    }

    // Determine if this spin selects a million naira contestant
    const isMillionContestant = Math.random() < millionProbability;
    if (isMillionContestant) {
      // Update contestant counts
      rangeMillionCounts[rangeKey]++;
      await prisma.spinCount.update({
        where: { id: spinCount.id },
        data: {
          millionContestants: spinCount.millionContestants + 1,
          rangeMillionCounts: JSON.stringify(rangeMillionCounts)
        }
      });
      return { prize: '₦1,000,000', isMillionContestant: true };
    }

    // Get remaining gifts for this range
    const remainingGifts = await prisma.prize.findMany({
      where: {
        rangeStart: currentRange.start,
        remaining: { gt: 0 }
      }
    });

    // If no gifts remaining in this range, return try again
    if (remainingGifts.length === 0) return { prize: 'Try Again', isMillionContestant: false };

    // Determine if this spin should win based on probability
    const willWin = Math.random() < currentRange.probability;
    if (!willWin) return { prize: 'Try Again', isMillionContestant: false };

    // If winning, select a prize
    const availablePrizes = PRIZES.filter(prize => {
      // Check if prize is still available in remainingGifts
      return remainingGifts.some(g => g.name === prize.name);
    });

    if (availablePrizes.length === 0) return { prize: 'Try Again', isMillionContestant: false };

    // Randomly select from available prizes
    const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];

    // Update prize counts
    await prisma.prize.updateMany({
      where: { name: selectedPrize.name, rangeStart: currentRange.start },
      data: { remaining: { decrement: 1 } }
    });

    return { prize: selectedPrize.name, isMillionContestant: false };
  } catch (error) {
    console.error('Error determining spin result:', error);
    return { prize: 'Try Again', isMillionContestant: false };
  }
}