import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateStoryButtonProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function CreateStoryCard({ title, onClick }: CreateStoryButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "group flex items-center gap-2",
        "text-muted-foreground hover:text-foreground",
        "transition-colors duration-200"
      )}
      onClick={onClick}
    >
      <Plus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
      <span className="font-normal">{title}</span>
    </Button>
  );
}
