import { Skeleton } from "@/components/ui/skeleton";

interface CardImageProps {
  src: string;
  videoUrl?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function CardImage({ src, videoUrl }: CardImageProps) {
  if (!src)
    return (
      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );

  if (videoUrl) {
    return (
      <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black/5">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          controls
          poster={`${API_URL}/generation/${src}`}
        >
          <source src={`${API_URL}/generation/${videoUrl}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-black/5">
      <img
        className="absolute inset-0 w-full h-full object-cover transition-all duration-200 hover:scale-105"
        src={`${API_URL}/generation/${src}`}
        alt="cover"
      />
    </div>
  );
}
