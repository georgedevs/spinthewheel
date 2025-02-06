// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.prize.deleteMany();
  await prisma.spinCount.deleteMany();
  await prisma.ticket.deleteMany();

  console.log('Cleared existing data');

  // Initialize SpinCount
  const spinCount = await prisma.spinCount.create({
    data: {
      totalSpins: 0,
      millionContestants: 0,
      rangeMillionCounts: JSON.stringify({
        '1-100': 0,      // Max 4
        '101-1000': 0,   // Max 2
        '1001-2000': 0,  // Max 2
        '2001-5000': 0,  // Max 2
        '5001-10000': 0, // Max 2
        '10001-50000': 0,// Max 2
        '50001-256000': 0// Max 2
      })
    }
  });

  console.log('Initialized spin count:', spinCount);

  // Define prize ranges and their allocations with exact numbers
  const ranges = [
    { start: 1, end: 100, gifts: 10 },       // First 100 players
    { start: 101, end: 1000, gifts: 10 },    // Next 900 players
    { start: 1001, end: 2000, gifts: 8 },    // Next 1,000 players
    { start: 2001, end: 5000, gifts: 7 },    // Next 3,000 players
    { start: 5001, end: 10000, gifts: 5 },   // Next 5,000 players
    { start: 10001, end: 50000, gifts: 5 },  // Next 40,000 players
    { start: 50001, end: 256000, gifts: 5 }, // Remaining players
  ];

  // Initialize prizes for each range
  for (const range of ranges) {
    console.log(`Processing range ${range.start}-${range.end}`);
    
    // Special handling for the first range (includes ₦1,000,000 prize)
    if (range.start === 1) {
      await prisma.prize.create({
        data: {
          name: '₦1,000,000',
          totalCount: 1,
          remaining: 1,
          rangeStart: range.start,
          rangeEnd: range.end,
        },
      });
      console.log('Created ₦1,000,000 prize for first range');
    }

    // Calculate remaining gifts for other prizes
    const remainingGifts = range.start === 1 ? range.gifts - 1 : range.gifts;

    // Define distribution for other prizes
    const regularPrizes = [
      { name: '₦100,000', weight: 1 },
      { name: '₦50,000', weight: 1 },
      { name: '₦20,000', weight: 1 },
      { name: 'Phone', weight: 1 },
      { name: 'Artifact Hoodie', weight: 1 },
      { name: 'Premiere Invite', weight: 1 },
    ];

    // Calculate total weight
    const totalWeight = regularPrizes.reduce((sum, prize) => sum + prize.weight, 0);
    
    // Distribute gifts based on weights
    for (const prize of regularPrizes) {
      const prizeCount = Math.max(1, Math.floor((prize.weight / totalWeight) * remainingGifts));
      
      await prisma.prize.create({
        data: {
          name: prize.name,
          totalCount: prizeCount,
          remaining: prizeCount,
          rangeStart: range.start,
          rangeEnd: range.end,
        },
      });
      console.log(`Created ${prizeCount} ${prize.name} prizes for range ${range.start}-${range.end}`);
    }
  }

  // Create test tickets
  const testCodes = [
    'TEST123', 'DEMO456', 'SPIN789', 
    'BETA001', 'BETA002', 'BETA003', 'BETA004', 'BETA005',
    'TESTER01', 'TESTER02', 'TESTER03', 'TESTER04', 'TESTER05',
    'QA0001', 'QA0002', 'QA0003', 'QA0004', 'QA0005',
    'TRIAL01', 'TRIAL02', 'TRIAL03', 'TRIAL04', 'TRIAL05',
  ];
  for (const code of testCodes) {
    await prisma.ticket.create({
      data: {
        code,
        hasSpun: false,
      },
    });
    console.log(`Created test ticket: ${code}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });