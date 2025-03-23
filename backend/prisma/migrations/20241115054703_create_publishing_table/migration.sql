-- CreateTable
CREATE TABLE "publishing" (
    "id" SERIAL NOT NULL,
    "story_id" INTEGER NOT NULL,
    "youtube_id" VARCHAR NOT NULL,
    "spotify_id" VARCHAR NOT NULL,
    "patreon_published" BOOLEAN NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "publishing_pkey" PRIMARY KEY ("id")
);
