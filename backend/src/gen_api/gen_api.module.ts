import { Module } from '@nestjs/common';
import { GenApiService } from './gen_api.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  providers: [GenApiService],
  exports: [GenApiService],
})
export class GenApiModule {}
