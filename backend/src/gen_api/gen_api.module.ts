import { Module } from '@nestjs/common';
import { GenApiService } from './gen_api.service';
import { MediaModule } from '../media/media.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigurationService } from '../config/configuration.service';

@Module({
  imports: [MediaModule, ConfigModule],
  providers: [GenApiService, ConfigurationService],
  exports: [GenApiService],
})
export class GenApiModule {}
