-- CreateTable
CREATE TABLE "Pending" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "importance" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Pending_owner_idx" ON "Pending"("owner");

-- CreateIndex
CREATE INDEX "Pending_completed_idx" ON "Pending"("completed");
