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
import { CardImage } from "@/components/common/card-image";
import { Step } from "@/components/common/step";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface StoryCardProps {
  story: StoryDto;
}

function CreateStoryCard({ story }: StoryCardProps) {
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const queryClient = useQueryClient();
  const {
    generateImageMutation,
    generateChaptersContentMutation,
    generateChaptersMediaMutation,
    generateStoryMediaMutation,
    publishToYoutubeMutation,
    regenerateStoryNameMutation,
  } = useStoryMutations(story.id!, story.types_id);

  const handleRegenerateName = async () => {
    await regenerateStoryNameMutation.mutateAsync();
    setShowRegenerateDialog(false);
    await queryClient.invalidateQueries({ queryKey: ['stories'] });
  };

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
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl">{story.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowRegenerateDialog(true)}
              className="h-8 w-8"
              disabled={regenerateStoryNameMutation.isPending}
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                regenerateStoryNameMutation.isPending && "animate-spin"
              )} />
            </Button>
          </div>
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
          isPending={generateImageMutation.isPending}
        />
        <Step
          title="Generate chapters content"
          done={story.chapters.length > 0 && story.chapters.every((chapter) => chapter.content !== null)}
          canProceed={!generateChaptersContentMutation.isPending}
          callMethod={() => generateChaptersContentMutation.mutate()}
          previousStepDone={story.background_image !== null}
          isPending={generateChaptersContentMutation.isPending}
        />
        <Step
          title="Generate chapters media"
          done={story.chapters.length > 0 && story.chapters.every((chapter) => chapter!.audio_url !== null)}
          canProceed={!generateChaptersMediaMutation.isPending}
          callMethod={() => generateChaptersMediaMutation.mutate()}
          previousStepDone={story.chapters.length > 0 && story.chapters.every((chapter) => chapter.content !== null)}
          isPending={generateChaptersMediaMutation.isPending}
        />
        <Step
          title="Generate full story media"
          done={story.audio_url !== null}
          canProceed={!generateStoryMediaMutation.isPending}
          callMethod={() => generateStoryMediaMutation.mutate()}
          previousStepDone={story.chapters.length > 0 && story.chapters.every((chapter) => chapter!.audio_url !== null)}
          isPending={generateStoryMediaMutation.isPending}
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
          isPending={publishToYoutubeMutation.isPending}
        />
      </CardContent>

      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Story Name</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to regenerate the story name? This will update the folder name and all associated media URLs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateName}
              disabled={regenerateStoryNameMutation.isPending}
            >
              {regenerateStoryNameMutation.isPending ? "Regenerating..." : "Regenerate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default CreateStoryCard;
