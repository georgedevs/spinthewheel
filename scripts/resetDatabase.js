// scripts/resetDatabase.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    await prisma.prize.deleteMany();
    await prisma.spinCount.deleteMany();
    await prisma.ticket.deleteMany();

    console.log('All data has been cleared');

    await prisma.spinCount.create({
      data: {
        totalSpins: 0,
        millionContestants: 0,
        rangeMillionCounts: JSON.stringify({
          '1-100': 0,
          '101-1000': 0,
          '1001-2000': 0,
          '2001-5000': 0,
          '5001-10000': 0,
          '10001-50000': 0,
          '50001-256000': 0
        })
      }
    });

    console.log('SpinCount reinitialized');
    console.log('Database reset completed successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();