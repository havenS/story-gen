export interface TypeDto {
  id?: number;
  name: string;
  story_prompt: string;
  chapter_prompt: string;
  image_prompt: string;
  sound_prompt: string;
  created_at?: string;
  updated_at?: string;
}

export interface PublishingDto {
  id?: number;
  story_id?: number;
  youtube_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoryDto {
  id?: number;
  type_id?: number;
  name: string;
  title: string;
  synopsis: string;
  content: string;
  audio_url?: string;
  background_image?: string;
  image_prompt?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  publishings?: PublishingDto[];
}

export interface StoriesByPublishStatus {
  published: StoryDto[];
  unpublished: StoryDto[];
} 