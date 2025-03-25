export interface ImageGenerationRequest {
  prompt: string;
  filename: string;
  width?: number;
  height?: number;
}

export interface ThumbnailGenerationRequest {
  brand: string;
  title: string;
  type: string;
  filename: string;
  image: Blob;
}

export interface ChapterGenerationRequest {
  title: string;
  chapter: string;
  content: string;
  filename: string;
  background_sound: string;
  background_image: Blob;
}

export interface StoryGenerationRequest {
  title: string;
  filename: string;
  type: string;
  chapter_1: Blob;
  chapter_2: Blob;
  chapter_3: Blob;
}

export interface ShortGenerationRequest {
  background_image: Blob;
  filename: string;
  text: string;
  type: string;
}

export interface MediaGenerationResponse {
  success: boolean;
  error?: string;
  data?: Buffer;
}
