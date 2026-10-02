import { useState } from "react";
import { ImageDocument } from "@/lib/meilisearch";

interface ImageCardProps {
  image: ImageDocument;
  onClick?: () => void;
  priority?: boolean;
}

export const ImageCard = ({ image, onClick, priority = false }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="group relative overflow-hidden aspect-square bg-muted cursor-pointer hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:1000px_100%]" />
      )}
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
          Failed to load
        </div>
      ) : (
        <img
          src={image.url}
          alt={`Image ${image.width}x${image.height}`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      )}
    </div>
  );
};
