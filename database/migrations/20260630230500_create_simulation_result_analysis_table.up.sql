CREATE TABLE IF NOT EXISTS "simulation_result_analysis" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "simulationResultId" VARCHAR(36) NOT NULL,
    "redFlag" VARCHAR(100) NOT NULL,
    "explanation" TEXT NOT NULL,
    "displayOrder" SMALLINT NOT NULL DEFAULT 1,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS "idx_simulation_result_analysis_id" ON "simulation_result_analysis" ("id");

ALTER TABLE "simulation_result_analysis" ADD CONSTRAINT "fk_simulation_results_simulationResultId" FOREIGN KEY ("simulationResultId") REFERENCES "simulation_results"("id") ON DELETE CASCADE;