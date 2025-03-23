import { Module } from '@nestjs/common';
import { LLMModule } from 'src/llm/llm.module';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';

@Module({
  providers: [YoutubeService],
  exports: [YoutubeService],
  imports: [LLMModule],
  controllers: [YoutubeController],
})
export class YoutubeModule { }
