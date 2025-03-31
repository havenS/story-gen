import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TypeDto } from "@/services/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/common/spinner";

interface CreateStoryButtonProps {
  type: TypeDto;
}

function CreateStoryButton({ type }: CreateStoryButtonProps) {
  const queryClient = useQueryClient();

  const createStoryMutation = useMutation({
    mutationFn: () => api.createAndGenerateStory({ data: { types_id: type.id } }),
    onSuccess: () => {
      // Invalidate both type-specific and all stories queries
      queryClient.invalidateQueries({ queryKey: [`${type.id}-stories`] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create and generate story. Please try again.";
      alert(errorMessage);
      console.error("Error creating story:", error);
      // Still invalidate queries to ensure UI is in sync
      queryClient.invalidateQueries({ queryKey: [`${type.id}-stories`] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>New Story</CardTitle>
        <CardDescription>
          Create and generate a new {type.name?.toLocaleLowerCase()} story
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex flex-col items-center gap-2 w-full">
          {createStoryMutation.isPending ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner size={24} />
              <span className="text-sm text-muted-foreground">Generating story...</span>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => createStoryMutation.mutate()}
              disabled={createStoryMutation.isPending}
            >
              Create & Generate
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default CreateStoryButton;
