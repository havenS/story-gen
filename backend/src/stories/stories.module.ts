import { Module } from '@nestjs/common';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LLMModule } from 'src/llm/llm.module';
import { GenApiModule } from 'src/gen_api/gen_api.module';
import { TypesModule } from 'src/types/types.module';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService],
  imports: [PrismaModule, LLMModule, GenApiModule, TypesModule],
  exports: [StoriesService],
})
export class StoriesModule {}
