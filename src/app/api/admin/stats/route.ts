import { NextResponse } from "next/server";

import { prisma } from "../../../../../lib/prisma";

export async function GET() {
    try {
      const spinCount = await prisma.spinCount.findFirst();
      
      if (!spinCount) {
        throw new Error('Spin count not found');
      }
  
      const stats = {
        totalSpins: spinCount.totalSpins,
        millionWon: spinCount.millionWon,
        remainingSpins: 256000 - spinCount.totalSpins
      };
  
      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stats' },
        { status: 500 }
      );
    }
  }