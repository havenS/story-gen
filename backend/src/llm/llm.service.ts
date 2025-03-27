import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ChapterDto } from 'src/chapters/dto/chapter.dto';
import { StoryDto } from 'src/stories/dto/story.dto';
import { LLMMessageType } from './types/llm-message.type';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  async pingLLM() {
    const response = await axios.get(`${process.env.OLLAMA_HOST}`);
    return response.data;
  }

  async callLLM(
    model: string,
    method: string,
    json: boolean,
    temperature?: number,
    messages?: LLMMessageType[],
    seed?: number,
  ) {
    try {
      const data = {
        model,
        stream: false,
      };

      if (temperature) {
        data['temperature'] = temperature;
      }

      if (seed) {
        data['seed'] = seed;
      }

      if (json) {
        data['format'] = 'json';
      }

      if (method === 'chat') {
        data['messages'] = messages;
      } else if (method === 'generate') {
        data['prompt'] = messages[0].content;
      }

      const response = await axios.post(
        `${process.env.OLLAMA_HOST}/api/${method}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 360000000,
        },
      );

      if (!response.data) {
        this.logger.error('Empty response from LLM');
        throw new Error('Empty response from LLM');
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        'Error calling LLM:',
        error.response ? error.response.data : error.message,
      );
      throw new Error(
        'Failed to call LLM: ' +
          (error.response ? error.response.data : error.message),
      );
    }
  }

  async generateStoryInfo(model: string, prompt: string, history: StoryDto[]) {
    this.logger.log('Generating story info with model:', model);
    const firstItem = history.map(({ name }) => name).join(', ');
    const messages = [
      {
        role: 'user',
        content: `${prompt} > "Whispers" is forbidden in the title. You are not allowed to reuse these existing stories' titles or topics: ${firstItem}. Return a JSON object with the following structure: { "title": "string", "synopsis": "string", "chapterOneTitle": "string", "chapterOneSummary": "string" }`,
      },
    ] as LLMMessageType[];

    const call = await this.callLLM(
      model,
      'chat',
      true,
      0.2,
      messages,
      history.length,
    );

    if (!call?.message?.content) {
      this.logger.error('LLM response is empty');
      throw new Error('Failed to generate story info');
    }

    try {
      const storyInfo = JSON.parse(call.message.content);
      if (
        !storyInfo.title ||
        !storyInfo.synopsis ||
        !storyInfo.chapterOneTitle ||
        !storyInfo.chapterOneSummary
      ) {
        this.logger.error('Invalid story info format:', storyInfo);
        throw new Error('Invalid story info format');
      }
      return storyInfo;
    } catch (error) {
      this.logger.error('Error parsing story info:', error);
      throw new Error('Failed to parse story info');
    }
  }

  async generateStoryImagePrompt(model, title: string, synopsis: string) {
    const messages = [
      {
        role: 'user',
        content: `give me a very short, synthetic prompt to use in a text-to-image model like stable diffusion to illustrate the story. Limit to 49 tokens. for a story titled "${title}" with the synopsis being "${synopsis}". Give the prompt, straight, with nothing else.`,
      },
    ] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', false, 1, messages);

    if (call.message.content.split(' ').length > 25) {
      this.logger.warn(
        `Prompt too long, ${call.message.content.split(' ').length} tokens, retrying...`,
      );
      return this.generateStoryImagePrompt(model, title, synopsis);
    }
    return call.message.content;
  }

  async generateChapterContent(model, prompt: string, story: StoryDto) {
    const placeholders = {
      '[title]': story.name,
      '[synopsis]': story.synopsis,
      '[chapterOneTitle]': story.chapters[0].title,
      '[chapterOneSummary]': story.chapters[0].summary,
      '[chapterTwoTitle]': story.chapters[1].title,
      '[chapterTwoSummary]': story.chapters[1].summary,
      '[chapterThreeTitle]': story.chapters[2].title,
      '[chapterThreeSummary]': story.chapters[2].summary,
    };

    for (const key in placeholders) {
      prompt = prompt.replace(key, placeholders[key]);
    }

    const messages = [{ role: 'user', content: prompt }] as LLMMessageType[];

    const call = await this.callLLM(model, 'chat', false, 0, messages);
    const { content } = call.message;
    const regex = /\*\*(.+?)\*\*\s*([\s\S]+?)(?=\*\*|$)/g;

    return Array.from(content.matchAll(regex), (match) => match[2].trim());
  }

  async getChapterBackgroundSound(model, prompt: string, chapter: ChapterDto) {
    const completedPrompt = prompt.replace('[content]', chapter.summary);

    const messages = [
      { role: 'user', content: completedPrompt },
    ] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', true, 1, messages);

    return JSON.parse(call.message.content);
  }

  async generateYouTubeMetadata(model, story: Partial<StoryDto>) {
    // Récupérer les détails de l'histoire par ID
    const { name, synopsis } = story;

    // Générer les métadonnées YouTube via des appels séparés au LLM
    const youtubeTitle = await this.generateTitle(model, name, synopsis);
    const description = await this.generateDescription(model, name, synopsis);
    const tags = await this.generateTags(model, name, synopsis);

    return { title: youtubeTitle, description, tags };
  }

  private async generateTitle(
    model,
    title: string,
    synopsis: string,
  ): Promise<string> {
    const prompt = `Give a title prepend with 2 emojis representing a story titled "${title}". 

Here is the synopsis: "${synopsis}". 

1. The title is preceded by 1 or 2 emojis that represent the story's theme.
2. The title is short and catchy

Important: Give me only the emoji and the title, nothing else, and no " around.`;
    const messages = [{ role: 'user', content: prompt }] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', false, 0.8, messages);
    const { content } = call.message;

    const cleanedContent =
      content.startsWith('"') && content.endsWith('"')
        ? content.slice(1, -1)
        : content;

    return cleanedContent;
  }

  private async generateDescription(
    model,
    title: string,
    synopsis: string,
  ): Promise<string> {
    const prompt = `Write a short YouTube video description for a story titled "${title}". 

Here is the synopsis: "${synopsis}". 

Each chapter of the story builds suspense. The description should be engaging, provide a teaser of the storyline, and invite viewers to experience the entire narrative. Structure the description as follows:

1. Summary (2 sentences) of the storyline's mystery and supernatural events.
2. Call to action for viewers to watch and discover the full story.

Important: Give me only the description, nothing else, and no " around the description.`;
    const messages = [{ role: 'user', content: prompt }] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', false, 0.8, messages);
    const { content } = call.message;

    const cleanedContent =
      content.startsWith('"') && content.endsWith('"')
        ? content.slice(1, -1)
        : content;

    return cleanedContent;
  }

  private async generateTags(
    model,
    title: string,
    synopsis: string,
  ): Promise<string[]> {
    const prompt = `Suggest a list of 8-10 relevant YouTube tags for an audio novel titled "${title}", with the following storyline: "${synopsis}". 

The tags should relate to the topic of the storyline and should be optimized for reaching a wide audience interested in audio stories. Include popular keywords but avoid irrelevant tags.
The tag must enhance the visibility of the video in the suggested Youtube videos.

Give me only the best tags separated by commas, nothing else.`;
    const messages = [{ role: 'user', content: prompt }] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', false, 0.8, messages);

    return call.message.content.split(',').map((tag) => tag.trim());
  }

  async generateChapterExceptForShort(model, content: string): Promise<string> {
    const prompt = `You are a skilled editor and content strategist. Your task is to analyze the provided text and identify three consecutive sentences that are the most engaging, intriguing, or suspenseful. These sentences should spark curiosity and create a strong desire to click and watch the associated video.

Consider the following criteria when selecting the sentences:
	•	They should evoke strong emotions such as suspense, surprise, or excitement.
	•	They should hint at something unresolved or mysterious in the text, but without revealing too much.
	•	They should be compelling and standalone, making sense even without full context.

Input:

"${content}"

Output:

Provide only the selected sentences, without any additional explanations or tags. Make sure they are consecutive sentences that flow naturally from the chapter.

Important:
  •	Choose only three sentences.
  •	Do not include any additional content or formatting in the response.`;

    const messages = [{ role: 'user', content: prompt }] as LLMMessageType[];
    const call = await this.callLLM(model, 'chat', false, 0, messages);

    return call.message.content;
  }
}
