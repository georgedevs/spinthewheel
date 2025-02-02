// scripts/resetDatabase.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Delete all records from all tables
    await prisma.prize.deleteMany();
    await prisma.spinCount.deleteMany();
    await prisma.ticket.deleteMany();

    console.log('All data has been cleared');

    // Re-initialize SpinCount
    await prisma.spinCount.create({
      data: {
        totalSpins: 0,
        millionWon: false,
      },
    });

    console.log('SpinCount reinitialized');
    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();