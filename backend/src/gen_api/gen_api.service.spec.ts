import { Test, TestingModule } from '@nestjs/testing';
import { GenApiService } from './gen_api.service';

describe('GenApiService', () => {
  let service: GenApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenApiService],
    }).compile();

    service = module.get<GenApiService>(GenApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
