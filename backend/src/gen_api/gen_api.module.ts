import { Module } from '@nestjs/common';
import { GenApiService } from './gen_api.service';
import { LLMModule } from 'src/llm/llm.module';

@Module({
  providers: [GenApiService],
  imports: [LLMModule],
  exports: [GenApiService]
})
export class GenApiModule { }
