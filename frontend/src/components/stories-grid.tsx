import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface StoriesGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StoriesGrid({ children, className }: StoriesGridProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StoriesSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  publishedContent?: React.ReactNode;
  createButton?: React.ReactNode;
}

export function StoriesSection({ 
  title, 
  children, 
  className, 
  publishedContent,
  createButton 
}: StoriesSectionProps) {
  const [showPublished, setShowPublished] = useState(false);

  return (
    <section className={cn("space-y-6", className)}>
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-medium tracking-tight">{title}</h2>
            {createButton}
          </div>
          {publishedContent && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setShowPublished(!showPublished)}
            >
              {showPublished ? (
                <>
                  Hide published
                  <ChevronUp className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  Show published
                  <ChevronDown className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      <StoriesGrid>
        {children}
      </StoriesGrid>
      {showPublished && publishedContent && (
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-4">Published stories</div>
          <StoriesGrid>
            {publishedContent}
          </StoriesGrid>
        </div>
      )}
    </section>
  );
} 