import { StoryDto } from "@/services/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useStoryMutations } from "@/hooks/use-story-mutations";
import { Step } from "./step";
import { CardImage } from "./card-image";

interface StoryCardProps {
  story: StoryDto;
}

function CreateStoryCard({ story }: StoryCardProps) {
  const {
    generateImageMutation,
    generateChaptersContentMutation,
    generateChaptersMediaMutation,
    generateStoryMediaMutation,
    publishToYoutubeMutation,
  } = useStoryMutations(story.id!, story.types_id);

  return (
    <Card className={cn(
      "w-full max-w-xl",
      "transition-all duration-200",
      "hover:shadow-lg hover:shadow-accent/5"
    )}>
      <CardHeader className="space-y-4">
        <CardImage
          src={story.thumbnail_url ?? story.background_image}
          videoUrl={story.video_url}
        />
        <div className="space-y-2">
          <CardTitle className="text-2xl">{story.name}</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {story.synopsis}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <Step title="Generate info" done={true} />
        <Step
          title="Generate image"
          canRetry
          done={story.background_image !== null}
          canProceed={!generateImageMutation.isPending}
          callMethod={() => generateImageMutation.mutate()}
          previousStepDone={true}
        />
        <Step
          title="Generate chapters content"
          done={story.chapters.every((chapter) => chapter.content !== null)}
          canProceed={!generateChaptersContentMutation.isPending}
          callMethod={() => generateChaptersContentMutation.mutate()}
          previousStepDone={story.background_image !== null}
        />
        <Step
          title="Generate chapters media"
          done={story.chapters.every((chapter) => chapter.audio_url !== null)}
          canProceed={!generateChaptersMediaMutation.isPending}
          callMethod={() => generateChaptersMediaMutation.mutate()}
          previousStepDone={story.chapters.every((chapter) => chapter.content !== null)}
        />
        <Step
          title="Generate full story media"
          done={story.audio_url !== null}
          canProceed={!generateStoryMediaMutation.isPending}
          callMethod={() => generateStoryMediaMutation.mutate()}
          previousStepDone={story.chapters.every((chapter) => chapter.audio_url !== null)}
        />
        <Step
          title="Publish to Youtube"
          done={
            story.publishings!.length > 0 &&
            story.publishings![0].youtube_id !== null
          }
          canProceed={!publishToYoutubeMutation.isPending}
          callMethod={() => publishToYoutubeMutation.mutate()}
          previousStepDone={story.audio_url !== null}
        />
      </CardContent>
    </Card>
  );
}

export default CreateStoryCard;
