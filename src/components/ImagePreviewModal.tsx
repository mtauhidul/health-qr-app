import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ImagePreviewModalProps {
  images: File[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function ImagePreviewModal({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Create image URLs for preview
  useEffect(() => {
    const urls: string[] = [];

    // Create object URLs for each image
    images.forEach((image) => {
      const url = URL.createObjectURL(image);
      urls.push(url);
    });

    setImageUrls(urls);

    // Clean up URLs when component unmounts
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // Reset current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl p-4">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-background/50 hover:bg-background/80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </Button>

        {/* Image container */}
        <div className="flex items-center justify-center bg-card rounded-lg overflow-hidden h-[80vh]">
          {imageUrls[currentIndex] ? (
            <img
              src={imageUrls[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="bg-background/50 hover:bg-background/80 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="sr-only">Previous</span>
          </Button>
        </div>

        <div className="absolute inset-y-0 right-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="bg-background/50 hover:bg-background/80 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Image info and pagination */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="inline-block px-4 py-2 bg-background/70 backdrop-blur-sm rounded-full">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length} -{" "}
              {images[currentIndex]?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
