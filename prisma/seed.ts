import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.prize.deleteMany();
  await prisma.spinCount.deleteMany();
  await prisma.ticket.deleteMany();

  console.log('Cleared existing data');

  // Initialize SpinCount with contestant tracking
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

  // Define prize ranges and their allocations
  const ranges = [
    { start: 1, end: 100, gifts: 10 },       // 10 gifts + 4 contestants
    { start: 101, end: 1000, gifts: 10 },    // 10 gifts + 2 contestants
    { start: 1001, end: 2000, gifts: 8 },    // 8 gifts + 2 contestants
    { start: 2001, end: 5000, gifts: 7 },    // 7 gifts + 2 contestants
    { start: 5001, end: 10000, gifts: 5 },   // 5 gifts + 2 contestants
    { start: 10001, end: 50000, gifts: 5 },  // 5 gifts + 2 contestants
    { start: 50001, end: 256000, gifts: 5 }, // 5 gifts + 2 contestants
  ];             // Total: 50 gifts + 16 contestants

  // Initialize prizes for each range
  for (const range of ranges) {
    console.log(`Processing range ${range.start}-${range.end}`);

    // For ranges with 5 gifts, distribute one of each prize type
    if (range.gifts === 5) {
      const prizes = [
        { name: '₦100,000', count: 1 },
        { name: '₦50,000', count: 1 },
        { name: '₦20,000', count: 1 },
        { name: 'Phone', count: 1 },
        { name: 'Artifact Hoodie', count: 1 }
      ];

      for (const prize of prizes) {
        await prisma.prize.create({
          data: {
            name: prize.name,
            totalCount: prize.count,
            remaining: prize.count,
            rangeStart: range.start,
            rangeEnd: range.end,
          },
        });
        console.log(`Created ${prize.count} ${prize.name} prize(s) for range ${range.start}-${range.end}`);
      }
    }
    // For range with 7 gifts
    else if (range.gifts === 7) {
      const prizes = [
        { name: '₦100,000', count: 2 },
        { name: '₦50,000', count: 2 },
        { name: '₦20,000', count: 1 },
        { name: 'Phone', count: 1 },
        { name: 'Artifact Hoodie', count: 1 }
      ];

      for (const prize of prizes) {
        await prisma.prize.create({
          data: {
            name: prize.name,
            totalCount: prize.count,
            remaining: prize.count,
            rangeStart: range.start,
            rangeEnd: range.end,
          },
        });
        console.log(`Created ${prize.count} ${prize.name} prize(s) for range ${range.start}-${range.end}`);
      }
    }
    // For range with 8 gifts
    else if (range.gifts === 8) {
      const prizes = [
        { name: '₦100,000', count: 2 },
        { name: '₦50,000', count: 2 },
        { name: '₦20,000', count: 2 },
        { name: 'Phone', count: 1 },
        { name: 'Artifact Hoodie', count: 1 }
      ];

      for (const prize of prizes) {
        await prisma.prize.create({
          data: {
            name: prize.name,
            totalCount: prize.count,
            remaining: prize.count,
            rangeStart: range.start,
            rangeEnd: range.end,
          },
        });
        console.log(`Created ${prize.count} ${prize.name} prize(s) for range ${range.start}-${range.end}`);
      }
    }
    // For ranges with 10 gifts
    else if (range.gifts === 10) {
      const prizes = [
        { name: '₦100,000', count: 2 },
        { name: '₦50,000', count: 2 },
        { name: '₦20,000', count: 2 },
        { name: 'Phone', count: 2 },
        { name: 'Artifact Hoodie', count: 1 },
        { name: 'Premiere Invite', count: 1 }
      ];

      for (const prize of prizes) {
        await prisma.prize.create({
          data: {
            name: prize.name,
            totalCount: prize.count,
            remaining: prize.count,
            rangeStart: range.start,
            rangeEnd: range.end,
          },
        });
        console.log(`Created ${prize.count} ${prize.name} prize(s) for range ${range.start}-${range.end}`);
      }
    }

    // After creating prizes for each range, verify the total
    const totalPrizesInRange = await prisma.prize.aggregate({
      where: {
        rangeStart: range.start,
        rangeEnd: range.end,
      },
      _sum: {
        totalCount: true,
      },
    });

    console.log(`Total gifts for range ${range.start}-${range.end}: ${totalPrizesInRange._sum.totalCount} (Target: ${range.gifts})`);
  }
// Create test tickets
const testCodes = [
  'TEST123', 'DEMO456', 'SPIN789', 
  'BETA001', 'BETA002', 'BETA003', 'BETA004', 'BETA005',
  'BETA006', 'BETA007', 'BETA008', 'BETA009', 'BETA010',
  'BETA011', 'BETA012', 'BETA013', 'BETA014', 'BETA015',
  'BETA016', 'BETA017', 'BETA018', 'BETA019', 'BETA020',
  'TESTER01', 'TESTER02', 'TESTER03', 'TESTER04', 'TESTER05',
  'TESTER06', 'TESTER07', 'TESTER08', 'TESTER09', 'TESTER10',
  'TESTER11', 'TESTER12', 'TESTER13', 'TESTER14', 'TESTER15',
  'QA0001', 'QA0002', 'QA0003', 'QA0004', 'QA0005',
  'QA0006', 'QA0007', 'QA0008', 'QA0009', 'QA0010',
  'QA0011', 'QA0012', 'QA0013', 'QA0014', 'QA0015',
  'TRIAL01', 'TRIAL02', 'TRIAL03', 'TRIAL04', 'TRIAL05',
  'TRIAL06', 'TRIAL07', 'TRIAL08', 'TRIAL09', 'TRIAL10',
  'ERROR01', 'ERROR02', 'ERROR03', 'ERROR04', 'ERROR05',
  'ERROR06', 'ERROR07', 'ERROR08', 'ERROR09', 'ERROR10',
  'GEORGE01', 'GEORGE02', 'GEORGE03', 'GEORGE04', 'GEORGE05',
  'GEORGE06', 'GEORGE07', 'GEORGE08', 'GEORGE09', 'GEORGE15',
  'GEORGE10', 'GEORGE11', 'GEORGE12', 'GEORGE13', 'GEORGE14',
  'ABCD01','ABCD02','ABCD03','ABCD04','ABCD05',
  'ABCD06','ABCD07','ABCD08','ABCD09','ABCD10',
  'ABCD11','ABCD12','ABCD13','ABCD14','ABCD15',
];

  for (const code of testCodes) {
    await prisma.ticket.create({
      data: {
        code,
        hasSpun: false,
        isMillionContestant: false
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