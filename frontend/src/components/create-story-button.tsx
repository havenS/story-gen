import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { CreateStoryDto, TypeDto } from "@/services/api-client";
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
    mutationFn: (data: CreateStoryDto) => api.createStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [[`${type.id}-stories`]] });
    },
  });

  return (
    <Card className={cn("w-[380px]")}>
      <CardHeader>
        <CardTitle>New Story</CardTitle>
        <CardDescription>
          Create a new {type.name?.toLocaleLowerCase()} story
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex justify-center items-center w-full">
          {createStoryMutation.isPending ? (
            <Spinner size={24} />
          ) : (
            <Button
              className="w-full"
              onClick={() => createStoryMutation.mutate({ types_id: type.id })}
            >
              Start creation
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default CreateStoryButton;
