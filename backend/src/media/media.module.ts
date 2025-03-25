import { Module } from '@nestjs/common';
import { FileSystemService } from './services/file-system.service';
import { ImageGenerationService } from './services/image-generation.service';
import { VideoGenerationService } from './services/video-generation.service';
import { AudioGenerationService } from './services/audio-generation.service';
import { ConfigurationService } from '../config/configuration.service';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [LLMModule],
  providers: [
    FileSystemService,
    ImageGenerationService,
    VideoGenerationService,
    AudioGenerationService,
    ConfigurationService,
  ],
  exports: [
    FileSystemService,
    ImageGenerationService,
    VideoGenerationService,
    AudioGenerationService,
  ],
})
export class MediaModule {}
