import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
    try {
        const searches = await prisma.search.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        return NextResponse.json(searches, { status: 200 });
    } catch (error: unknown) {
        console.error("Error fetching search history:", error);
        return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
    }
} 