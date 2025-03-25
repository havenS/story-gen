import { Injectable, Logger } from '@nestjs/common';
import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';
import { StoryDto } from '../stories/dto/story.dto';
import { LLMService } from '../llm/llm.service';

@Injectable()
export class YoutubeService {
  private youtubeClient: youtube_v3.Youtube;
  private oauth2Client: OAuth2Client;
  private readonly logger = new Logger(YoutubeService.name);
  private readonly tokenPath = path.join(__dirname, '../../../token.json');
  private readonly clientSecretPath = path.join(
    __dirname,
    '../../../client_secret.json',
  );

  constructor(private readonly llmService: LLMService) {
    this.logger.log('Initializing YouTube Service with OAuth2');
    const credentials = JSON.parse(
      fs.readFileSync(this.clientSecretPath, 'utf-8'),
    );
    const { client_id, client_secret, redirect_uris } = credentials.web;

    // Initialisation du client OAuth2
    this.oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );

    // Initialisation du client YouTube
    this.youtubeClient = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
      timeout: 60000,
    });

    // Charger les tokens si disponibles
    this.loadToken();
  }

  async logout() {
    try {
      this.logger.log('Logging out');
      fs.writeFileSync(this.tokenPath, '');
      this.oauth2Client.revokeCredentials();
    } catch (error) {
      this.logger.error(`Error logging out: ${error.message}`);
      throw error;
    }
  }

  private loadToken() {
    if (this.tokenExists()) {
      this.logger.log('Loading existing token');
      const { access_token } = JSON.parse(
        fs.readFileSync(this.tokenPath, 'utf-8'),
      );
      this.oauth2Client.setCredentials({ access_token });
    } else {
      this.logger.warn('No token found, authorize the app first.');
    }
  }

  private tokenExists(): boolean {
    try {
      return !!fs.readFileSync(this.tokenPath, 'utf-8');
    } catch {
      return false;
    }
  }

  async saveTokenFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
      this.logger.log('Token saved successfully');
    } catch (error) {
      this.logger.error(`Error exchanging code for token: ${error.message}`);
      throw error;
    }
  }

  async uploadVideo(
    channelId: string,
    playlistId: string,
    videoPath: string,
    metadata: {
      title: string;
      description: string;
      tags: string[];
      thumbnail: string;
    },
    shortsPath: string[],
  ) {
    try {
      this.logger.log('Retrieving token');
      await this.loadToken();

      this.logger.log(`Uploading video: ${metadata.title} - ${videoPath}`);

      const publishHour = parseInt(
        process.env.YOUTUBE_DEFAULT_PUBLISH_HOUR,
        10,
      );
      const publishDate = new Date();
      publishDate.setHours(publishHour, 0, 0);

      const videoResponse = await this.youtubeClient.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: '1',
            channelId: channelId,
          },
          status: {
            privacyStatus: 'private', // Must be private to plan a publish date
            publishAt: publishDate.toISOString(),
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });

      // Add video to playlist
      await this.youtubeClient.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoResponse.data.id,
            },
          },
        },
      });
      this.logger.log(`Video added to playlist: ${playlistId}`);

      // Upload thumbnail
      if (metadata.thumbnail) {
        await this.youtubeClient.thumbnails.set({
          videoId: videoResponse.data.id,
          media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(metadata.thumbnail),
          },
        });
        this.logger.log(
          `Thumbnail uploaded successfully for video ID: ${videoResponse.data.id}`,
        );
      }

      await this.uploadShorts(
        videoResponse.data.id,
        shortsPath,
        {
          title: metadata.title,
          description: metadata.description,
          tags: ['short', ...metadata.tags],
        },
        publishHour,
      );

      this.logger.log(`Video uploaded successfully: ${videoResponse.data.id}`);
      return videoResponse.data;
    } catch (error) {
      this.logger.error(`Error uploading video: ${error.message}`);
      throw error;
    }
  }

  async uploadShorts(
    videoId: string,
    shortsPaths: string[],
    metadata: { title: string; description: string; tags: string[] },
    publishHour: number,
  ) {
    try {
      this.logger.log('Preparing to upload shorts');

      // Define scheduled publish times
      const publishIntervals = [0, 0, 0]; // in hours
      // const publishIntervals = [1, 2, 3]; // in hours
      const publishTimes: Date[] = publishIntervals.map((interval) => {
        const date = new Date();
        date.setHours(publishHour + interval);
        date.setMinutes(0);
        date.setSeconds(0);
        return date;
      });

      for (let i = 0; i < shortsPaths.length; i++) {
        const shortPath = shortsPaths[i];
        const publishTime = publishTimes[i];
        this.logger.log(
          `Uploading short: ${shortPath} scheduled at ${publishTime.toISOString()}`,
        );

        const shortResponse = await this.youtubeClient.videos.insert({
          part: ['snippet', 'status'],
          requestBody: {
            snippet: {
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags,
              categoryId: '24', // Entertainment
            },
            status: {
              privacyStatus: 'private', // Must be private to plan a publish date
              publishAt: publishTime.toISOString(),
            },
          },
          media: {
            body: fs.createReadStream(shortPath),
          },
        });

        this.logger.log(
          `Short uploaded successfully: ${shortResponse.data.id}`,
        );

        // Publish comment on the short
        // try {
        //   await this.commentOnVideo(shortResponse.data.id, `Discover the full story here: https://www.youtube.com/watch?v=${videoId}`);
        //   this.logger.log(`Comment added to short: ${shortResponse.data.id}`);
        // } catch (error) { }
      }
    } catch (error) {
      this.logger.error(`Error uploading shorts: ${error.message}`);
      throw error;
    }
  }

  async generateMetadata(story: Partial<StoryDto>, thumbnailPath: string) {
    try {
      if (!story.name || !story.synopsis) {
        throw new Error('Story is missing required fields (name or synopsis)');
      }

      const generatedStoryData = await this.llmService.generateYouTubeMetadata(
        process.env.OLLAMA_MARKETING_MODEL,
        story,
      );

      if (!generatedStoryData || !generatedStoryData.title || !generatedStoryData.description) {
        throw new Error('Failed to generate valid YouTube metadata');
      }

      return {
        title: generatedStoryData.title
          .replaceAll('\n', '')
          .replaceAll('"', ''),
        description: generatedStoryData.description,
        tags: generatedStoryData.tags || [],
        thumbnail: thumbnailPath,
      };
    } catch (error) {
      this.logger.error(`Error generating metadata: ${error.message}`);
      throw new Error(`Failed to generate YouTube metadata: ${error.message}`);
    }
  }

  getAuthUrl(): string {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.force-ssl',
      ],
    });
    return authUrl;
  }
}
