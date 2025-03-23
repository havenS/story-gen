import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeService } from './youtube.service';
import { LLMService } from 'src/llm/llm.service';

describe('YoutubeService', () => {
  let service: YoutubeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LLMService, YoutubeService],
    }).compile();

    service = module.get<YoutubeService>(YoutubeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
