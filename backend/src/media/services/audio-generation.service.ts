import { Injectable, Logger } from '@nestjs/common';
import * as extractAudio from 'ffmpeg-extract-audio';

@Injectable()
export class AudioGenerationService {
  private readonly logger = new Logger(AudioGenerationService.name);

  async extractAudioFromVideo(
    videoPath: string,
    audioPath: string,
  ): Promise<boolean> {
    try {
      await extractAudio({
        input: videoPath,
        output: audioPath,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to extract audio from video: ${error.message}`);
      return false;
    }
  }
}
