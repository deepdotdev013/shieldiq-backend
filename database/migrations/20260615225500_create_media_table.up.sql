CREATE TABLE IF NOT EXISTS "media" (
    "id" VARCHAR(36) PRIMARY KEY NOT NULL,
    "mediaUrl" VARCHAR(255) NOT NULL,
    "mediaType" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fullPath" VARCHAR(255) NOT NULL,
    "duration" DECIMAL(1000,2) NOT NULL DEFAULT 0,
    "createdAt" BIGINT NOT NULL DEFAULT 0,
    "createdBy" VARCHAR(36) NULL,
    "updatedAt" BIGINT NOT NULL DEFAULT 0,
    "updatedBy" VARCHAR(36) NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS "idx_media_id" ON "media" ("id");
ALTER TABLE "users" ADD CONSTRAINT "fk_users_profilePhotoId" FOREIGN KEY ("profilePhotoId") REFERENCES "media"("id");
