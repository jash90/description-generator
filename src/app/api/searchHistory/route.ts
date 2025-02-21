import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { NextRequest } from 'next/server';

// Simple in-memory cache
// For production, consider Redis or another persistent store.
const eanCache: Record<
    string,
    { data: any[]; expiration: number }
> = {};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache time
const LATEST_HISTORY_KEY = "latestHistory";

function isCacheValid(cacheEntry: { data: any[]; expiration: number }): boolean {
    return cacheEntry && cacheEntry.expiration > Date.now();
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ean = searchParams.get("ean");

        // If ean is provided, use it as a cache key
        if (ean && ean.trim()) {
            const cacheKey = `ean:${ean.trim()}`;

            // Check if we have a valid cache hit
            if (eanCache[cacheKey] && isCacheValid(eanCache[cacheKey])) {
                return NextResponse.json(eanCache[cacheKey].data, { status: 200 });
            }

            // Otherwise, fetch from DB
            const searches = await prisma.search.findMany({
                where: { ean: ean.trim() },
                orderBy: { createdAt: 'desc' },
            });

            // Store to cache
            eanCache[cacheKey] = {
                data: searches,
                expiration: Date.now() + CACHE_TTL_MS,
            };

            return NextResponse.json(searches, { status: 200 });
        } else {
            // No EAN provided: return the last 5 items (with caching)
            if (eanCache[LATEST_HISTORY_KEY] && isCacheValid(eanCache[LATEST_HISTORY_KEY])) {
                return NextResponse.json(eanCache[LATEST_HISTORY_KEY].data, { status: 200 });
            }

            const searches = await prisma.search.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            // Update cache
            eanCache[LATEST_HISTORY_KEY] = {
                data: searches,
                expiration: Date.now() + CACHE_TTL_MS,
            };

            return NextResponse.json(searches, { status: 200 });
        }
    } catch (error: unknown) {
        console.error("Error fetching search history:", error);
        return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 });
    }
} 