import { INestApplication } from '@nestjs/common';
import { TypesController } from './types.controller';
import { TypesService } from './types.service';
import { setupTestApp } from '../../test/utils/setup';

describe('TypesController', () => {
  let controller: TypesController;
  let app: INestApplication;
  let typesService: TypesService;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<TypesController>(TypesController);
    typesService = app.get<TypesService>(TypesService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
