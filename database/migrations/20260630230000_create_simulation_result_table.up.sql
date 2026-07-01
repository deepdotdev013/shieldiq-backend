CREATE TABLE IF NOT EXISTS "simulation_results" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "campaignEmailId" VARCHAR(36) NOT NULL,
    "eventType" VARCHAR(36) NOT NULL,
    "lesson" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS "idx_simulation_results_id" ON "simulation_results" ("id");

ALTER TABLE "simulation_results" ADD CONSTRAINT "fk_simulation_results_campaignEmailId" FOREIGN KEY ("campaignEmailId") REFERENCES "campaign_emails"("id") ON DELETE CASCADE;