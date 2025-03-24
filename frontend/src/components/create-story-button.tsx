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
import Spinner from "./spinner";

interface CreateStoryButtonProps {
  type: TypeDto;
}

function CreateStoryButton({ type }: CreateStoryButtonProps) {
  const queryClient = useQueryClient();

  const createStoryMutation = useMutation({
    mutationFn: () => api.createAndGenerateFullStory({ data: { types_id: type.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[`${type.id}-stories`]] });
      alert("Story created and generated successfully!");
    },
    onError: (error) => {
      alert("Failed to create and generate story. Please try again.");
      console.error("Error creating story:", error);
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
