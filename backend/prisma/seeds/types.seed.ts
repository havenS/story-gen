import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTypes() {
   await prisma.types.createMany({
      data: [
         {
            name: 'Horror',
            story_prompt: `You are a skilled horror writer, known for creating unsettling, realistic stories that give readers chills without relying on overly supernatural elements. You’re tasked with creating a creepy, believable story outline in English for a tale that reads like a personal experience. Keep it subtle and grounded in reality, with mysterious but plausible occurrences. The goal is to make readers feel the events could happen to them, adding to the sense of dread.

Here is your story outline:
	•	Main Character: A 20-year-old woman
	• Content: A title, a synopsis, 3 chapters with for each one a title and a short summary

	Create a story divided into three chapters. Each chapter should end on a cliffhanger, except the last chapter, which should provide a haunting and memorable resolution.
	Avoid over-the-top supernatural elements, focusing instead on eerie descriptions, subtle suspense, and a realistic narrative style to make the story more unsettling and believable.
	The output **must only be in English**—responses in any other language will be considered invalid.
Please format your response in JSON and use "title", "synopsis", "chapterOneTitle", "chapterOneSummary", "chapterTwoTitle", "chapterTwoSummary", "chapterThreeTitle", "chapterThreeSummary" as attributes.`,
            chapter_prompt: `You are a talented author known for crafting captivating stories relating testimonies that resonate with readers.
Your writing style is engaging, atmospheric, and simple to read, making the most of rich descriptions and emotional depth while remaining accessible to a wide audience.
You write in the first person, recounting memories that allow readers to connect deeply with the narrator.

Your stories feature elements of the supernatural and suspense, creating unease and intrigue while incorporating horror, paranormal activities, and eerie phenomena.

Task:
Write a 3-chapter story, with each chapter containing between 700 and 1000 words.
Chapters must be formatted clearly and numbered exactly: Chapter One, Chapter Two, Chapter Three.
The first two chapters must end with a cliffhanger, while the final chapter provides a satisfying resolution to the story.
Any deviation from this format (e.g., fewer or more than 3 chapters, or chapters outside the word count range) renders the result invalid.

Story Details:
	•	Title: [title]
	•	Synopsis: [synopsis]
	•	Chapter One: [chapterOneSummary]
	•	Chapter Two: [chapterTwoSummary]
	•	Chapter Three: [chapterThreeSummary]

Output Format:
Use this exact structure for the output:
**Chapter One: TITLE**
CONTENT
**Chapter Two: TITLE**
CONTENT
**Chapter Three: TITLE**
CONTENT

Do not generate anything outside this format. Ensure that there are no additional chapters or summaries.`,
            image_prompt: 'Dark atmosphere, vintage noir comics aesthetic, eerie elements, dramatic shadows, faded colors, dark comicbooks|',
            sound_prompt: `This is a *creepy pasta* story. You need to choose from the following sound loops the one that best fits the atmosphere of the story. The sound will play as a background throughout the entire story. The chosen sound should enhance the eerie and unsettling atmosphere of the narrative.

### List of possible sound loops:
1. Forest at night ambiance (forest_night)
2. Eerie wind (eerie_wind)
3. Distant people (distant_people)
4. Distant thunderstorm and rain (distant_thunderstorm)
5. Abandoned basement ambiance (abandoned_basement)
6. Creaking old house (old_house_creaks)
7. Cave ambiance (cave_ambience)
8. Eerie background (eerie_background)
9. Creepy music box music (music_box)
10. Dense forest ambiance (deep_forest)
11. Desert wind (wind_desert)
12. Ominous crickets (ominous_crickets)
13. Countryside village by night (countryside_village_night)

### Story:
[content]

### Task:
- **Only** choose and return the best-fitting sound loop for this story from the list provided. 
- Please format your response in JSON and use "background_sound" as attributes.
- **Do not include any explanations, comments, encouragements, or additional text**—just the selected sound loop name.
- If any text besides the sound loop name is generated, the output will be considered invalid. 
- Your response must be exactly one word and contain only the name of the sound loop withou any special character.`,
            chapter_count: 3,
            word_count: 1000,
            youtube_channel_id: 'UCefA_F2t7JzwP7XXB_UxDGg',
            youtube_playlist_id: 'PLJffnTQK11ITm79MdbkX96YTxOoEUwdCA',
         },
         {
            name: 'Love',
            story_prompt: `You are a skilled horror writer, known for creating unsettling, realistic stories that give readers chills without relying on overly supernatural elements. You’re tasked with creating a creepy, believable story outline in English for a tale that reads like a personal experience. Keep it subtle and grounded in reality, with mysterious but plausible occurrences. The goal is to make readers feel the events could happen to them, adding to the sense of dread.

Here is your story outline:
	•	Main Character: A 20-year-old woman
	• Content: A title, a synopsis, 3 chapters with for each one a title and a short summary

	Create a story divided into three chapters. Each chapter should end on a cliffhanger, except the last chapter, which should provide a haunting and memorable resolution.
	Avoid over-the-top supernatural elements, focusing instead on eerie descriptions, subtle suspense, and a realistic narrative style to make the story more unsettling and believable.
	The output **must only be in English**—responses in any other language will be considered invalid.
Please format your response in JSON and use "title", "synopsis", "chapterOneTitle", "chapterOneSummary", "chapterTwoTitle", "chapterTwoSummary", "chapterThreeTitle", "chapterThreeSummary" as attributes.`,
            chapter_prompt: `You are a talented author known for crafting captivating stories relating testimonies that resonate with readers.
Your writing style is engaging, atmospheric, and simple to read, making the most of rich descriptions and emotional depth while remaining accessible to a wide audience.
You write in the first person, recounting memories that allow readers to connect deeply with the narrator.

Your stories feature elements of the supernatural and suspense, creating unease and intrigue while incorporating horror, paranormal activities, and eerie phenomena.

Task:
Write a 3-chapter story, with each chapter containing between 700 and 1000 words.
Chapters must be formatted clearly and numbered exactly: Chapter One, Chapter Two, Chapter Three.
The first two chapters must end with a cliffhanger, while the final chapter provides a satisfying resolution to the story.
Any deviation from this format (e.g., fewer or more than 3 chapters, or chapters outside the word count range) renders the result invalid.

Story Details:
	•	Title: [title]
	•	Synopsis: [synopsis]
	•	Chapter One: [chapterOneSummary]
	•	Chapter Two: [chapterTwoSummary]
	•	Chapter Three: [chapterThreeSummary]

Output Format:
Use this exact structure for the output:
**Chapter One: TITLE**
CONTENT
**Chapter Two: TITLE**
CONTENT
**Chapter Three: TITLE**
CONTENT

Do not generate anything outside this format. Ensure that there are no additional chapters or summaries.`,
            image_prompt: 'Dark atmosphere, vintage noir comics aesthetic, eerie elements, dramatic shadows, faded colors, dark comicbooks|',
            sound_prompt: `This is a *creepy pasta* story. You need to choose from the following sound loops the one that best fits the atmosphere of the story. The sound will play as a background throughout the entire story. The chosen sound should enhance the eerie and unsettling atmosphere of the narrative.

### List of possible sound loops:
1. Forest at night ambiance (forest_night)
2. Eerie wind (eerie_wind)
3. Distant people (distant_people)
4. Distant thunderstorm and rain (distant_thunderstorm)
5. Abandoned basement ambiance (abandoned_basement)
6. Creaking old house (old_house_creaks)
7. Cave ambiance (cave_ambience)
8. Eerie background (eerie_background)
9. Creepy music box music (music_box)
10. Dense forest ambiance (deep_forest)
11. Desert wind (wind_desert)
12. Ominous crickets (ominous_crickets)
13. Countryside village by night (countryside_village_night)

### Story:
[content]

### Task:
- **Only** choose and return the best-fitting sound loop for this story from the list provided. 
- Please format your response in JSON and use "background_sound" as attributes.
- **Do not include any explanations, comments, encouragements, or additional text**—just the selected sound loop name.
- If any text besides the sound loop name is generated, the output will be considered invalid. 
- Your response must be exactly one word and contain only the name of the sound loop withou any special character.`,
            youtube_channel_id: '',
            youtube_playlist_id: '',
            chapter_count: 3,
            word_count: 1000,
         },
      ],
   });
}