-- CreateTable
CREATE TABLE "EanCache" (
    "ean" TEXT NOT NULL PRIMARY KEY,
    "data" JSONB NOT NULL,
    "expiration" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
