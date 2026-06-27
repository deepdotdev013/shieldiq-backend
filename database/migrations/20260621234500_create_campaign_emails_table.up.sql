CREATE TABLE IF NOT EXISTS "campaign_emails" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "sender" VARCHAR(255) NOT NULL,
    "fromEmail" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "linkText" VARCHAR(255) NULL,
    "isPhishing" BOOLEAN NOT NULL DEFAULT FALSE,
    "isCreatedByAdmin" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,

    CREATE INDEX IF NOT EXISTS "idx_campaign_emails_id" ON "campaign_emails" ("id"),
);
