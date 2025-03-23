/*
  Warnings:

  - You are about to drop the column `background_image` on the `chapters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "background_image";

-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "background_image" VARCHAR;
