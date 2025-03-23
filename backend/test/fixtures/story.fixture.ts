export const testTypeData = {
  name: 'Test Story Type',
  story_prompt: 'Create a test story',
  chapter_prompt: 'Create a test chapter',
  image_prompt: 'Create a test image',
  sound_prompt: 'Create test sound',
  youtube_channel_id: 'test_channel',
  youtube_playlist_id: 'test_playlist'
};

export const expectedStoryResponse = {
  name: 'Test Story',
  synopsis: 'Test Synopsis',
  chapters: [
    {
      title: 'Chapter 1',
      summary: 'Summary 1',
      content: 'Content 1'
    },
    {
      title: 'Chapter 2',
      summary: 'Summary 2',
      content: 'Content 2'
    },
    {
      title: 'Chapter 3',
      summary: 'Summary 3',
      content: 'Content 3'
    }
  ]
};

export const expectedMediaResponse = {
  videoUrl: 'https://example.com/video.mp4',
  audioUrl: 'https://example.com/audio.mp3',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  chapters: [
    {
      videoUrl: 'https://example.com/chapter1.mp4',
      audioUrl: 'https://example.com/chapter1.mp3'
    },
    {
      videoUrl: 'https://example.com/chapter2.mp4',
      audioUrl: 'https://example.com/chapter2.mp3'
    },
    {
      videoUrl: 'https://example.com/chapter3.mp4',
      audioUrl: 'https://example.com/chapter3.mp3'
    }
  ]
}; 