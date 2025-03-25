import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigurationService {
  private readonly config: Record<string, string>;

  constructor() {
    this.config = {
      genApiUrl: process.env.GEN_API_URL || 'http://localhost:3001',
      ollamaStoryInfoModel: process.env.OLLAMA_STORY_INFO_MODEL || 'llama2',
      publicDir: process.env.PUBLIC_DIR || 'public',
      generationDir: process.env.GENERATION_DIR || 'generation',
    };
  }

  get(key: keyof typeof this.config): string {
    const value = this.config[key];
    if (!value) {
      throw new Error(`Configuration key ${key} is not defined`);
    }
    return value;
  }

  getGenApiUrl(): string {
    return this.get('genApiUrl');
  }

  getOllamaStoryInfoModel(): string {
    return this.get('ollamaStoryInfoModel');
  }

  getPublicDir(): string {
    return this.get('publicDir');
  }

  getGenerationDir(): string {
    return this.get('generationDir');
  }
}
