-- AlterTable
ALTER TABLE "chapters" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "background_image" DROP NOT NULL,
ALTER COLUMN "background_sound" DROP NOT NULL,
ALTER COLUMN "audio_url" DROP NOT NULL,
ALTER COLUMN "video_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "stories" ALTER COLUMN "audio_url" DROP NOT NULL,
ALTER COLUMN "video_url" DROP NOT NULL;
