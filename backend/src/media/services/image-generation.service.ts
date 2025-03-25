import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigurationService } from '../../config/configuration.service';
import {
  ImageGenerationRequest,
  ThumbnailGenerationRequest,
  MediaGenerationResponse,
} from '../types/media.types';

@Injectable()
export class ImageGenerationService {
  private readonly logger = new Logger(ImageGenerationService.name);

  constructor(private readonly configService: ConfigurationService) {}

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<MediaGenerationResponse> {
    try {
      const response = await axios.post(
        `${this.configService.getGenApiUrl()}/generate-image`,
        request,
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      return {
        success: true,
        data: Buffer.from(response.data, 'binary'),
      };
    } catch (error) {
      this.logger.error(`Failed to generate image: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateThumbnail(
    request: ThumbnailGenerationRequest,
  ): Promise<MediaGenerationResponse> {
    try {
      const formData = new FormData();
      formData.append('brand', request.brand);
      formData.append('title', request.title);
      formData.append('type', request.type);
      formData.append('filename', request.filename);
      formData.append('image', request.image);

      const response = await axios.post(
        `${this.configService.getGenApiUrl()}/generate-thumbnail`,
        formData,
        {
          responseType: 'arraybuffer',
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      return {
        success: true,
        data: Buffer.from(response.data, 'binary'),
      };
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
