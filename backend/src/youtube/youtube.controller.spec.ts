import { INestApplication } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { setupTestApp } from '../../test/utils/setup';

describe('YoutubeController', () => {
  let controller: YoutubeController;
  let app: INestApplication;
  let youtubeService: YoutubeService;

  beforeAll(async () => {
    app = await setupTestApp();
    controller = app.get<YoutubeController>(YoutubeController);
    youtubeService = app.get<YoutubeService>(YoutubeService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getYoutubeAuthUrl', () => {
    it('should return the auth URL', () => {
      const mockAuthUrl = 'http://test-auth-url';
      jest.spyOn(youtubeService, 'getAuthUrl').mockReturnValue(mockAuthUrl);

      const result = controller.getYoutubeAuthUrl();
      expect(result).toBe(mockAuthUrl);
    });
  });

  describe('youtubeLogout', () => {
    it('should logout successfully', async () => {
      jest.spyOn(youtubeService, 'logout').mockResolvedValue(undefined);

      const result = await controller.youtubeLogout();
      expect(result).toEqual({ message: 'Logout successful' });
    });

    it('should handle logout errors', async () => {
      const errorMessage = 'Logout failed';
      jest.spyOn(youtubeService, 'logout').mockRejectedValue(new Error(errorMessage));

      const result = await controller.youtubeLogout();
      expect(result).toEqual({ error: errorMessage });
    });
  });

  describe('youtubeAuthCallback', () => {
    it('should save token successfully', async () => {
      const code = 'test-auth-code';
      jest.spyOn(youtubeService, 'saveTokenFromCode').mockResolvedValue(undefined);

      const result = await controller.youtubeAuthCallback(code);
      expect(result).toEqual({ message: 'Token saved successfully' });
    });

    it('should handle missing code', async () => {
      const result = await controller.youtubeAuthCallback('');
      expect(result).toEqual({ error: 'Authorization code is missing' });
    });

    it('should handle save token errors', async () => {
      const code = 'test-auth-code';
      const errorMessage = 'Token save failed';
      jest.spyOn(youtubeService, 'saveTokenFromCode').mockRejectedValue(new Error(errorMessage));

      const result = await controller.youtubeAuthCallback(code);
      expect(result).toEqual({ error: errorMessage });
    });
  });
});
