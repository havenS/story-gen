-- AlterTable
ALTER TABLE "publishing" ADD COLUMN     "instagram_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiktok_published" BOOLEAN NOT NULL DEFAULT false;
