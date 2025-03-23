import { StoryDto } from "@/services/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

interface StoryCardProps {
  story: StoryDto;
}

function Step({
  title,
  done,
  callMethod,
  canProceed = true,
  canRetry = false,
  previousStepDone = true,
}: {
  title: string;
  done: boolean;
  callMethod?: () => void;
  canProceed?: boolean;
  canRetry?: boolean;
  previousStepDone?: boolean;
}) {
  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex flex-row">
        <span
          className={cn(
            "flex",
            "h-2",
            "w-2",
            "translate-y-1",
            "rounded-full",
            done ? "bg-green-500" : "bg-red-500"
          )}
        />
        <p className="text-sm font-medium leading-none ml-2">{title}</p>
      </div>
      {(!done || canRetry) && canProceed && callMethod && previousStepDone ? (
        <Button className="h-8 px-4" onClick={callMethod}>
          {done && canRetry ? "Refresh" : "Proceed"}
        </Button>
      ) : (
        <div />
      )}
    </div>
  );
}

function CardImage({ src, videoUrl }: { src: string; videoUrl?: string }) {
  if (!src)
    return (
      <div className="flex flex-row justify-center">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      </div>
    );

  if (videoUrl) {
    return (
      <video
        className="w-full"
        controls
        poster={`http://localhost:3001/generation/${src}`}
      >
        <source
          src={`http://localhost:3001/generation/${videoUrl}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      className="w-full"
      src={`http://localhost:3001/generation/${src}`}
      alt="cover"
    />
  );
}

function CreateStoryCard({ story }: StoryCardProps) {
  const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: (storyId: string) => api.generateStoryBackgroundImage(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [[`${story.types_id}-stories`]],
      });
    },
  });

  const generateChaptersContentMutation = useMutation({
    mutationFn: (storyId: string) => api.generateChapterContent(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [[`${story.types_id}-stories`]],
      });
    },
  });

  const generateChaptersMediaMutation = useMutation({
    mutationFn: (storyId: string) => api.generateStoryChapterMedia(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [[`${story.types_id}-stories`]],
      });
    },
  });

  const generateStoryMediaMutation = useMutation({
    mutationFn: (storyId: string) => api.generateFullStoryMedia(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [[`${story.types_id}-stories`]],
      });
    },
  });

  const publishToYoutubeMutation = useMutation({
    mutationFn: async (storyId: string) => {
      // First refresh YouTube connection
      const refreshResponse = await api.getYoutubeAuthUrl();
      if (refreshResponse.data) {
        window.open(refreshResponse.data, "_blank");
      }
      // Then publish to YouTube
      return api.publishYoutube(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [[`${story.types_id}-stories`]],
      });
    },
  });

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardImage
          src={story.thumbnail_url ?? story.background_image}
          videoUrl={story.video_url}
        />
        <CardTitle>{story.name}</CardTitle>
        <CardDescription>{story.synopsis}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Step title="Generate info" done={true} />
        <Step
          title="Generate image"
          canRetry
          done={story.background_image !== null}
          canProceed={!generateImageMutation.isPending}
          callMethod={() => generateImageMutation.mutate(`${story.id}`)}
          previousStepDone={true}
        />
        <Step
          title="Generate chapters content"
          done={story.chapters.every((chapter) => chapter.content !== null)}
          canProceed={!generateChaptersContentMutation.isPending}
          callMethod={() =>
            generateChaptersContentMutation.mutate(`${story.id}`)
          }
          previousStepDone={story.background_image !== null}
        />
        <Step
          title="Generate chapters media"
          done={story.chapters.every((chapter) => chapter.audio_url !== null)}
          canProceed={!generateChaptersMediaMutation.isPending}
          callMethod={() => generateChaptersMediaMutation.mutate(`${story.id}`)}
          previousStepDone={story.chapters.every((chapter) => chapter.content !== null)}
        />
        <Step
          title="Generate full story media"
          done={story.audio_url !== null}
          canProceed={!generateStoryMediaMutation.isPending}
          callMethod={() => generateStoryMediaMutation.mutate(`${story.id}`)}
          previousStepDone={story.chapters.every((chapter) => chapter.audio_url !== null)}
        />
        <Step
          title="Publish to Youtube"
          done={
            story.publishings!.length > 0 &&
            story.publishings![0].youtube_id !== null
          }
          canProceed={!publishToYoutubeMutation.isPending}
          callMethod={() => publishToYoutubeMutation.mutate(`${story.id}`)}
          previousStepDone={story.audio_url !== null}
        />
        {/* <Step title="Publish to Patreon" done={false} callMethod={() => {}} /> */}
      </CardContent>
    </Card>
  );
}

export default CreateStoryCard;
