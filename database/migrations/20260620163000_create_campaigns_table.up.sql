CREATE TABLE IF NOT EXISTS "campaigns" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "startDate" DATE NULL,
    "endDate" DATE NOT NULL,
    "targetDepartment" VARCHAR(50) NOT NULL,
    "emailType" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,

    CREATE INDEX IF NOT EXISTS "idx_campaigns_id" ON "campaigns" ("id"),
    CREATE INDEX IF NOT EXISTS "idx_campaigns_title" ON "campaigns" ("title"),
    CREATE INDEX IF NOT EXISTS "idx_campaigns_status" ON "campaigns" ("status"),
);