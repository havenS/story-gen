import { Module } from '@nestjs/common';
import { PublishingController } from './publishing.controller';
import { PublishingService } from './publishing.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StoriesModule } from 'src/stories/stories.module';
import { YoutubeService } from 'src/youtube/youtube.service';
import { LLMModule } from 'src/llm/llm.module';

@Module({
  controllers: [PublishingController],
  providers: [PublishingService, YoutubeService],
  imports: [PrismaModule, StoriesModule, LLMModule],
})
export class PublishingModule {}
