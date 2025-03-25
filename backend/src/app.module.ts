import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StoriesModule } from './stories/stories.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LLMModule } from './llm/llm.module';
import { MediaModule } from './media/media.module';
import { ConfigurationService } from './config/configuration.service';

@Module({
  imports: [
    PrismaModule,
    StoriesModule,
    ChaptersModule,
    LLMModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigurationService],
})
export class AppModule {}
