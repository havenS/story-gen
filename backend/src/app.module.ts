import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StoriesModule } from './stories/stories.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LLMModule } from './llm/llm.module';
import { MediaModule } from './media/media.module';
import { ConfigurationService } from './config/configuration.service';
import { GenApiModule } from './gen_api/gen_api.module';
import { TypesModule } from './types/types.module';
import { PublishingModule } from './publishing/publishing.module';
import { YoutubeModule } from './youtube/youtube.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    StoriesModule,
    ChaptersModule,
    LLMModule,
    MediaModule,
    GenApiModule,
    TypesModule,
    PublishingModule,
    YoutubeModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ConfigurationService],
})
export class AppModule {}
