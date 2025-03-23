import { Controller, Get, Query } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) { }

  @Get('auth')
  getYoutubeAuthUrl() {
    const authUrl = this.youtubeService.getAuthUrl();
    return authUrl;
  }

  @Get('logout')
  async youtubeLogout() {
    try {
      await this.youtubeService.logout();
      return { message: 'Logout successful' };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('auth/callback')
  async youtubeAuthCallback(@Query('code') code: string) {
    try {
      if (!code) {
        throw new Error('Authorization code is missing');
      }
      await this.youtubeService.saveTokenFromCode(code);
      return { message: 'Token saved successfully' };
    } catch (error) {
      return { error: error.message };
    }
  }
}