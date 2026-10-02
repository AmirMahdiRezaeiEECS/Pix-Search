import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageDocument } from "@/lib/meilisearch";
import { Badge } from "@/components/ui/badge";

interface ImageModalProps {
  image: ImageDocument | null;
  onClose: () => void;
}

export const ImageModal = ({ image, onClose }: ImageModalProps) => {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Image Details</DialogTitle>
          <DialogDescription>
            View full image and specifications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <img
            src={image.url}
            alt={`${image.width}x${image.height} ${image.format}`}
            className="w-full h-auto rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Dimensions:</span>
              <p className="font-medium">{image.width} × {image.height} px</p>
            </div>
            <div>
              <span className="text-muted-foreground">Format:</span>
              <div className="mt-1">
                <Badge variant="secondary" className="uppercase">
                  {image.format}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">File Size:</span>
              <p className="font-medium">{(image.size / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <span className="text-muted-foreground">URL:</span>
              <p className="font-medium truncate">
                <a
                  href={image.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open in new tab
                </a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
