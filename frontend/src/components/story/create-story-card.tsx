import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TypeDto } from "@/services/api-client";
import Spinner from "../common/spinner";

interface CreateStoryCardProps {
  title: string;
  description: string;
  type: TypeDto;
}

export function CreateStoryCard({ title, type }: CreateStoryCardProps) {
  const queryClient = useQueryClient();

  const createStoryMutation = useMutation({
    mutationFn: () => api.createAndGenerate({ data: { types_id: type.id } }),
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
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "group flex items-center gap-2",
        "text-muted-foreground hover:text-foreground",
        "transition-colors duration-200"
      )}
      onClick={() => createStoryMutation.mutate()}
      disabled={createStoryMutation.isPending}
    >
      {createStoryMutation.isPending ? (
        <Spinner size={16} />
      ) : (
        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      )}
      <span className="font-normal">{title}</span>
    </Button>
  );
}
