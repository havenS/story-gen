import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypesModule } from './types/types.module';
import { PrismaModule } from './prisma/prisma.module';
import { StoriesModule } from './stories/stories.module';
import { ChaptersService } from './chapters/chapters.service';
import { LLMModule } from './llm/llm.module';
import { GenApiModule } from './gen_api/gen_api.module';
import { join } from 'path';
import { PublishingModule } from './publishing/publishing.module';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
  imports: [
    StoriesModule,
    TypesModule,
    PrismaModule,
    LLMModule,
    GenApiModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
    PublishingModule,
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChaptersService],
})
export class AppModule { }
