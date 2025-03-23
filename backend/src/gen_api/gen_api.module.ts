import { Module } from '@nestjs/common';
import { GenApiService } from './gen_api.service';

@Module({
  providers: [GenApiService],
  exports: [GenApiService]
})
export class GenApiModule { }
