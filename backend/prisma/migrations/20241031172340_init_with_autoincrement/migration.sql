-- CreateTable
CREATE TABLE "chapters" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "background_image" VARCHAR NOT NULL,
    "background_sound" VARCHAR NOT NULL,
    "audio_url" VARCHAR NOT NULL,
    "video_url" VARCHAR NOT NULL,
    "stories_id" INTEGER NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "synopsis" TEXT NOT NULL,
    "audio_url" VARCHAR NOT NULL,
    "video_url" VARCHAR NOT NULL,
    "types_id" INTEGER NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "story_prompt" TEXT NOT NULL,
    "chapter_prompt" TEXT NOT NULL,
    "image_prompt" TEXT NOT NULL,
    "sound_prompt" TEXT NOT NULL,

    CONSTRAINT "types_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "id" FOREIGN KEY ("stories_id") REFERENCES "stories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "id" FOREIGN KEY ("types_id") REFERENCES "types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
