import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { NextRequest } from 'next/server';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache time
const LATEST_HISTORY_KEY = "latestHistory";

// Helper function to determine if a cache entry is valid
function isCacheValid(expiration: Date): boolean {
    return expiration.getTime() > Date.now();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rawEan = searchParams.get("ean");
        const ean = rawEan?.trim() || null;

        // If an ean was provided:
        if (ean) {
            // Try retrieving from the EanCache table by ean
            const existingCache = await prisma.eanCache.findUnique({
                where: { ean },
            });

            if (existingCache && isCacheValid(existingCache.expiration)) {
                // Return the cached data if it hasn't expired
                return NextResponse.json(existingCache.data, { status: 200 });
            }

            // Otherwise, fetch fresh data from the 'search' table
            const searches = await prisma.search.findMany({
                where: { ean },
                orderBy: { createdAt: 'desc' },
            });

            // Upsert the cache entry
            await prisma.eanCache.upsert({
                where: { ean },
                update: {
                    data: searches,
                    expiration: new Date(Date.now() + CACHE_TTL_MS),
                },
                create: {
                    ean,
                    data: searches,
                    expiration: new Date(Date.now() + CACHE_TTL_MS),
                },
            });

            return NextResponse.json(searches, { status: 200 });
        } else {
            // No EAN provided: check the "latestHistory" cache
            const existingLatestCache = await prisma.eanCache.findUnique({
                where: { ean: LATEST_HISTORY_KEY },
            });

            if (existingLatestCache && isCacheValid(existingLatestCache.expiration)) {
                return NextResponse.json(existingLatestCache.data, { status: 200 });
            }

            // If no valid cache, fetch the last 5 items
            const searches = await prisma.search.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            // Upsert the "latestHistory" record in the EanCache table
            await prisma.eanCache.upsert({
                where: { ean: LATEST_HISTORY_KEY },
                update: {
                    data: searches,
                    expiration: new Date(Date.now() + CACHE_TTL_MS),
                },
                create: {
                    ean: LATEST_HISTORY_KEY,
                    data: searches,
                    expiration: new Date(Date.now() + CACHE_TTL_MS),
                },
            });

            return NextResponse.json(searches, { status: 200 });
        }
    } catch (error: unknown) {
        console.error("Error fetching search history:", error);
        return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
    }
} 