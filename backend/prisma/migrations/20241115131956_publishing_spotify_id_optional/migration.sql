-- AlterTable
ALTER TABLE "publishing" ALTER COLUMN "spotify_id" DROP NOT NULL,
ALTER COLUMN "patreon_published" SET DEFAULT false;
