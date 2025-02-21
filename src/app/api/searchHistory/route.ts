import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ean = searchParams.get("ean");

        let searches;

        if (ean && ean.trim()) {
            // Fetch searches filtered by EAN
            searches = await prisma.search.findMany({
                where: { ean: ean.trim() },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            // Fetch only the last 5 items if no EAN is provided
            searches = await prisma.search.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
            });
        }

        return NextResponse.json(searches, { status: 200 });
    } catch (error: unknown) {
        console.error("Error fetching search history:", error);
        return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
    }
} 