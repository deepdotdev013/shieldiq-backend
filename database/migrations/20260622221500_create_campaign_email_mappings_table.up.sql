CREATE TABLE IF NOT EXISTS "campaign_email_mappings" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "campaignId" VARCHAR(36) NOT NULL,
    "campaignEmailId" VARCHAR(36) NOT NULL,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,

    CREATE INDEX IF NOT EXISTS "idx_campaign_email_mappings_id" ON "campaign_email_mappings" ("id"),
);

ALTER TABLE "campaign_email_mappings" ADD CONSTRAINT "fk_campaign_email_mappings_campaignId" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE;
ALTER TABLE "campaign_email_mappings" ADD CONSTRAINT "fk_campaign_email_mappings_campaignEmailId" FOREIGN KEY ("campaignEmailId") REFERENCES "campaign_emails"("id") ON DELETE CASCADE;