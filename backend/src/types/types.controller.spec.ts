import { INestApplication } from '@nestjs/common';
import { TypesController } from './types.controller';
import { setupTestApp } from '../../test/utils/setup';

describe('TypesController', () => {
  let controller: TypesController;
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<TypesController>(TypesController);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
