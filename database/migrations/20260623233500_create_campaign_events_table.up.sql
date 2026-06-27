CREATE TABLE IF NOT EXISTS "campaign_events" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "campaignId" VARCHAR(36) NOT NULL,
    "campaignEmailId" VARCHAR(36) NULL,
    "userId" VARCHAR(36) NOT NULL,
    "eventType" VARCHAR(36) NOT NULL,
    "scoreImpact" INT NOT NULL DEFAULT 0,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE,

    CREATE INDEX IF NOT EXISTS "idx_campaign_events_id" ON "campaign_events" ("id"),
);

ALTER TABLE "campaign_events" ADD CONSTRAINT "fk_campaign_events_campaignId" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE;
ALTER TABLE "campaign_events" ADD CONSTRAINT "fk_campaign_events_campaignEmailId" FOREIGN KEY ("campaignEmailId") REFERENCES "campaign_emails"("id") ON DELETE CASCADE;
ALTER TABLE "campaign_events" ADD CONSTRAINT "fk_campaign_events_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;