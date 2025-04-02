import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LLMModule } from 'src/llm/llm.module';
import { GenApiModule } from 'src/gen_api/gen_api.module';
import { TypesModule } from 'src/types/types.module';
import { MediaModule } from 'src/media/media.module';
import { ConfigurationService } from 'src/config/configuration.service';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, ConfigurationService],
  imports: [PrismaModule, LLMModule, GenApiModule, TypesModule, MediaModule],
  exports: [StoriesService],
})
export class StoriesModule {}
