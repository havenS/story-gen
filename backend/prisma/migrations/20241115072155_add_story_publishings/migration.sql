-- AddForeignKey
ALTER TABLE "publishing" ADD CONSTRAINT "id" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
